/**************************************************************************
 * IMPORTS
 **************************************************************************/

const { Server }    = require("socket.io");
const cookie        = require("cookie");
const jwt           = require("jsonwebtoken");

const userModel     = require("../models/user.model");
const messageModel  = require("../models/ai.model");
// const aiService     = require("../services/ai.service");
const aiService     = require("../services/backup.service");


;

const {
    createMemory,
    queryMemory
} = require("../services/quadVecotr.service");


/**************************************************************************
 * SOCKET SERVER INITIALIZATION
 **************************************************************************/

function initSocketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL, // Frontend URL from environment
            methods: ['GET','POST'],
            credentials: true
        }
    });


    /**************************************************************************
     * AUTHENTICATION MIDDLEWARE
     **************************************************************************/

    io.use(async (socket, next) => {

        try {

            const cookies = cookie.parse(
                socket.handshake.headers?.cookie || ""
            );

            if (!cookies.token) {
                return next(new Error("Authentication Error"));
            }

            const decoded = jwt.verify(
                cookies.token,
                process.env.JWT_SECRET
            );

            const user = await userModel.findById(decoded.id);

            if (!user) {
                return next(new Error("User Not Found"));
            }

            socket.user = user;

            next();

        } catch (err) {
            next(new Error("Authentication Error"));
        }
    });


    /**************************************************************************
     * CONNECTION EVENT
     **************************************************************************/

    io.on("connection", (socket) => {

        console.log("User Connected:", socket.user._id);


        /**************************************************************************
         * AI MESSAGE HANDLER
         **************************************************************************/

        socket.on("ai-message", async (message) => {

            try {

                console.log("Received AI Message:", message);


                /**************************************************************
                 * VALIDATION
                 **************************************************************/

                if (!message?.content || !message?.chat) {
                    return socket.emit("error", {
                        message: "content and chat fields are required"
                    });
                }


                /**************************************************************
                 * STEP 1 — SAVE USER MESSAGE TO MONGODB
                 *
                 * OLD APPROACH:
                 *   Three sequential awaits:
                 *     1. messageModel.create(...)
                 *     2. aiService.Generatevector(...)
                 *     3. createMemory(...)
                 *
                 * PROBLEM:
                 *   Each operation waited for the previous one to finish before
                 *   starting, even though embedding generation (step 2) does NOT
                 *   depend on the DB write result, and the Qdrant write (step 3)
                 *   depends on BOTH step 1 (for messageId) AND step 2 (for vectors).
                 *   This serialized work that could partially overlap.
                 *
                 * ORIGINAL BROKEN Promise.all ATTEMPT:
                 *   The original code attempted:
                 *     const [userMessage, vectors] = await Promise.all([
                 *         await messageModel.create(...),      // ← BUG: "await" here defeats parallelism
                 *         aiService.Generatevector(...),
                 *         await createMemory({ vectors, ... }) // ← BUG: "vectors" is undefined here;
                 *     ]);                                      //   Promise.all starts all at once, so
                 *                                              //   "vectors" from step 2 is not yet resolved.
                 *                                              //   Also: "userMessage._id" is not yet resolved.
                 *
                 * OPTIMIZED APPROACH:
                 *   Run messageModel.create and aiService.Generatevector TRULY in
                 *   parallel (neither depends on the other). Then, once BOTH resolve,
                 *   call createMemory which needs results from both.
                 *
                 * BENEFIT:
                 *   Saves wall-clock time equal to max(DB_write, embedding_gen)
                 *   instead of DB_write + embedding_gen.
                 *   Also fixes the undefined-variable runtime crash.
                 **************************************************************/

                const [userMessage, userVectors] = await Promise.all([
                    messageModel.create({
                        chat:    message.chat,
                        user:    socket.user._id,
                        content: message.content,
                        role:    "user"
                    }),
                    aiService.Generatevector(message.content)
                ]);

                // createMemory requires both userMessage._id (from DB) and
                // userVectors (from embedding), so it must run after the parallel
                // pair above resolves.  This is a genuine sequential dependency.
                await createMemory({
                    vectors:   userVectors,
                    messageId: userMessage._id.toString(),
                    metadata: {
                        chat: message.chat,
                        user: socket.user._id,
                        text: message.content
                    }
                });

                console.log("User memory stored successfully");


                /**************************************************************
                 * STEP 2 — FETCH LONG-TERM MEMORY (LTM) FROM QDRANT
                 *
                 * Uses the embedding generated in STEP 1 to retrieve the top-5
                 * semantically similar past messages for this user.
                 **************************************************************/

                const memory = await queryMemory({
                    queryVector: userVectors,
                    userId:      socket.user._id.toString(),
                    limit:       5
                });

                console.log("Retrieved Memories:", memory.length);


                /**************************************************************
                 * STEP 3 — FETCH SHORT-TERM MEMORY (STM) FROM MONGODB
                 *
                 * Pulls the 10 most recent messages in this chat, then reverses
                 * them so they are in chronological order for the model.
                 **************************************************************/

                const chatHistory = (
                    await messageModel
                        .find({ chat: message.chat })
                        .sort({ createdAt: -1 })
                        .limit(10)
                        .lean()
                ).reverse();


                /**************************************************************
                 * STEP 4 — FORMAT STM FOR GEMINI-STYLE HISTORY ARRAY
                 **************************************************************/

                const stm = chatHistory.map((item) => ({
                    role:  item.role,
                    parts: [{ text: item.content }]
                }));


                /**************************************************************
                 * STEP 5 — FORMAT LTM AS A PRIMING CONTEXT TURN
                 *
                 * Injected as the first "user" turn so the model has relevant
                 * long-term context without polluting the real conversation turns.
                 **************************************************************/

                const ltmText =
                    memory.length > 0
                        ? memory
                              .map((item) => item.payload?.text)
                              .filter(Boolean)
                              .join("\n")
                        : "No relevant memories found.";

                const ltm = [
                    {
                        role:  "user",
                        parts: [
                            {
                                text: `These are some previous chats from the user.\n\nUse them only when relevant.\n\n${ltmText}`
                            }
                        ]
                    }
                ];

                console.log("LTM context:", ltm[0]);
                console.log("STM history:", stm);


                /**************************************************************
                 * STEP 6 — GENERATE AI RESPONSE (STM + LTM COMBINED)
                 **************************************************************/

                const response = await aiService.GenerateResponse([
                    ...ltm,
                    ...stm
                ]);


                /**************************************************************
                 * STEP 7 — SEND RESPONSE TO CLIENT IMMEDIATELY
                 *
                 * OLD APPROACH:
                 *   The original code saved the AI response to MongoDB and Qdrant
                 *   BEFORE emitting it to the client, forcing the user to wait for
                 *   both storage operations to complete.
                 *
                 * PROBLEM:
                 *   Saving to MongoDB and generating a new embedding for the response
                 *   are NOT required for the client to receive the message.  Making
                 *   the user wait for them increases perceived latency unnecessarily.
                 *
                 * OPTIMIZED APPROACH:
                 *   Emit the response to the client first, then kick off the
                 *   persistence work as a fire-and-forget background process.
                 *
                 * WHY IT IS SAFE:
                 *   - The response content is already in memory; it cannot be lost
                 *     between the emit and the DB write.
                 *   - If the background write fails, only the long-term memory index
                 *     is affected.  The conversation is still visible to the client.
                 *   - Any retry / dead-letter strategy for failed writes can be
                 *     handled independently without blocking the user.
                 *
                 * BENEFIT:
                 *   Client receives the answer in ~0 ms after the model responds,
                 *   instead of waiting an extra DB_write + embedding_gen round-trip.
                 **************************************************************/

                socket.emit("ai-response", {
                    content: response,
                    chat:    message.chat
                });

                console.log("AI Response sent to client:", response);


                /**************************************************************
                 * STEP 8 — PERSIST AI RESPONSE IN BACKGROUND (NON-BLOCKING)
                 *
                 * OLD APPROACH (commented out below):
                 *   Sequential:
                 *     1. messageModel.create(response)
                 *     2. aiService.Generatevector(response)
                 *     3. createMemory(...)
                 *   All three ran BEFORE the socket.emit, blocking the user.
                 *
                 *   // const responseMessage = await messageModel.create({...});
                 *   // const responseVectors  = await aiService.Generatevector(response);
                 *   // await createMemory({ vectors: responseVectors, ... });
                 *
                 * PROBLEM:
                 *   Sequential + client-blocking: 3× latency added to every turn.
                 *
                 * OPTIMIZED APPROACH:
                 *   - Run the DB write and embedding generation in parallel (they are
                 *     independent of each other).
                 *   - Run createMemory after both resolve (genuine dependency).
                 *   - Wrap everything in a self-contained async IIFE so it runs in
                 *     the background without blocking the current event-loop tick.
                 *
                 * WHICH TASKS ARE PARALLEL vs SEQUENTIAL:
                 *   PARALLEL  → messageModel.create  +  aiService.Generatevector
                 *   SEQUENTIAL → createMemory (needs _id from DB AND vectors from embedding)
                 *
                 * BENEFIT:
                 *   Zero added latency for the user; storage happens concurrently
                 *   with the user already reading their response.
                 **************************************************************/

                (async () => {
                    try {

                        const [responseMessage, responseVectors] = await Promise.all([
                            messageModel.create({
                                chat:    message.chat,
                                user:    socket.user._id,
                                content: response,
                                role:    "model"
                            }),
                            aiService.Generatevector(response)
                        ]);

                        await createMemory({
                            vectors:   responseVectors,
                            messageId: responseMessage._id.toString(),
                            metadata: {
                                chat: message.chat,
                                user: socket.user._id,
                                text: response
                            }
                        });

                        console.log("AI response persisted to MongoDB and Qdrant");

                    } catch (backgroundErr) {

                        // Background persistence failures should NOT crash the
                        // handler or affect the already-delivered client response.
                        // Log for observability; add a retry / alerting mechanism
                        // here if durability of the memory index is critical.
                        console.error(
                            "Background persistence error (non-fatal):",
                            backgroundErr
                        );
                    }
                })();


            } catch (err) {

                console.error("AI Message Error:", err);

                socket.emit("error", {
                    message: err.message || "Internal Server Error"
                });
            }
        });


        /**************************************************************************
         * DISCONNECT EVENT
         **************************************************************************/

        socket.on("disconnect", () => {
            console.log("User Disconnected:", socket.id);
        });
    });
}

module.exports = initSocketServer;
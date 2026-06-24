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
            origin: 'http://localhost:5173',
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


               
               const [userMessage, userVectors] = await Promise.all([
                    messageModel.create({
                        chat: message.chat,
                        user: socket.user._id,
                        content: message.content,
                        role: "user"
                    }),
                    aiService.GenerateVector(message.content)
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
                 * STEP 4 — FORMAT STM FOR GROQ / OPENAI FORMAT
                 **************************************************************/

                // GEMINI VERSION
                // const stm = chatHistory.map((item) => ({
                //     role: item.role,
                //     parts: [{ text: item.content }]
                // }));

                const stm = chatHistory.map((item) => ({
                    role:    item.role === "model" ? "assistant" : "user",
                    content: item.content
                }));


                /**************************************************************
                 * STEP 5 — FORMAT LTM FOR GROQ / OPENAI FORMAT
                 **************************************************************/

                const ltmText =
                    memory.length > 0
                        ? memory
                              .map((item) => item.payload?.text)
                              .filter(Boolean)
                              .join("\n")
                        : "No relevant memories found.";

                // // GEMINI VERSION
                // const ltm = [
                //     {
                //         role: "user",
                //         parts: [
                //             {
                //                 text: `These are some previous chats from the user.\n\nUse them only when relevant.\n\n${ltmText}`
                //             }
                //         ]
                //     }
                // ];

                const ltm = [
                    {
                        role:    "user",
                        content: `These are some previous chats from the user.\nUse them only when relevant.\n${ltmText}`
                    }
                ];

                console.log("LTM context:", ltm[0]);
                console.log("STM history:", stm);


                /**************************************************************
                 * STEP 6 — GENERATE AI RESPONSE (STM + LTM COMBINED)
                 **************************************************************/

                // GEMINI VERSION
                // const response = await aiService.GenerateResponse([
                //     ...ltm,
                //     ...stm
                // ]);

                const response = await aiService.GenerateResponse([
                    ...ltm,
                    ...stm,
                    {
                        role:    "user",
                        content: message.content
                    }
                ]);


                /**************************************************************
                 **************************************************************/

                socket.emit("ai-response", {
                    content: response,
                    chat:    message.chat
                });

                console.log("AI Response sent to client:", response);


                /**************************************************************
                 **************************************************************/

                (async () => {
                    try {

                       const [responseMessage, responseVectors] = await Promise.all([
                            messageModel.create({
                                chat: message.chat,
                                user: socket.user._id,
                                content: response,
                                role: "model"
                            }),
                            aiService.GenerateVector(response)
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
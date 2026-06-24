const { Mistral } = require("@mistralai/mistralai");
const { GoogleGenAI } = require("@google/genai");


/**************************************************************************
 * GEMINI CLIENT CONFIGURATION
 **************************************************************************/

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
});


/**************************************************************************
 * CHAT RESPONSE
 **************************************************************************/

async function GenerateResponse(content) {

    const response = await client.chat.complete({
        model: "mistral-large-latest",

        messages: [
            {
                role: "system",
                content: "You are Aurora, a helpful AI assistant."
            },
            {
                role: "user",
                content
            }
        ],

        temperature: 0.7
    });

    return response.choices[0].message.content;
}

/**************************************************************************
 * EMBEDDINGS (768 DIMENSIONS)
 **************************************************************************/


async function Generatevector(content) {

    const response =
        await ai.models.embedContent({
            model: "gemini-embedding-2",

            contents: content,

            config: {
                outputDimensionality: 768
            }
        });

    // Return embedding vector
    return response.embeddings[0].values;
}

module.exports = {
    GenerateResponse,
    GenerateVector
};
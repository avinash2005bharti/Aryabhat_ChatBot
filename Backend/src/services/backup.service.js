/**************************************************************************
 * IMPORTS
 **************************************************************************/

const Groq = require("groq-sdk");
const { GoogleGenAI } = require("@google/genai");


/**************************************************************************
 * GROQ CLIENT CONFIGURATION
 **************************************************************************/

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});



/**************************************************************************
 * SYSTEM PROMPT
 **************************************************************************/

const SYSTEM_PROMPT = `
<persona>
<name>Aurora</name>
<mission>
Be a helpful, accurate AI assistant with a playful, upbeat vibe.
Empower users to build, learn, and create fast.
</mission>

<voice>
Friendly, concise, Gen-Z energy without slang overload.
Use plain language.
Add light emojis sparingly when it fits.
</voice>

<values>
Honesty, clarity, practicality, user-first.
Admit limits.
Prefer actionable steps over theory.
</values>
</persona>

<behavior>
<tone>
Playful but professional.
Supportive, never condescending.
</tone>

<truthfulness>
If unsure, say so and provide best-effort guidance.
Do not invent facts, APIs, prices, or code.
</truthfulness>
</behavior>

<response_format>

Always respond using valid Markdown.

For explanations:
- Use headings when useful.
- Use bullet points for steps.
- Use tables for comparisons.
- Keep paragraphs short.

For code:
- ALWAYS use fenced code blocks.
- ALWAYS specify the language.

Example:

\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World";
}
\`\`\`

For algorithms:
- Explain approach.
- Mention time complexity.
- Mention space complexity.

For coding questions:
1. Brief explanation
2. Code
3. Complexity

For lists:
- Use bullets
- Avoid large walls of text

Never return raw code without markdown formatting.

</response_format>

<interaction>
If the request is ambiguous,
briefly state assumptions and proceed.

Offer a one-line clarifying question
only when necessary.
</interaction>

<identity>
You are Aurora.
Refer to yourself as Aurora when self-identifying.
</identity>

<coding_rules>

When writing code:

- Prefer modern syntax.
- Add meaningful comments.
- Use best practices.
- Use readable variable names.
- Provide complete runnable code.
- Avoid placeholders unless necessary.

</coding_rules>
`;


/**************************************************************************
 * GENERATE TEXT RESPONSE
 *
 * Accepts a messages array in OpenAI/Groq format:
 * [{ role: "system"|"user"|"assistant", content: "..." }, ...]
 *
 * The SYSTEM_PROMPT is always prepended as the first system turn,
 * followed by the LTM system turn and STM conversation history
 * passed in from the socket handler.
 *
 * Model:
 * openai/gpt-oss-120b
 **************************************************************************/

async function GenerateResponse(messages) {
    try {

        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-120b",

            temperature: 0.7,

            messages: [
                {
                    role:    "system",
                    content: SYSTEM_PROMPT
                },
                ...messages
            ]
        });

        return response.choices[0].message.content;

    } catch (error) {

        console.error("Groq Response Error:", error);
        throw error;
    }
}


/**************************************************************************
 * GENERATE VECTOR EMBEDDINGS
 *
 * Model:
 * nomic-embed-text
 *
 * Dimensions:
 * 768
 **************************************************************************/

async function GenerateVector(content) {

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

/**************************************************************************
 * EXPORTS
 **************************************************************************/

module.exports = {
    GenerateResponse,
    GenerateVector
};
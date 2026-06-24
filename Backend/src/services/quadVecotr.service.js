const { QdrantClient } = require("@qdrant/js-client-rest");
const crypto = require("crypto");

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = "cohort-gpt";

async function initCollection() {

    const collections =
        await client.getCollections();

    const exists =
        collections.collections.some(
            (c) => c.name === COLLECTION_NAME
        );

    if (!exists) {

        await client.createCollection(
            COLLECTION_NAME,
            {
                vectors: {
                    size: 768,
                    distance: "Cosine",
                },
            }
        );

        console.log("Collection Created");

        await client.createPayloadIndex(
            COLLECTION_NAME,
            {
                field_name: "user",
                field_schema: "keyword"
            }
        );

        console.log("Payload Index Created");
    }
}
initCollection();

async function createMemory({
    vectors,
    metadata,
    messageId
}) {

    await client.upsert(COLLECTION_NAME, {

        wait: true,

        points: [
            {
                id: crypto.randomUUID(),

                vector: vectors,

                payload: {
                    chat:
                        metadata.chat.toString(),

                    user:
                        metadata.user.toString(),

                    text:
                        metadata.text
                },
            },
        ],
    });

    console.log("Memory Stored");
}

async function queryMemory({
    queryVector,
    limit = 5
}) {

    const results = await client.search(
        COLLECTION_NAME,
        {
            vector: queryVector,
            limit: limit
        }
    );

    return results;
}
module.exports = {
    createMemory,
    queryMemory,
};
const chatModel = require('../models/chat.model');
const messageModel = require('../models/ai.model');

async function createChat(req, res) {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    });

    res.status(201).json({
        message: "Chat Created Successfully",
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity
        }
    });
}

async function getChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({
        user: user._id
    });

    res.status(200).json({
        message: "Chats Retrieved Successfully",
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

async function getChatMessages(req, res) {

    try {

        const { chatId } = req.params;

        const messages = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 });

        res.status(200).json({
            message: "Messages Retrieved Successfully",
            messages
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Internal Server Error"
        });

    }

}


async function deleteChat(req, res) {

    try {

        const { chatId } = req.params;

        await messageModel.deleteMany({
            chat: chatId
        });

        await chatModel.findByIdAndDelete(chatId);

        res.status(200).json({
            message: "Chat Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

}

module.exports = {
    createChat,
    getChats,
    getChatMessages,
    deleteChat
};
const express = require('express');
const authRoutes = require('../middlewares/auth.middleware')
const chatController = require('../controllers/chat.control')



const router = express.Router();
// Create new chat
router.post('/', authRoutes.authUser, chatController.createChat)

// Get all chats for a user
router.get('/', authRoutes.authUser, chatController.getChats)

//Get all chats from db
 router.get('/:chatId/messages',authRoutes.authUser,chatController.getChatMessages)

//  Delete chat 
router.delete("/:chatId",authRoutes.authUser,chatController.deleteChat);


module.exports = router;




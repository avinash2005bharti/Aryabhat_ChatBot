const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes')
const settingRoutes = require('./routes/settings.routes')
const cors = require('cors');

// Calling express
const app = express(); 

// CORS Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL, // Frontend URL from environment
    credentials: true, // Allow cookies to be sent
}));



// Using MiddleWares

app.use(express.json());
app.use(cookieParser());

// Setting Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/setting',settingRoutes);




module.exports = app;


const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const settingRoutes = require("./routes/settings.routes");

// Create Express App
const app = express();

// =====================
// Middlewares
// =====================

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// =====================
// Static React Build
// =====================

const frontendPath = path.join(__dirname, "../public/dist");

app.use(express.static(frontendPath));

// =====================
// API Routes
// =====================

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/setting", settingRoutes);

// =====================
// React Routes (Express 5)
// =====================

app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// =====================

module.exports = app;
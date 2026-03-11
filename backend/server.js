const express = require("express");
const cors = require("cors");
const session = require("express-session");
const errorHandler = require("./middleware/errorMiddleware");
const passport = require("passport");
const { initializeDatabase } = require("./config/database");
require("dotenv").config();
const logger = require("./utils/logger");
const requestLogger = require("./middleware/requestLogger");
const errorHandler_log = require("./middleware/errorHandler");

initializeDatabase()
    .then(() => {
        console.log("Init done");
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

console.log("Loading passport config...");
require("./config/passport");

console.log("Loading auth routes...");
const authRoutes = require("./routes/auth");
console.log("Auth routes loaded successfully");

console.log("Loading chat routes...");
const chatRoutes = require("./routes/chat");
console.log("Chat routes loaded successfully");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

app.use(errorHandler_log);
app.use(errorHandler);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(requestLogger);
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

app.use(
    cors({
        origin: `${HOST}`,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === "production" },
    })
);

app.use(passport.initialize());
app.use(passport.session());

console.log("Registering auth routes...");
app.use("/api/auth", authRoutes);
console.log("Auth routes registered");

console.log("Registering chat routes...");
app.use("/api/chat", chatRoutes);
console.log("Chat routes registered");

app.get("/", (req, res) => {
    res.json({ message: "SmartChef API is running!" });
});

app.use("*", (req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        error: "Route not found",
        requested: `${req.method} ${req.originalUrl}`,
        available_routes: [
            "GET /",
            "POST /api/auth/register",
            "POST /api/auth/login",
            "GET /api/auth/profile",
            "GET /api/auth/google",
            "GET /api/auth/google/callback",
            "POST /api/chat/message",
            "GET /api/chat/history",
            "GET /api/chat/:chatId/messages",
            "DELETE /api/chat/:chatId",
        ],
    });
});

app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || "Something went wrong!",
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logger.info("Server is starting on Port:", PORT);
});

module.exports = app;

// server/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

const connectDatabase = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const modRoutes = require("./routes/modRoutes");
const gameRoutes = require("./routes/gameRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userModRoutes = require("./routes/userModRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin:
      process.env.CLIENT_PORT ||
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

// ===============================
// Database
// ===============================
connectDatabase();

// ===============================
// Static uploads
// ===============================
// Доступ до картинок, файлів модів, скріншотів:
// http://localhost:5000/uploads/...
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================
// API routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mods", modRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/user-mods", userModRoutes);

// Перевірка роботи API
app.get("/api/ping", (req, res) => {
  res.json({
    message: "Mods Service API працює ✅",
  });
});

// ВАЖЛИВО:
// Якщо API route не знайдено — повертаємо JSON, а не React index.html.
// Це виправляє помилку:
// Unexpected token '<', "<!DOCTYPE "... is not valid JSON
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ===============================
// React / Vite production build
// ===============================
const clientDistPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientDistPath));

// SPA fallback тільки для НЕ API маршрутів
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// ===============================
// Global error handler
// ===============================
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(500).json({
    message: "Внутрішня помилка сервера",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// ===============================
// Start server
// ===============================
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порту ${PORT}`);
  });
}

module.exports = app;
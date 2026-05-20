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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_PORT || process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

// Підключення до бази даних
connectDatabase();

// Статичні файли: картинки, файли модів, скріншоти
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API маршрути
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/mods", modRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/categories", categoryRoutes);

// Перевірка роботи API
app.get("/api/ping", (req, res) => {
  res.json({
    message: "Mods Service API працює ✅",
  });
});

// Статика React / Vite production build
const clientDistPath = path.join(__dirname, "../client/dist");

app.use(express.static(clientDistPath));

// Всі інші маршрути віддають React SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// Глобальний обробник помилок
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  res.status(500).json({
    message: "Внутрішня помилка сервера",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

// Запуск серверу
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущено на порту ${PORT}`);
  });
}

module.exports = app;
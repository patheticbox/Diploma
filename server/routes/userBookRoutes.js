const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth");
const UserBookStatus = require("../models/UserBookStatus");

// Отримати всі статуси книг конкретного користувача
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const statuses = await UserBookStatus.find({ user: userId })
      .populate("book")
      .select("book liked list")
      .lean();

    res.json({ statuses });
  } catch (err) {
    console.error("Get book statuses error:", err);
    res.status(500).json({ message: "Помилка отримання статусів книг" });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    await UserBookStatus.deleteMany({ user: userId });

    res.json({ message: "Всі статуси книг очищено" });
  } catch (err) {
    res.status(500).json({ message: "Помилка очищення" });
  }
});
// Оновити лайк або список для книги
router.post("/:bookId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { bookId } = req.params;
    const { liked, list } = req.body;

    const allowedLists = [
      "Прочитано",
      "Сподобалось",
      "Читаю",
      "Прочитаю колись",
      "",
    ];

    if (list !== undefined && !allowedLists.includes(list)) {
      return res.status(400).json({ message: "Некоректний список" });
    }

    const updateData = {};

    if (liked !== undefined) updateData.liked = liked;
    if (list !== undefined) updateData.list = list;

    const status = await UserBookStatus.findOneAndUpdate(
      { user: userId, book: bookId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ status });
  } catch (err) {
    console.error("Update book status error:", err);
    res.status(500).json({ message: "Помилка оновлення статусу книги" });
  }
});

module.exports = router;
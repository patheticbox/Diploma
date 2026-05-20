const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth");
const {
  getContentBasedRecommendations,
  getCollaborativeRecommendations,
  getHybridRecommendations,
} = require("../services/recommendationService");

router.get("/content-based", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const recommendations = await getContentBasedRecommendations(userId);

    res.json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка Content-Based рекомендацій" });
  }
});

router.get("/collaborative", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const recommendations = await getCollaborativeRecommendations(userId);

    res.json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка Collaborative рекомендацій" });
  }
});

router.get("/hybrid", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const recommendations = await getHybridRecommendations(userId);

    res.json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка Hybrid рекомендацій" });
  }
});

module.exports = router;
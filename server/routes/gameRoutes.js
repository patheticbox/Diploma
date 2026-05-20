const express = require("express");
const router = express.Router();

const Game = require("../models/Game");

// GET /api/games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().sort({ title: 1 });

    res.json({
      games,
    });
  } catch (error) {
    console.error("Games route error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET /api/games/:id
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        message: "Гру не знайдено",
      });
    }

    res.json({
      game,
    });
  } catch (error) {
    console.error("Get game error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
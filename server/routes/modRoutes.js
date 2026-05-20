const express = require("express");
const router = express.Router();

const Mod = require("../models/Mod");

// GET /api/mods
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const category = req.query.category || "";
    const game = req.query.game || "";
    const tag = req.query.tag || "";
    const sort = req.query.sort || "new";

    const query = {
      status: "published",
    };

    if (search) {
      query.$or = [
        // Оригінальна назва мода
        { title: { $regex: search, $options: "i" } },

        // Українська назва мода
        { titleUa: { $regex: search, $options: "i" } },

        // Опис
        { description: { $regex: search, $options: "i" } },

        // Короткий опис
        { shortDescription: { $regex: search, $options: "i" } },

        // Теги
        { tags: { $regex: search, $options: "i" } },

        // Версія мода
        { version: { $regex: search, $options: "i" } },

        // Версія гри
        { gameVersion: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.categories = category;
    }

    if (game) {
      query.game = game;
    }

    if (tag) {
      query.tags = { $regex: tag, $options: "i" };
    }

    let sortOptions = {};

    if (sort === "popular") {
      sortOptions = { downloadCount: -1, likesCount: -1 };
    } else if (sort === "rating") {
      sortOptions = { averageRating: -1, ratingsCount: -1 };
    } else if (sort === "downloads") {
      sortOptions = { downloadCount: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const mods = await Mod.find(query)
      .populate("game", "title titleUa coverImage")
      .populate("categories", "name nameUa slug")
      .populate("author", "username avatarUrl")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const total = await Mod.countDocuments(query);

    res.json({
      mods,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalMods: total,
    });
  } catch (error) {
    console.error("Mods route error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET /api/mods/:id
router.get("/:id", async (req, res) => {
  try {
    const mod = await Mod.findById(req.params.id)
      .populate("game", "title titleUa coverImage genres platforms")
      .populate("categories", "name nameUa slug")
      .populate("author", "username avatarUrl");

    if (!mod) {
      return res.status(404).json({
        message: "Мод не знайдено",
      });
    }

    await Mod.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 },
    });

    res.json(mod);
  } catch (error) {
    console.error("Get mod by id error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const Mod = require("../models/Mod");
// POST /api/mods
// Створення нового мода користувачем
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      titleUa,
      game,
      categories,
      version,
      gameVersion,
      language,
      shortDescription,
      description,
      tags,
      coverImage,
      screenshots,
      installationGuide,
      requirements,
      changelog,
      modFileUrl,
      modFileName,
      modFileSize,
    } = req.body;

    if (!title || !game || !description) {
      return res.status(400).json({
        message: "Назва, гра та опис є обов'язковими полями",
      });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags
      : String(tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

    const normalizedScreenshots = Array.isArray(screenshots)
      ? screenshots
      : String(screenshots || "")
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean)
          .map((url) => ({
            url,
            caption: "",
          }));

    const newMod = await Mod.create({
      title,
      titleUa: titleUa || title,
      game,
      categories: categories || [],
      version: version || "1.0.0",
      gameVersion: gameVersion || "",
      language: language || "Українська",
      shortDescription: shortDescription || description.slice(0, 180),
      description,
      tags: normalizedTags,
      coverImage: coverImage || "",
      screenshots: normalizedScreenshots,
      installationGuide: installationGuide || "",
      requirements: requirements || "",
      changelog: changelog || "",
      modFile: {
        url: modFileUrl || "",
        filename: modFileName || "",
        size: Number(modFileSize) || 0,
      },
      author: req.user._id,
      status: "published",
      downloadCount: 0,
      viewCount: 0,
      likesCount: 0,
      averageRating: 0,
      ratingsCount: 0,
      isFeatured: false,
    });

    const populatedMod = await Mod.findById(newMod._id)
      .populate("game", "title titleUa slug")
      .populate("categories", "name nameUa slug icon")
      .populate("author", "username email")
      .lean();

    res.status(201).json({
      message: "Мод успішно створено",
      mod: populatedMod,
    });
  } catch (error) {
    console.error("Create mod error:", error);

    res.status(500).json({
      message: "Помилка при створенні мода",
      error: error.message,
    });
  }
});
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
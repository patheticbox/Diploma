// server/routes/userModRoutes.js
const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/auth");
const UserModStatus = require("../models/UserModStatus");
const Mod = require("../models/Mod");

// GET /api/user-mods
router.get("/", authMiddleware, async (req, res) => {
  try {
    const statuses = await UserModStatus.find({
      user: req.user._id,
    })
      .populate({
        path: "mod",
        populate: [
          {
            path: "game",
            select: "title titleUa coverImage",
          },
          {
            path: "categories",
            select: "name nameUa slug icon",
          },
        ],
      })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      statuses,
    });
  } catch (error) {
    console.error("Get user mod statuses error:", error);

    res.status(500).json({
      message: "Помилка при отриманні статусів модів",
      error: error.message,
    });
  }
});

// POST /api/user-mods/:modId
router.post("/:modId", authMiddleware, async (req, res) => {
  try {
    const { liked, list } = req.body;
    const modId = req.params.modId;

    const modExists = await Mod.exists({ _id: modId });

    if (!modExists) {
      return res.status(404).json({
        message: "Мод не знайдено",
      });
    }

    const oldStatus = await UserModStatus.findOne({
      user: req.user._id,
      mod: modId,
    });

    const oldLiked = oldStatus?.liked || false;

    const updateData = {};

    if (typeof liked === "boolean") {
      updateData.liked = liked;
    }

    if (typeof list === "string") {
      updateData.list = list;

      if (list === "Нецікаво") {
        updateData.liked = false;
      }
    }

    const updatedStatus = await UserModStatus.findOneAndUpdate(
      {
        user: req.user._id,
        mod: modId,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    const newLiked = updatedStatus.liked || false;

    if (oldLiked !== newLiked) {
      await Mod.findByIdAndUpdate(modId, {
        $inc: {
          likesCount: newLiked ? 1 : -1,
        },
      });
    }

    res.json({
      message: "Статус мода оновлено",
      status: updatedStatus,
    });
  } catch (error) {
    console.error("Update user mod status error:", error);

    res.status(500).json({
      message: "Помилка при оновленні статусу мода",
      error: error.message,
    });
  }
});

module.exports = router;
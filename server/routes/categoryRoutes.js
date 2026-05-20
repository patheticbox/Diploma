const express = require("express");
const router = express.Router();

const Category = require("../models/Category");

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({
      nameUa: 1,
      name: 1,
    });

    res.json({
      categories,
    });
  } catch (error) {
    console.error("Categories route error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// GET /api/categories/:id
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Категорію не знайдено",
      });
    }

    res.json({
      category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
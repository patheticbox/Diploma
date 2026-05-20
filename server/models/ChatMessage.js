const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "assistant", "system", "ai"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    relatedMods: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mod",
      },
    ],

    intent: {
      type: String,
      enum: [
        "find_mods",
        "recommend_mods",
        "explain_installation",
        "compare_mods",
        "general_question",
        "unknown",

        // Нові intent-и для проєкту модів
        "general",
        "general_recommendation",
        "graphics_mods",
        "gameplay_mods",
        "optimization_mods",
      ],
      default: "unknown",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
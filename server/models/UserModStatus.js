// server/models/UserModStatus.js
const mongoose = require("mongoose");

const userModStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mod",
      required: true,
    },

    liked: {
      type: Boolean,
      default: false,
    },

    list: {
      type: String,
      enum: ["", "Збережено", "Нецікаво"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userModStatusSchema.index({ user: 1, mod: 1 }, { unique: true });

module.exports = mongoose.model("UserModStatus", userModStatusSchema);
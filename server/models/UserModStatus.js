const mongoose = require('mongoose');

const userModStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    mod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mod',
      required: true,
    },

    liked: {
      type: Boolean,
      default: false,
    },

    saved: {
      type: Boolean,
      default: false,
    },

    downloaded: {
      type: Boolean,
      default: false,
    },

    list: {
      type: String,
      enum: [
        'Встановлено',
        'Хочу спробувати',
        'Улюблене',
        'Не цікаво',
        null,
      ],
      default: null,
    },

    lastInteractionType: {
      type: String,
      enum: ['view', 'like', 'save', 'download', 'rating', 'comment', null],
      default: null,
    },

    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userModStatusSchema.index({ user: 1, mod: 1 }, { unique: true });

module.exports = mongoose.model('UserModStatus', userModStatusSchema);
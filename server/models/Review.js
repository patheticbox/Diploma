const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    mod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mod',
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    text: {
      type: String,
      default: '',
      maxlength: 2000,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ user: 1, mod: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
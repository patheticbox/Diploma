const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    titleUa: {
      type: String,
      trim: true,
      default: '',
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
    },

    coverImage: {
      type: String,
      default: '',
    },

    genres: [
      {
        type: String,
        trim: true,
      },
    ],

    platforms: [
      {
        type: String,
        enum: [
          'PC',
          'PlayStation',
          'Xbox',
          'Nintendo Switch',
          'Mobile',
          'Other',
        ],
      },
    ],

    releaseYear: {
      type: Number,
    },

    developer: {
      type: String,
      default: '',
    },

    publisher: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Game', gameSchema);
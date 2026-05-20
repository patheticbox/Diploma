const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    avatarUrl: {
      type: String,
      default: '',
    },

    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },

    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },

    favoriteGenres: [
      {
        type: String,
        trim: true,
      },
    ],

    favoriteGames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
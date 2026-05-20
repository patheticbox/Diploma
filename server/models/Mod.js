const mongoose = require('mongoose');

const modSchema = new mongoose.Schema(
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
      required: true,
    },

    shortDescription: {
      type: String,
      default: '',
      maxlength: 300,
    },

    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true,
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    version: {
      type: String,
      default: '1.0.0',
    },

    gameVersion: {
      type: String,
      default: '',
    },

    language: {
      type: String,
      enum: ['ua', 'en', 'ru', 'multi', 'other'],
      default: 'multi',
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    requirements: {
      type: String,
      default: '',
    },

    installationGuide: {
      type: String,
      default: '',
    },

    changelog: {
      type: String,
      default: '',
    },

    coverImage: {
      type: String,
      default: '',
    },

    screenshots: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          default: '',
        },
      },
    ],

    modFile: {
      url: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        default: 0,
      },
      mimeType: {
        type: String,
        default: '',
      },
    },

    downloadCount: {
      type: Number,
      default: 0,
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'hidden', 'blocked'],
      default: 'published',
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isAiRecommended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

modSchema.index({
  title: 'text',
  titleUa: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text',
});

module.exports = mongoose.model('Mod', modSchema);
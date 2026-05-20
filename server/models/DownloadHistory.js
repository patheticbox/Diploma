const mongoose = require('mongoose');

const downloadHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    mod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mod',
      required: true,
    },

    ipAddress: {
      type: String,
      default: '',
    },

    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DownloadHistory', downloadHistorySchema);
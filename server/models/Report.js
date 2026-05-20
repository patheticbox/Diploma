const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['mod', 'review', 'user'],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    reason: {
      type: String,
      enum: [
        'spam',
        'virus',
        'copyright',
        'offensive_content',
        'fake_mod',
        'wrong_category',
        'other',
      ],
      required: true,
    },

    comment: {
      type: String,
      default: '',
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ['pending', 'reviewed', 'rejected', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, trim: true, required: true },
    readAt: { type: Date },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

MessageSchema.index({ from: 1, to: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);



import mongoose from 'mongoose';

const labelSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    default: '#808080',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

labelSchema.index({ boardId: 1 });

export const Label = mongoose.model('Label', labelSchema);

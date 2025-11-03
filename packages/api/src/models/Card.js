import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const cardSchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  labels: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Label',
    },
  ],
  dueDate: {
    type: Date,
    default: null,
  },
  checklist: [checklistItemSchema],
  order: {
    type: Number,
    default: 0,
  },
  assignees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cardSchema.index({ boardId: 1 });
cardSchema.index({ listId: 1, order: 1 });

cardSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Card = mongoose.model('Card', cardSchema);

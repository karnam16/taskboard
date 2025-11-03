import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Org',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

membershipSchema.index({ orgId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1 });

export const Membership = mongoose.model('Membership', membershipSchema);

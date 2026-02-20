import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  // SaaS Subscription fields
  trialStart: Date,
  trialEnd: Date,

  planStart: Date,
  planEnd: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Admin', adminSchema);

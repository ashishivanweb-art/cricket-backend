import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  runs: {
    type: Number,
    default: 0,
  },
  wickets: {
    type: Number,
    default: 0,
  },
  overs: {
    type: Number,
    default: 0,
  },
  balls: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model('Score', scoreSchema);

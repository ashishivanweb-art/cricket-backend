import mongoose from 'mongoose';

const ballSchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },

  over: Number,
  ball: Number, // 1 to 6

  batsman: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },

  runs: Number,
  extraType: { type: String, enum: ['wide', 'no-ball', 'leg-bye', 'bye', null] },
  isWicket: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('Ball', ballSchema);

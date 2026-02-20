import mongoose from 'mongoose';

const ballSchema = new mongoose.Schema({
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
   inningsNumber: { type: Number, required: true },
  inningsType: { type: String, enum: ['normal', 'super-over'], default: 'normal' },

  over: Number,
  ball: Number, // 1 to 6

  batsman: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  nonStriker: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  bowler: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },

  runs: { type: Number, default: 0 },        // runs from bat
  extraRuns: { type: Number, default: 0 },   // extra runs

  extraType: {
    type: String,
    enum: ['wide', 'no-ball', 'leg-bye', 'bye', null]
  },

  isWicket: { type: Boolean, default: false },
  wicketType: {
    type: String,
    enum: ['bowled', 'caught', 'lbw', 'runout', 'stumped', null]
  },
  playerOut: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }

}, { timestamps: true });


export default mongoose.model('Ball', ballSchema);

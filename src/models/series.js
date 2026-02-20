import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String, // ODI, T20, Test, Tournament
  },
  startDate: Date,
  endDate: Date,
  
  totalMatches: {
    type: Number,
    default: 0,
  },
  owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Admin',
  required: true
},
}, { timestamps: true });

export default mongoose.model('Series', seriesSchema);

import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  shortName: {
    type: String,
    required: true,
  },
  players: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Player'
  }],

  logo: {
    type: String,
  }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);

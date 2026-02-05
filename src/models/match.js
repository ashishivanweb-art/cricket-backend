import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  teamA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  teamB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  venue: String,
  status: {
    type: String,
    enum: ['upcoming', 'live', 'finished'],
    default: 'upcoming',
  },
  series: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Series',
},
teamAPlaying11: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }
],
teamBPlaying11: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }
],
tossWinner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Team'
},
tossDecision: {
  type: String, // 'bat' or 'bowl'
},
battingTeam: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Team'
},
bowlingTeam: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Team'
},
inning: {
  type: Number,
  default: 1
},
striker: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Player'
},
nonStriker: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Player'
},
currentBowler: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Player'
},
battedPlayers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }
],

totalOvers: {
  type: Number,
  default: 20
},
wicketsDown: {
  type: Number,
  default: 0
}




}, { timestamps: true });

export default mongoose.models.Match || mongoose.model('Match', matchSchema);


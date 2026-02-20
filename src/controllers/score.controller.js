import Match from '../models/match.js';
import Ball from '../models/ball.js';

export const getScorecard = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('teamA')
      .populate('teamB')
      .populate('battingTeam')
      .populate('bowlingTeam')
      .populate('striker')
      .populate('nonStriker')
      .populate('currentBowler')

    const balls = await Ball.find({ match: matchId });

    let totalRuns = 0;
    let wickets = 0;
    let legalBalls = 0;

    balls.forEach(b => {
      totalRuns += b.runs;

      if (b.isWicket) wickets++;

      if (b.extraType !== 'wide' && b.extraType !== 'no-ball') {
        legalBalls++;
      }
    });

    const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

    res.json({
      teamA: match.teamA,
      teamB: match.teamB,
      venue: match.venue,
      status: match.status,
      inning: match.inning,
      battingTeam: match.battingTeam,
      bowlingTeam: match.bowlingTeam,
      striker: match.striker,
      nonStriker: match.nonStriker,
      currentBowler: match.currentBowler,
      totalRuns,
      wickets,
      overs
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getBatsmanScorecard = async (req, res) => {
  try {
    const { matchId } = req.params;

    const balls = await Ball.find({ match: matchId }).populate('batsman');

    const batsmanStats = {};

    balls.forEach((b) => {
      const id = b.batsman._id.toString();

      if (!batsmanStats[id]) {
        batsmanStats[id] = {
          name: b.batsman.name,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0
        };
      }

      // Runs
        //  Ball count (ignore wide / no-ball)
        if (b.extraType !== 'wide' && b.extraType !== 'no-ball') {
            batsmanStats[id].balls += 1;
        }

        //  Runs only when it is NOT extra type
        if (!['wide', 'no-ball', 'bye', 'leg-bye'].includes(b.extraType)) {
            batsmanStats[id].runs += b.runs;

            if (b.runs === 4) batsmanStats[id].fours += 1;
            if (b.runs === 6) batsmanStats[id].sixes += 1;
        }

    });

    res.json(Object.values(batsmanStats));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBowlerFigures = async (req, res) => {
  try {
    const { matchId } = req.params;

    const balls = await Ball.find({ match: matchId }).populate('bowler');

    const bowlerStats = {};

    balls.forEach((b) => {
      const id = b.bowler._id.toString();

      if (!bowlerStats[id]) {
        bowlerStats[id] = {
          name: b.bowler.name,
          runs: 0,
          balls: 0,
          wickets: 0
        };
      }

      bowlerStats[id].runs += b.runs;

      if (b.isWicket) bowlerStats[id].wickets += 1;

      if (b.extraType !== 'wide' && b.extraType !== 'no-ball') {
        bowlerStats[id].balls += 1;
      }
    });

    // Convert balls to overs
    Object.values(bowlerStats).forEach((b) => {
      b.overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
      delete b.balls;
    });

    res.json(Object.values(bowlerStats));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLastOverBalls = async (req, res) => {
  try {
    const { matchId } = req.params;

    const balls = await Ball.find({ match: matchId })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(balls.reverse()); // oldest → latest
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

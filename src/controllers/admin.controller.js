import Team from '../models/team.js';
import Match from '../models/match.js';
import Score from '../models/score.js';
import Series from '../models/series.js';
import Player from '../models/player.js';


export const createTeam = async (req, res) => {
  try {
    const { name, shortName, logo } = req.body;

    const team = await Team.create({ name, shortName, logo });

    res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMatch = async (req, res) => {
  try {
    const {
      teamA,
      teamB,
      venue,
      series,
      teamAPlaying11,
      teamBPlaying11
    } = req.body;

    // ✅ Validate both teams have minimum 11 players in squad
    const teamAPlayers = await Player.countDocuments({ team: teamA });
    const teamBPlayers = await Player.countDocuments({ team: teamB });

    if (teamAPlayers < 11 || teamBPlayers < 11) {
      return res.status(400).json({
        error: 'Both teams must have at least 11 players in squad'
      });
    }

    // ✅ Validate exactly 11 selected for match
    if (
      !teamAPlaying11 ||
      !teamBPlaying11 ||
      teamAPlaying11.length !== 11 ||
      teamBPlaying11.length !== 11
    ) {
      return res.status(400).json({
        error: 'Each team must select exactly 11 players'
      });
    }

    const match = await Match.create({
      teamA,
      teamB,
      venue,
      series,
      teamAPlaying11,
      teamBPlaying11,
      status: 'upcoming'
    });

    await Series.findByIdAndUpdate(series, {
      $inc: { totalMatches: 1 }
    });

    res.status(201).json({
      message: 'Match created with Playing 11',
      match,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const updateScore = async (req, res) => {
  try {
    const { matchId, runs, wickets, overs, balls } = req.body;

    let score = await Score.findOne({ matchId });

    if (!score) {
      score = await Score.create({ matchId, runs, wickets, overs, balls });
    } else {
      score.runs = runs;
      score.wickets = wickets;
      score.overs = overs;
      score.balls = balls;
      await score.save();
    }

    // 🔥 Emit live update
    global.io.emit('scoreUpdate', score);

    res.json({
      message: 'Score updated & broadcasted',
      score,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const addSeries = async (req, res) => {
  try {
    const { name, type, startDate, endDate } = req.body;

    const series = await Series.create({
      name,
      type,
      startDate,
      endDate,
    });

    res.json({
      message: 'Series created successfully',
      series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateToss = async (req, res) => {
  try {
    const { tossWinner, tossDecision } = req.body;
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    let battingTeam, bowlingTeam;

    if (tossDecision === 'bat') {
      battingTeam = tossWinner;
      bowlingTeam =
        match.teamA.toString() === tossWinner
          ? match.teamB
          : match.teamA;
    } else {
      bowlingTeam = tossWinner;
      battingTeam =
        match.teamA.toString() === tossWinner
          ? match.teamB
          : match.teamA;
    }

    match.tossWinner = tossWinner;
    match.tossDecision = tossDecision;
    match.battingTeam = battingTeam;
    match.bowlingTeam = bowlingTeam;
    match.status = 'live';   // match starts after toss
    match.inning = 1;

    await match.save();

    res.json({
      message: 'Toss updated successfully',
      match
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const startInnings = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { striker, nonStriker, bowler } = req.body;

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Get correct playing 11 based on batting/bowling
    const battingPlaying11 =
      match.battingTeam.toString() === match.teamA.toString()
        ? match.teamAPlaying11
        : match.teamBPlaying11;

    const bowlingPlaying11 =
      match.bowlingTeam.toString() === match.teamA.toString()
        ? match.teamAPlaying11
        : match.teamBPlaying11;

    // ✅ Validate players
    if (
      !battingPlaying11.includes(striker) ||
      !battingPlaying11.includes(nonStriker)
    ) {
      return res.status(400).json({
        error: 'Striker and Non-Striker must be from batting team Playing 11'
      });
    }

    if (!bowlingPlaying11.includes(bowler)) {
      return res.status(400).json({
        error: 'Bowler must be from bowling team Playing 11'
      });
    }

    match.striker = striker;
    match.nonStriker = nonStriker;
    match.currentBowler = bowler;

    await match.save();

    res.json({
      message: 'Innings started',
      match
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};





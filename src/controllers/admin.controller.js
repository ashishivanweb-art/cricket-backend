import Team from '../models/team.js';
import Match from '../models/match.js';
import Score from '../models/score.js';
import Series from '../models/series.js';
import Player from '../models/player.js';


export const createTeam = async (req, res) => {
  try {
    const { name, shortName, logo } = req.body;

    const team = await Team.create({ name, shortName, logo, owner: req.admin._id });

    res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ owner: req.admin._id })
      .populate('players');

    res.json(teams);
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

    // ===============================
    // 1️⃣ Basic Validation (Cheap Checks)
    // ===============================

    if (!teamA || !teamB) {
      return res.status(400).json({
        error: "Both teams are required"
      });
    }

    if (teamA.toString() === teamB.toString()) {
      return res.status(400).json({
        error: "Team A and Team B cannot be the same"
      });
    }

    if (
      !teamAPlaying11 ||
      !teamBPlaying11 ||
      teamAPlaying11.length !== 11 ||
      teamBPlaying11.length !== 11
    ) {
      return res.status(400).json({
        error: "Each team must select exactly 11 players"
      });
    }

    // ===============================
    // 2️⃣ Verify Teams Belong To Admin
    // ===============================

    const teams = await Team.find({
      _id: { $in: [teamA, teamB] },
      owner: req.admin._id
    });

    if (teams.length !== 2) {
      return res.status(403).json({
        error: "One or both teams do not belong to you"
      });
    }

    // ===============================
    // 3️⃣ Validate Squad Size
    // ===============================

    const [teamACount, teamBCount] = await Promise.all([
      Player.countDocuments({ team: teamA }),
      Player.countDocuments({ team: teamB })
    ]);

    if (teamACount < 11 || teamBCount < 11) {
      return res.status(400).json({
        error: "Both teams must have at least 11 players in squad"
      });
    }

    // ===============================
    // 4️⃣ Validate Playing 11 Belongs To Correct Team
    // ===============================

    const [validTeamAPlayers, validTeamBPlayers] = await Promise.all([
      Player.countDocuments({
        _id: { $in: teamAPlaying11 },
        team: teamA
      }),
      Player.countDocuments({
        _id: { $in: teamBPlaying11 },
        team: teamB
      })
    ]);

    if (validTeamAPlayers !== 11 || validTeamBPlayers !== 11) {
      return res.status(400).json({
        error: "Invalid Playing 11 selection"
      });
    }

    // ===============================
    // 5️⃣ Create Match
    // ===============================

    const match = await Match.create({
      teamA,
      teamB,
      venue,
      series,
      teamAPlaying11,
      teamBPlaying11,
      status: 'upcoming',
      owner: req.admin._id
    });

    // ===============================
    // 6️⃣ Update Series Match Count (Optional Safe Check)
    // ===============================

    if (series) {
      await Series.findByIdAndUpdate(series, {
        $inc: { totalMatches: 1 }
      });
    }

    return res.status(201).json({
      message: "Match created successfully",
      match
    });

  } catch (err) {
    console.error("Create Match Error:", err);
    return res.status(500).json({
      error: "Server error while creating match"
    });
  }
};


export const getMatchesOfSeries = async (req, res) => {
  try {
    const matches = await Match.find({
      series: req.params.seriesId,
      owner: req.admin._id  
    })
    .populate('teamA teamB');

    res.json(matches);
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
      owner: req.admin._id 
    });

    res.json({
      message: 'Series created successfully',
      series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMySeries = async (req, res) => {
  try {
    const series = await Series.find({ owner: req.admin._id });
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const updateToss = async (req, res) => {
  try {
    const { tossWinner, tossDecision } = req.body;
    const { matchId } = req.params;

    if (!tossWinner || !tossDecision) {
      return res.status(400).json({
        error: "Toss winner and decision are required"
      });
    }

    if (!["bat", "bowl"].includes(tossDecision)) {
      return res.status(400).json({
        error: "Toss decision must be 'bat' or 'bowl'"
      });
    }

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // ✅ Owner validation
    if (match.owner.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✅ Prevent updating toss again
    if (match.status !== "upcoming") {
      return res.status(400).json({
        error: "Toss already completed or match already started"
      });
    }

    // ✅ Ensure tossWinner is either teamA or teamB
    if (
      tossWinner.toString() !== match.teamA.toString() &&
      tossWinner.toString() !== match.teamB.toString()
    ) {
      return res.status(400).json({
        error: "Invalid toss winner"
      });
    }

    let battingTeam, bowlingTeam;

    if (tossDecision === "bat") {
      battingTeam = tossWinner;
      bowlingTeam =
        tossWinner.toString() === match.teamA.toString()
          ? match.teamB
          : match.teamA;
    } else {
      bowlingTeam = tossWinner;
      battingTeam =
        tossWinner.toString() === match.teamA.toString()
          ? match.teamB
          : match.teamA;
    }

    match.tossWinner = tossWinner;
    match.tossDecision = tossDecision;
    match.battingTeam = battingTeam;
    match.bowlingTeam = bowlingTeam;
    match.status = "live";   // 🔥 Live immediately after toss
    match.inning = 1;

    await match.save();

    return res.json({
      message: "Toss updated. Match is now live.",
      match
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Server error while updating toss"
    });
  }
};


export const startInnings = async (req, res) => {
  try {
    const { matchId } = req.params;
    const { striker, nonStriker, bowler } = req.body;

    if (!striker || !nonStriker || !bowler) {
      return res.status(400).json({
        error: "Striker, Non-Striker and Bowler are required"
      });
    }

    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // ✅ Owner validation (SaaS safety)
    if (match.owner.toString() !== req.admin._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ✅ Ensure match is live (toss done)
    if (match.status !== "live") {
      return res.status(400).json({
        error: "Match is not live. Complete toss first."
      });
    }

    if (!match.battingTeam || !match.bowlingTeam) {
      return res.status(400).json({
        error: "Batting and Bowling teams are not decided"
      });
    }

    // ✅ Prevent re-starting same innings
    if (match.striker || match.currentBowler) {
      return res.status(400).json({
        error: "Innings already started"
      });
    }

    // ✅ Determine correct Playing 11
    const battingPlaying11 =
      match.battingTeam.toString() === match.teamA.toString()
        ? match.teamAPlaying11
        : match.teamBPlaying11;

    const bowlingPlaying11 =
      match.bowlingTeam.toString() === match.teamA.toString()
        ? match.teamAPlaying11
        : match.teamBPlaying11;

    // ✅ Validate striker & nonStriker
    if (
      !battingPlaying11.includes(striker) ||
      !battingPlaying11.includes(nonStriker)
    ) {
      return res.status(400).json({
        error: "Striker and Non-Striker must belong to batting Playing 11"
      });
    }

    if (striker === nonStriker) {
      return res.status(400).json({
        error: "Striker and Non-Striker cannot be the same player"
      });
    }

    // ✅ Validate bowler
    if (!bowlingPlaying11.includes(bowler)) {
      return res.status(400).json({
        error: "Bowler must belong to bowling Playing 11"
      });
    }

    // 🔥 Initialize innings state
    match.striker = striker;
    match.nonStriker = nonStriker;
    match.currentBowler = bowler;

    match.totalRuns = 0;
    match.wicketsDown = 0;
    match.overs = 0;
    match.balls = 0;

    match.battedPlayers = [striker, nonStriker];

    await match.save();

    return res.json({
      message: `Innings ${match.inning} started successfully`,
      match
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Server error while starting innings"
    });
  }
};


// export const setNextBowler = async (req, res) => {
//   const { matchId } = req.params;
//   const { bowlerId } = req.body;

//   const match = await Match.findById(matchId);

//   match.currentBowler = bowlerId;

//   await match.save();

//   res.json({ message: 'Next bowler set' });
// };

// export const reduceOvers = async (req, res) => {
//   const { matchId } = req.params;
//   const { newOvers } = req.body;

//   const match = await Match.findById(matchId);

//   match.currentOvers = newOvers;
//   match.matchPaused = false;

//   await match.save();

//   res.json({ message: 'Overs updated due to rain' });
// };

// export const retireBatsman = async (req, res) => {
//   const { matchId } = req.params;
//   const { batsmanId, nextBatsmanId } = req.body;

//   const match = await Match.findById(matchId);

//   // Replace striker or non-striker
//   if (match.striker.toString() === batsmanId) {
//     match.striker = nextBatsmanId;
//   } else if (match.nonStriker.toString() === batsmanId) {
//     match.nonStriker = nextBatsmanId;
//   }

//   await match.save();

//   res.json({ message: 'Batsman retired hurt' });
// };


// export const startMatch = async (req, res) => {
//   try {
//     const { matchId } = req.params;
//     const { striker, nonStriker, bowler } = req.body;

//     if (!striker || !nonStriker || !bowler) {
//       return res.status(400).json({
//         error: "Striker, nonStriker and bowler are required"
//       });
//     }

//     const match = await Match.findById(matchId);

//     if (!match) {
//       return res.status(404).json({ error: "Match not found" });
//     }

//     // ✅ Owner validation
//     if (match.owner.toString() !== req.admin._id.toString()) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     // ✅ Ensure toss is done and match is live
//     if (match.status !== "live") {
//       return res.status(400).json({
//         error: "Match is not live yet. Complete toss first."
//       });
//     }

//     if (!match.battingTeam || !match.bowlingTeam) {
//       return res.status(400).json({
//         error: "Batting and bowling teams not decided"
//       });
//     }

//     // ✅ Validate striker & nonStriker belong to batting team playing11
//     const battingPlaying11 =
//       match.teamA.toString() === match.battingTeam.toString()
//         ? match.teamAPlaying11
//         : match.teamBPlaying11;

//     if (
//       !battingPlaying11.includes(striker) ||
//       !battingPlaying11.includes(nonStriker)
//     ) {
//       return res.status(400).json({
//         error: "Striker and nonStriker must belong to batting team's Playing 11"
//       });
//     }

//     // ✅ Validate bowler belongs to bowling team playing11
//     const bowlingPlaying11 =
//       match.teamA.toString() === match.bowlingTeam.toString()
//         ? match.teamAPlaying11
//         : match.teamBPlaying11;

//     if (!bowlingPlaying11.includes(bowler)) {
//       return res.status(400).json({
//         error: "Bowler must belong to bowling team's Playing 11"
//       });
//     }

//     // 🔥 Initialize match engine players
//     match.striker = striker;
//     match.nonStriker = nonStriker;
//     match.currentBowler = bowler;

//     match.wicketsDown = 0;
//     match.totalRuns = 0;
//     match.currentOvers = match.initialOvers;

//     await match.save();

//     return res.json({
//       message: "Match engine initialized successfully",
//       match
//     });

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       error: "Server error while starting match"
//     });
//   }
// };





// export const updateScore = async (req, res) => {
//   try {
//     const { matchId, runs, wickets, overs, balls } = req.body;

//     let score = await Score.findOne({ matchId });

//     if (!score) {
//       score = await Score.create({ matchId, runs, wickets, overs, balls });
//     } else {
//       score.runs = runs;
//       score.wickets = wickets;
//       score.overs = overs;
//       score.balls = balls;
//       await score.save();
//     }

//     // 🔥 Emit live update
//     global.io.emit('scoreUpdate', score);

//     res.json({
//       message: 'Score updated & broadcasted',
//       score,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };





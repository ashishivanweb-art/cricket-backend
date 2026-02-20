import Match from  '../models/match.js';
import Ball from '../models/ball.js';
import { io } from '../server.js';
import { recalculateMatch } from "../services/matchEngine.js";

export const addBall = async (req, res) => {
  try {
    const {
      matchId,
      runs = 0,
      extraRuns = 0,
      extraType = null,
      isWicket = false,
      wicketType = null
    } = req.body;

    const match = await Match.findById(matchId);

    if (!match)
      return res.status(404).json({ error: "Match not found" });

    if (match.owner.toString() !== req.admin._id.toString())
      return res.status(403).json({ error: "Unauthorized" });

    // 🚨 Cannot score without players selected
    if (!match.striker || !match.nonStriker || !match.currentBowler) {
      return res.status(400).json({
        error: "Striker, non-striker, or bowler not selected"
      });
    }

    // -------------------------------
    // 1️⃣ Save Ball
    // -------------------------------

    await Ball.create({
      match: match._id,

      inningsNumber: match.inning,
      inningsType: match.inningsType || "normal",

      batsman: match.striker,
      nonStriker: match.nonStriker,
      bowler: match.currentBowler,

      runs,
      extraRuns,
      extraType,
      isWicket,
      wicketType
    });

    // -------------------------------
    // 2️⃣ Strike Rotation Logic
    // -------------------------------

    const isLegalDelivery =
      extraType !== "wide" && extraType !== "no-ball";

    // Rotate on odd runs (only legal balls)
    if (isLegalDelivery && runs % 2 === 1 && !isWicket) {
      const temp = match.striker;
      match.striker = match.nonStriker;
      match.nonStriker = temp;
    }

    // -------------------------------
    // 3️⃣ Wicket Handling
    // -------------------------------

    if (isWicket) {
      // Assume striker is out unless runout logic expanded later
      match.striker = null;
    }

    // -------------------------------
    // 4️⃣ Over Completion Check
    // -------------------------------

    const balls = await Ball.find({
      match: match._id,
      inningsNumber: match.inning
    });

    const legalBalls = balls.filter(
      b => b.extraType !== "wide" && b.extraType !== "no-ball"
    ).length;

    if (legalBalls > 0 && legalBalls % 6 === 0) {

      // Swap strike at end of over
      if (match.striker && match.nonStriker) {
        const temp = match.striker;
        match.striker = match.nonStriker;
        match.nonStriker = temp;
      }

      // Require new bowler
      match.currentBowler = null;
    }

    // Save before recalculation
    await match.save();

    // -------------------------------
    // 5️⃣ Recalculate Match State
    // -------------------------------

    await recalculateMatch(match);
    await match.save();

    // -------------------------------
    // 6️⃣ Emit Socket
    // -------------------------------

    io.emit(`scoreUpdate-${match._id}`, { matchId: match._id });

    // -------------------------------
    // 7️⃣ Send Response Flags
    // -------------------------------

    res.json({
      message: "Ball added successfully",
      requiresNewBatsman: !match.striker,
      requiresNewBowler: !match.currentBowler
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const undoLastBall = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);

    if (!match) return res.status(404).json({ error: "Match not found" });

    const lastBall = await Ball.findOne({ match: matchId })
      .sort({ createdAt: -1 });

    if (!lastBall)
      return res.status(400).json({ error: "No balls to undo" });

    await Ball.deleteOne({ _id: lastBall._id });

    await recalculateMatch(match);
    await match.save();

    io.emit(`scoreUpdate-${match._id}`, { matchId: match._id });

    res.json({ message: "Last ball undone successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const editBall = async (req, res) => {
  try {
    const { matchId, ballId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    const ball = await Ball.findById(ballId);
    if (!ball) return res.status(404).json({ error: "Ball not found" });

    Object.assign(ball, req.body);
    await ball.save();

    await recalculateMatch(match);
    await match.save();

    io.emit(`scoreUpdate-${match._id}`, { matchId: match._id });

    res.json({ message: "Ball edited successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};







// export const bowlBall = async (req, res) => {
//   try {

//      const {
//       matchId,
//       runs = 0,
//       extraRuns = 0,
//       extraType,     // 'wide','no-ball','bye','leg-bye'
//       isWicket = false,
//       wicketType = null      // 'bowled','caught','runout'
//     } = req.body;

//     const match = await Match.findById(matchId);

//     if (match.matchPaused) {
//       return res.status(400).json({ error: 'Match is paused due to rain' });
//   }

//     // 🟢 Find last ball
//     const lastBall = await Ball.findOne({ match: matchId })
//       .sort({ createdAt: -1 });

//     let over = lastBall ? lastBall.over : 1;
//     let ballNumber = lastBall ? lastBall.ball + 1 : 1;

//     // ✅ Check legal delivery
//     const isLegalBall = extraType !== 'wide' && extraType !== 'no-ball';

//     if (!isLegalBall) {
//       ballNumber -= 1; // does not count
//     }

//     // ✅ Over complete
//     if (isLegalBall && ballNumber > 6) {
//       over += 1;
//       ballNumber = 1;

//       // change strike at over end
//       [match.striker, match.nonStriker] =
//         [match.nonStriker, match.striker];

//         match.currentBowler = null;
//     }

//     // 🟢 Save ball
//     await Ball.create({
//       match: matchId,
//       over,
//       ball: ballNumber,
//       batsman: match.striker,
//       bowler: match.currentBowler,
//       runs,
//       extraRuns,
//       extraType,
//       isWicket,
//       wicketType
//     });

//     //  TOTAL RUNS TO TEAM
//     const totalRunsThisBall = runs + extraRuns;
//     match.totalRuns += totalRunsThisBall;
    

//     //  BALL COUNT
//     if (isLegalBall) {
//       match.balls += 1;
//     }

  
//     if (
//       (!extraType || extraType === 'no-ball') &&
//       !(extraType && wicketType === 'runout')
//     ) {
//       // you will later store batsman stats from Ball table
//       // so no direct striker.runs here
//     }

//     //  STRIKE CHANGE (ignore wide)
//     if (extraType !== 'wide' && runs % 2 === 1) {
//       [match.striker, match.nonStriker] =
//         [match.nonStriker, match.striker];
//     }

//     //  WICKET HANDLING
//     if (isWicket) {
//       match.wicketsDown += 1;

//       const battingPlaying11 =
//         match.battingTeam.toString() === match.teamA.toString()
//           ? match.teamAPlaying11
//           : match.teamBPlaying11;

//       const nextBatsman = battingPlaying11.find(
//         (p) => !match.battedPlayers.includes(p.toString())
//       );

//       if (nextBatsman) {
//         match.striker = nextBatsman;
//         match.battedPlayers.push(nextBatsman);
//       } else {
//         match.status = 'inning-break';
//       }
//     }

//     if (
//       match.inning === 2 &&
//       match.targetRuns &&
//       match.totalRuns >= match.targetRuns
//     ) {
//       match.status = 'finished';
//     }

//     // ✅ CHECK INNINGS END
//     const currentOver = Math.floor(match.balls / 6);
//     const currentBall = match.balls % 6;

//     if (
//       match.wicketsDown === 10 ||
//       // (currentOver === match.totalOvers && currentBall === 0)
//       (currentOver === match.currentOvers && currentBall === 0)

//     ) {
//       if (match.inning === 1) {
//         // Switch innings
//         match.inning = 2;
//         match.wicketsDown = 0;

//         [match.battingTeam, match.bowlingTeam] =
//           [match.bowlingTeam, match.battingTeam];

//         match.striker = null;
//         match.nonStriker = null;
//         match.currentBowler = null;
//         match.battedPlayers = [];

//         match.status = 'inning-break';
//       } else {
//         match.status = 'finished';
//       }
//     }

//     await match.save();

//     // ✅ SOCKET EMIT
//     io.emit(`scoreUpdate-${match._id}`, {
//       matchId: match._id
//     });

//     res.json({ message: 'Ball recorded' });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


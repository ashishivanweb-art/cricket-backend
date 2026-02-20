import Match from "../models/match.js";

export const getMatchState = async (req, res) => {
  try {

    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate("battingTeam bowlingTeam striker nonStriker currentBowler");

    if (!match)
      return res.status(404).json({ error: "Match not found" });

    // ----------------------------------
    // Get Balls of Current Innings
    // ----------------------------------

    const balls = await Ball.find({
      match: match._id,
      inningsNumber: match.inning
    });

    let totalRuns = 0;
    let wickets = 0;
    let legalBalls = 0;

    balls.forEach(ball => {
      totalRuns += ball.runs + ball.extraRuns;

      if (ball.isWicket) wickets++;

      if (ball.extraType !== "wide" && ball.extraType !== "no-ball") {
        legalBalls++;
      }
    });

    // ----------------------------------
    // Overs Calculation
    // ----------------------------------

    const overs = Math.floor(legalBalls / 6) + "." + (legalBalls % 6);

    // ----------------------------------
    // Run Rates
    // ----------------------------------

    const currentRunRate =
      legalBalls > 0
        ? (totalRuns / (legalBalls / 6)).toFixed(2)
        : "0.00";

    let requiredRunRate = null;
    let runsRemaining = null;
    let ballsRemaining = null;

    if (match.inning === 2 && match.targetRuns) {

      runsRemaining = match.targetRuns - totalRuns;

      const maxBalls = match.totalOvers * 6;
      ballsRemaining = maxBalls - legalBalls;

      if (ballsRemaining > 0) {
        requiredRunRate = (
          (runsRemaining * 6) / ballsRemaining
        ).toFixed(2);
      }
    }

    // ----------------------------------
    // Response
    // ----------------------------------

    res.json({

      inning: match.inning,
      inningsType: match.inningsType,

      battingTeam: match.battingTeam,
      bowlingTeam: match.bowlingTeam,

      totalRuns,
      wickets,
      overs,

      target: match.targetRuns || null,

      currentRunRate,
      requiredRunRate,
      runsRemaining,
      ballsRemaining,

      striker: match.striker,
      nonStriker: match.nonStriker,
      currentBowler: match.currentBowler,

      status: match.status,
      result: match.result || null

    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
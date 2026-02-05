import Match from  '../models/match.js';
import Ball from '../models/ball.js';

export const bowlBall = async (req, res) => {
  try {
    const { matchId, runs, extraType, isWicket } = req.body;

    const match = await Match.findById(matchId);

    // Find last ball
    const lastBall = await Ball.findOne({ match: matchId })
      .sort({ createdAt: -1 });

    let over = 1;
    let ballNumber = 1;

    if (lastBall) {
      over = lastBall.over;
      ballNumber = lastBall.ball + 1;
    }

    // ❌ Wide & No-ball do not increase ball count
    if (extraType === 'wide' || extraType === 'no-ball') {
      ballNumber -= 1;
    }

    // Over complete
    if (ballNumber > 6) {
      over += 1;
      ballNumber = 1;

      // change bowler here later
    }

    // Save ball
    await Ball.create({
      match: matchId,
      over,
      ball: ballNumber,
      batsman: match.striker,
      bowler: match.currentBowler,
      runs,
      extraType,
      isWicket
    });

    // ✅ Strike change on odd runs
    if (runs % 2 === 1) {
      const temp = match.striker;
      match.striker = match.nonStriker;
      match.nonStriker = temp;
    }

    // ✅ Strike change at end of over
    if (ballNumber === 6) {
      const temp = match.striker;
      match.striker = match.nonStriker;
      match.nonStriker = temp;
    }

    // ✅ Handle wicket
if (isWicket) {
      match.wicketsDown += 1;

  const battingPlaying11 =
    match.battingTeam.toString() === match.teamA.toString()
      ? match.teamAPlaying11
      : match.teamBPlaying11;

  // Find next batsman who has not batted
  const nextBatsman = battingPlaying11.find(
    (p) => !match.battedPlayers.includes(p.toString())
  );

  if (nextBatsman) {
    match.striker = nextBatsman;
    match.battedPlayers.push(nextBatsman);
  } else {
    // All out
    match.status = 'inning-break';
  }
}

//  Check innings end
if (
  match.wicketsDown === 10 ||
  (over === match.totalOvers && ballNumber === 6)
) {
  if (match.inning === 1) {
    // Switch innings
    match.inning = 2;
    match.wicketsDown = 0;

    // Swap batting & bowling teams
    const temp = match.battingTeam;
    match.battingTeam = match.bowlingTeam;
    match.bowlingTeam = temp;

    // Reset striker, non-striker, bowler
    match.striker = null;
    match.nonStriker = null;
    match.currentBowler = null;
    match.battedPlayers = [];

    match.status = 'inning-break';
  } else {
    // Match finished
    match.status = 'finished';
  }
}


    await match.save();

    res.json({ message: 'Ball recorded' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    await match.save();

    res.json({ message: 'Ball recorded' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

import Ball from "../models/ball.js";
import Match from "../models/match.js"

 export const recalculateMatch = async (match) => {

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

  match.wicketsDown = wickets;

  // ----------------------------
  // Determine innings limits
  // ----------------------------

  let maxOvers = match.totalOvers;
  let maxWickets = 10;

  if (match.inningsType === "super-over") {
    maxOvers = 1;
    maxWickets = 2;
  }

  const inningsEnded =
    wickets >= maxWickets ||
    legalBalls >= maxOvers * 6;

  // =============================
  // 🏏 FIRST INNINGS END
  // =============================

  if (inningsEnded && match.inning === 1) {

    match.firstInningsScore = totalRuns;
    match.targetRuns = totalRuns + 1;

    match.inning = 2;
    match.inningsType = "normal";
    match.wicketsDown = 0;

    // swap teams
    const temp = match.battingTeam;
    match.battingTeam = match.bowlingTeam;
    match.bowlingTeam = temp;

    // clear players
    match.striker = null;
    match.nonStriker = null;
    match.currentBowler = null;

    return;
  }

  // =============================
  // 🏏 SECOND INNINGS END
  // =============================

  if (inningsEnded && match.inning === 2) {

    if (totalRuns >= match.targetRuns) {
      match.status = "finished";
      match.result = "Batting team won";
      return;
    }

    if (totalRuns === match.targetRuns - 1) {
      // 🔥 TIE → SUPER OVER
      match.inning = 3;
      match.inningsType = "super-over";
      match.wicketsDown = 0;

      match.striker = null;
      match.nonStriker = null;
      match.currentBowler = null;

      return;
    }

    // Lost
    match.status = "finished";
    match.result = "Bowling team won";
    return;
  }

  // =============================
  // 🔥 SUPER OVER END
  // =============================

  if (inningsEnded && match.inningsType === "super-over") {

    if (totalRuns >= match.targetRuns) {
      match.status = "finished";
      match.result = "Super Over Winner";
      return;
    }

    // Tie again → another super over
    match.inning += 1;
    match.wicketsDown = 0;

    match.striker = null;
    match.nonStriker = null;
    match.currentBowler = null;

    return;
  }

};




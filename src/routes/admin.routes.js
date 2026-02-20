import express from 'express';
import {
  createTeam,
  createMatch,
  addSeries,
  updateToss,
  startInnings,
  getMySeries,
  getMatchesOfSeries,
  getMyTeams
} from '../controllers/admin.controller.js';

import adminAuth from '../middleware/adminAuth.js';

import { addPlayer, getPlayersByTeam, updatePlayer } from '../controllers/player.controller.js';
import { addBall, editBall, undoLastBall } from '../controllers/ball.controller.js';
import Match from '../models/match.js';



const router = express.Router();

router.put('/match/pause/:matchId', async (req, res) => {
  const match = await Match.findById(req.params.matchId);
  match.matchPaused = true;
  await match.save();
  res.json({ message: 'Match paused' });
});

router.post('/add-team',adminAuth, createTeam);
router.get('/get-teams', adminAuth, getMyTeams);

router.post('/add-match',adminAuth, createMatch);
router.get('/series/:seriesId/matches',adminAuth, getMatchesOfSeries);


router.post('/series', adminAuth, addSeries);
router.get('/get-my-series', adminAuth, getMySeries);


//Player Routes
router.post('/add-player', adminAuth, addPlayer);
router.get('/get-players', adminAuth, getPlayersByTeam);
router.put('/player/:id', adminAuth, updatePlayer);

router.put('/match/toss/:matchId', adminAuth, updateToss);
router.put('/match/start-innings/:matchId',adminAuth, startInnings);


router.post('/matches/:matchId/balls',adminAuth, addBall);
router.delete("/matches/:matchId/last-ball",adminAuth, undoLastBall);
router.patch('/matches/:matchId/balls/:ballId', adminAuth, editBall);



// router.put('/match/next-bowler/:matchId', setNextBowler);

// router.put('/match/reduce-overs/:matchId', reduceOvers);

// router.put('/match/retire-batsman/:matchId', retireBatsman);

// router.post('/start-match/:matchId', adminAuth, startMatch);




export default router;

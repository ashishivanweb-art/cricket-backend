import express from 'express';
import {  getCurrentMatches, getMatchById, getAllSeries, getSeriesById } from '../controllers/cricket.controller.js';
import { getPlayersByTeam } from '../controllers/player.controller.js';
import { getBatsmanScorecard, getBowlerFigures, getLastOverBalls, getScorecard } from '../controllers/score.controller.js';
import adminAuth from '../middleware/adminAuth.js';
import { getMatchState } from '../controllers/match.controller.js';

const router = express.Router();

router.get('/matches', getCurrentMatches);
router.get('/match/:id', getMatchById);
router.get('/series', getAllSeries);
router.get('/series/:id', getSeriesById);

router.get('/player/team/:teamId', getPlayersByTeam);

//Scorecard Routes
router.get('/scorecard/:matchId', getScorecard);
router.get('/scorecard/batsmen/:matchId', getBatsmanScorecard);
router.get('/scorecard/bowlers/:matchId', getBowlerFigures);
router.get('/last-over/:matchId', getLastOverBalls);

router.get("/match/:matchId/state", adminAuth, getMatchState);



export default router;

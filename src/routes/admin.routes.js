import express from 'express';
import {
  createTeam,
  createMatch,
  addSeries,
  updateToss,
  startInnings
} from '../controllers/admin.controller.js';

import { addPlayer, updatePlayer } from '../controllers/player.controller.js';
import { bowlBall } from '../controllers/ball.controller.js';


const router = express.Router();

router.post('/team', createTeam);
router.post('/match', createMatch);
router.post('/series', addSeries);


//Player Routes
router.post('/player', addPlayer);
router.put('/player/:id', updatePlayer);

router.put('/match/toss/:matchId', updateToss);
router.put('/match/start-innings/:matchId', startInnings);


router.post('/ball', bowlBall);


export default router;

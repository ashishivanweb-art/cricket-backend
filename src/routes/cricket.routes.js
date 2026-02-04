import express from 'express';
import {  getCurrentMatches, getMatchById, getAllSeries, getSeriesById } from '../controllers/cricket.controller.js';
import { getMatchScore } from '../controllers/cricket.controller.js';

const router = express.Router();

router.get('/matches', getCurrentMatches);
router.get('/match/:id', getMatchById);
// router.get('/series', getCurrentSeries);
router.get('/score/:matchId', getMatchScore);
router.get('/series', getAllSeries);
router.get('/series/:id', getSeriesById);


export default router;

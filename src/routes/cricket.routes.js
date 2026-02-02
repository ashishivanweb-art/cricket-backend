import express from 'express';
import { getCurrentSeries, getLiveMatches, getMatchById } from '../controllers/cricket.controller.js';

const router = express.Router();

router.get('/live', getLiveMatches);
router.get('/match/:id', getMatchById);
router.get('/series', getCurrentSeries);
export default router;

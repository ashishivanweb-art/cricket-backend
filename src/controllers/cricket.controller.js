import axios from 'axios';
import Score from '../models/score.js';
import Series from '../models/series.js'
import Match from '../models/match.js';

// export const getCurrentSeries = async (req, res) => {
//   try {
//     const matches = await Match.find()
//       .populate('teamA')
//       .populate('teamB')
//       .sort({ createdAt: -1 });

//     res.json(matches);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const getCurrentMatches = async (req, res) => {
  try {
    const { status } = req.query; // live | upcoming | finished

    let filter = {};

    if (status) {
      filter.status = status;
    }

    const matches = await Match.find(filter)
      .populate('teamA')
      .populate('teamB')
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const match = await Match.findById(id)
      .populate('teamA')
      .populate('teamB');

    const score = await Score.findOne({ matchId: id });

    res.json({
      match,
      score,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getMatchScore = async (req, res) => {
  try {
    const { matchId } = req.params;

    const score = await Score.findOne({ matchId }).populate({
      path: 'matchId',
      populate: ['teamA', 'teamB']
    });

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllSeries = async (req, res) => {
  try {
    const series = await Series.find().sort({ createdAt: -1 });
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSeriesById = async (req, res) => {
  try {
    const seriesId = req.params.id;

    const matches = await Match.find({ seriesId })
      .populate('teamA')
      .populate('teamB');

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




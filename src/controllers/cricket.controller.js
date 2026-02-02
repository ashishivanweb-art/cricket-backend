import axios from 'axios';

const API_KEY = process.env.CRICKET_API_KEY;

function isLiveMatch(match) {
  if (!match?.status) return false;

  return /live|in progress|innings break|stumps/i.test(match.status);
}
export const getLiveMatches = async (req, res) => {
  try {
    console.log("API KEY:", process.env.CRICKET_API_KEY);

    const url = `https://api.cricapi.com/v1/currentMatches?apikey=${process.env.CRICKET_API_KEY}&offset=0`;
    console.log("Calling URL:", url);

    const response = await axios.get(url);

    console.log("FULL RESPONSE FROM CRICAPI:");
    console.log(JSON.stringify(response.data, null, 2));

    res.json(response.data);
  } catch (error) {
    console.error("CRICAPI ERROR:");
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};



export const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://api.cricapi.com/v1/match_info`,
      {
        params: {
          apikey: process.env.CRICKET_API_KEY,
          id,
        },
      }
    );

    res.json({
      status: 'success',
      data: response.data.data,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch match' });
  }
};

export const getCurrentSeries = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.cricapi.com/v1/series?apikey=${process.env.CRICKET_API_KEY}&offset=0`
      // `https://api.cricapi.com/v1/series?apikey=8a411540-ca1d-42e5-9d2e-bb05cb0c5a41&offset=0`
      
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch Current Series.',
      error: error.message,
    });
  }
};

import Player from '../models/player.js';
import Team from '../models/team.js';

export const addPlayer = async (req, res) => {
  try {
    const { name, role, jerseyNumber, teamId } = req.body;

    const player = await Player.create({
      name,
      role,
      jerseyNumber,
      team: teamId,
    });

    // push player into team
    await Team.findByIdAndUpdate(teamId, {
      $push: { players: player._id }
    });

    res.json({ message: 'Player added', player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPlayersByTeam = async (req, res) => {
  try {
    const players = await Player.find({ team: req.params.teamId });
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

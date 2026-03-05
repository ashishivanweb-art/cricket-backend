import Player from '../models/player.js';
import Team from '../models/team.js';

export const addPlayer = async (req, res) => {
  try {
    const { name, role, jerseyNumber, teamId } = req.body;

    // 1️⃣ Verify team belongs to logged-in admin
    const team = await Team.findOne({
      _id: teamId,
      owner: req.admin._id
    });

    if (!team) {
      return res.status(403).json({ message: 'Not your team' });
    }

    // 2️⃣ Create player with owner
    const player = await Player.create({
      name,
      role,
      jerseyNumber,
      team: teamId,
      owner: req.admin._id
    });

    // 3️⃣ Push into team
    team.players.push(player._id);
    await team.save();

    res.json({ message: 'Player added', player });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const removePlayer = async (req, res) => {
  try {
    const { teamId, playerId } = req.params;

    // 1️⃣ Verify team ownership
    const team = await Team.findOne({
      _id: teamId,
      owner: req.admin._id
    });

    if (!team) {
      return res.status(403).json({ message: 'Not your team' });
    }

    // 2️⃣ Verify player exists and belongs to admin
    const player = await Player.findOne({
      _id: playerId,
      owner: req.admin._id,
      team: teamId
    });

    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // 3️⃣ Remove player reference from team
    team.players = team.players.filter(
      (id) => id.toString() !== playerId
    );

    await team.save();

    // 4️⃣ Delete player document
    await Player.findByIdAndDelete(playerId);

    res.json({ message: 'Player removed successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPlayersByTeam = async (req, res) => {
  try {
    const players = await Player.find({ team: req.params.teamId, owner: req.admin._id });
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const player = await Player.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.admin._id
      },
      req.body,
      { new: true }
    );

    if (!player) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


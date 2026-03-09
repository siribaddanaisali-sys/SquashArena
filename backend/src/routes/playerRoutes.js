import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Player from '../models/Player.js';
import User from '../models/User.js';

const router = express.Router();

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await Player.findAll({
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'email', 'profilePicture'],
      }],
      order: [['ranking', 'ASC']],
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: { exclude: ['password'] },
      }],
    });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update player profile
router.put('/:id', authenticate, async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const { hand, nationality, bio, status } = req.body;
    await player.update({ hand, nationality, bio, status });

    res.json({ message: 'Player updated successfully', player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player rankings
router.get('/rankings/top', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const players = await Player.findAll({
      where: { status: 'active' },
      order: [['ranking', 'ASC']],
      limit: parseInt(limit),
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'profilePicture'],
      }],
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

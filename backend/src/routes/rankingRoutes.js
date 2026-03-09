import express from 'express';
import Ranking from '../models/Ranking.js';
import Player from '../models/Player.js';
import User from '../models/User.js';

const router = express.Router();

// Get world rankings
router.get('/world', async (req, res) => {
  try {
    const rankings = await Ranking.findAll({
      where: { category: 'world' },
      include: [{
        model: Player,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName', 'profilePicture'],
        }],
      }],
      order: [['rank', 'ASC']],
      limit: 100,
    });
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get regional rankings
router.get('/regional/:region', async (req, res) => {
  try {
    const rankings = await Ranking.findAll({
      where: { category: 'regional' },
      include: [{
        model: Player,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName', 'profilePicture'],
        }],
      }],
      order: [['rank', 'ASC']],
    });
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player's ranking history
router.get('/player/:playerId', async (req, res) => {
  try {
    const rankings = await Ranking.findAll({
      where: { playerId: req.params.playerId },
      order: [['lastUpdated', 'DESC']],
    });
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

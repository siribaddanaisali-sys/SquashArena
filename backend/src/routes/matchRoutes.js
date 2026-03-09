import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Match from '../models/Match.js';
import Player from '../models/Player.js';
import User from '../models/User.js';

const router = express.Router();

// Get all matches
router.get('/', async (req, res) => {
  try {
    const { tournamentId, status } = req.query;
    const where = {};
    if (tournamentId) where.tournamentId = tournamentId;
    if (status) where.status = status;

    const matches = await Match.findAll({
      where,
      include: [
        {
          model: Player,
          as: 'player1',
          attributes: ['id', 'ranking'],
          include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'profilePicture'],
          }],
        },
        {
          model: Player,
          as: 'player2',
          attributes: ['id', 'ranking'],
          include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'profilePicture'],
          }],
        },
      ],
      order: [['scheduledTime', 'ASC']],
    });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create match
router.post('/', authenticate, async (req, res) => {
  try {
    const { tournamentId, player1Id, player2Id, scheduledTime, roundNumber } = req.body;

    const match = await Match.create({
      tournamentId,
      player1Id,
      player2Id,
      scheduledTime,
      roundNumber,
      status: 'scheduled',
    });

    res.status(201).json({
      message: 'Match created successfully',
      match,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update match score
router.put('/:id/score', authenticate, async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const { score, status, winnerId } = req.body;
    await match.update({ score, status, winnerId });

    res.json({ message: 'Match score updated', match });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

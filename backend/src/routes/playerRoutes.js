import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Player from '../models/Player.js';
import User from '../models/User.js';
import PlayerEloHistory from '../models/PlayerEloHistory.js';
import Match from '../models/Match.js';

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

// Get player stats (ELO history, match stats)
router.get('/:id/stats', async (req, res) => {
  try {
    const { Op } = await import('sequelize');

    const player = await Player.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // ELO history
    const eloHistory = await PlayerEloHistory.findAll({
      where: { playerId: player.id },
      order: [['createdAt', 'ASC']],
      limit: 50,
    });

    // Match history with opponents
    const matches = await Match.findAll({
      where: {
        [Op.or]: [{ player1Id: player.id }, { player2Id: player.id }],
        status: 'completed',
      },
      include: [
        { model: Player, as: 'player1', attributes: ['id'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Player, as: 'player2', attributes: ['id'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
      ],
      order: [['scheduledTime', 'DESC']],
      limit: 20,
    });

    // Compute opponent breakdown
    const opponentMap = {};
    matches.forEach(m => {
      const isP1 = m.player1Id === player.id;
      const opp = isP1 ? m.player2 : m.player1;
      const oppName = `${opp.User.firstName} ${opp.User.lastName}`;
      if (!opponentMap[oppName]) opponentMap[oppName] = { wins: 0, losses: 0 };
      if (m.winnerId === player.id) opponentMap[oppName].wins++;
      else opponentMap[oppName].losses++;
    });

    const opponentBreakdown = Object.entries(opponentMap).map(([name, stats]) => ({
      name,
      wins: stats.wins,
      losses: stats.losses,
    }));

    res.json({
      player: {
        id: player.id,
        name: `${player.User.firstName} ${player.User.lastName}`,
        ranking: player.ranking,
        eloRating: player.eloRating,
        wins: player.wins,
        losses: player.losses,
        nationality: player.nationality,
      },
      eloHistory: eloHistory.map(h => ({
        date: h.createdAt,
        rating: parseFloat(h.newRating),
        change: parseFloat(h.ratingChange),
        result: h.result,
      })),
      opponentBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Match from '../models/Match.js';
import Player from '../models/Player.js';
import User from '../models/User.js';
import PlayerEloHistory from '../models/PlayerEloHistory.js';
import { calculateElo } from '../utils/elo.js';

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

// Update match score (with ELO rating update)
router.put('/:id/score', authenticate, async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const { score, status, winnerId } = req.body;
    await match.update({ score, status, winnerId });

    // If match completed with a winner, update ELO ratings
    if (status === 'completed' && winnerId) {
      const player1 = await Player.findByPk(match.player1Id);
      const player2 = await Player.findByPk(match.player2Id);

      if (player1 && player2) {
        const winner = winnerId === player1.id ? player1 : player2;
        const loser = winnerId === player1.id ? player2 : player1;

        const winnerRating = parseFloat(winner.eloRating || 1500);
        const loserRating = parseFloat(loser.eloRating || 1500);
        const winnerMatches = winner.wins + winner.losses;
        const loserMatches = loser.wins + loser.losses;

        const elo = calculateElo(winnerRating, loserRating, winnerMatches, loserMatches);

        // Update player stats
        await winner.update({
          eloRating: elo.winnerNewRating,
          wins: winner.wins + 1,
          points: parseFloat(winner.points) + 10,
        });
        await loser.update({
          eloRating: elo.loserNewRating,
          losses: loser.losses + 1,
        });

        // Record ELO history
        await PlayerEloHistory.bulkCreate([
          {
            playerId: winner.id,
            matchId: match.id,
            oldRating: winnerRating,
            newRating: elo.winnerNewRating,
            ratingChange: elo.winnerChange,
            opponentId: loser.id,
            opponentRating: loserRating,
            result: 'win',
          },
          {
            playerId: loser.id,
            matchId: match.id,
            oldRating: loserRating,
            newRating: elo.loserNewRating,
            ratingChange: elo.loserChange,
            opponentId: winner.id,
            opponentRating: winnerRating,
            result: 'loss',
          },
        ]);
      }
    }

    res.json({ message: 'Match score updated', match });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// HEAD-TO-HEAD STATS
// ==========================================
router.get('/head-to-head/:player1Id/:player2Id', async (req, res) => {
  try {
    const { player1Id, player2Id } = req.params;
    const { Op } = await import('sequelize');

    const matches = await Match.findAll({
      where: {
        status: 'completed',
        [Op.or]: [
          { player1Id: player1Id, player2Id: player2Id },
          { player1Id: player2Id, player2Id: player1Id },
        ],
      },
      include: [
        {
          model: Player, as: 'player1', attributes: ['id', 'ranking', 'eloRating'],
          include: [{ model: User, attributes: ['firstName', 'lastName'] }],
        },
        {
          model: Player, as: 'player2', attributes: ['id', 'ranking', 'eloRating'],
          include: [{ model: User, attributes: ['firstName', 'lastName'] }],
        },
      ],
      order: [['scheduledTime', 'DESC']],
    });

    // Calculate stats
    let p1Wins = 0, p2Wins = 0;
    let p1GamesWon = 0, p2GamesWon = 0;
    matches.forEach(m => {
      if (m.winnerId === player1Id) p1Wins++;
      else p2Wins++;
      // Count games from score
      if (m.score?.games) {
        m.score.games.forEach(game => {
          const s1 = parseInt(game[0]) || 0;
          const s2 = parseInt(game[1]) || 0;
          if (m.player1Id === player1Id) {
            p1GamesWon += s1; p2GamesWon += s2;
          } else {
            p1GamesWon += s2; p2GamesWon += s1;
          }
        });
      }
    });

    // Get player info
    const [p1, p2] = await Promise.all([
      Player.findByPk(player1Id, { include: [{ model: User, attributes: ['firstName', 'lastName'] }] }),
      Player.findByPk(player2Id, { include: [{ model: User, attributes: ['firstName', 'lastName'] }] }),
    ]);

    res.json({
      player1: {
        id: player1Id,
        name: p1 ? `${p1.User.firstName} ${p1.User.lastName}` : 'Unknown',
        wins: p1Wins,
        gamesWon: p1GamesWon,
        ranking: p1?.ranking,
        eloRating: p1?.eloRating,
      },
      player2: {
        id: player2Id,
        name: p2 ? `${p2.User.firstName} ${p2.User.lastName}` : 'Unknown',
        wins: p2Wins,
        gamesWon: p2GamesWon,
        ranking: p2?.ranking,
        eloRating: p2?.eloRating,
      },
      totalMatches: matches.length,
      matches,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PLAYER MATCH HISTORY
// ==========================================
router.get('/player/:playerId/history', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 50, offset = 0, status } = req.query;
    const { Op } = await import('sequelize');

    const where = {
      [Op.or]: [
        { player1Id: playerId },
        { player2Id: playerId },
      ],
    };
    if (status) where.status = status;

    const { count, rows: matches } = await Match.findAndCountAll({
      where,
      include: [
        {
          model: Player, as: 'player1', attributes: ['id', 'ranking', 'eloRating'],
          include: [{ model: User, attributes: ['firstName', 'lastName'] }],
        },
        {
          model: Player, as: 'player2', attributes: ['id', 'ranking', 'eloRating'],
          include: [{ model: User, attributes: ['firstName', 'lastName'] }],
        },
      ],
      order: [['scheduledTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Calculate player stats
    const completed = matches.filter(m => m.status === 'completed');
    const wins = completed.filter(m => m.winnerId === playerId).length;
    const losses = completed.length - wins;

    // Current form (last 5 matches)
    const form = completed.slice(0, 5).map(m => m.winnerId === playerId ? 'W' : 'L');

    // Longest win streak
    let currentStreak = 0, longestStreak = 0;
    completed.forEach(m => {
      if (m.winnerId === playerId) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    res.json({
      total: count,
      matches,
      stats: {
        totalPlayed: completed.length,
        wins,
        losses,
        winPercentage: completed.length > 0 ? Math.round((wins / completed.length) * 100) : 0,
        form,
        longestStreak,
        currentStreak,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PLAYER DETAILED STATS
// ==========================================
router.get('/player/:playerId/stats', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { Op } = await import('sequelize');

    const player = await Player.findByPk(playerId, {
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // All completed matches
    const matches = await Match.findAll({
      where: {
        status: 'completed',
        [Op.or]: [{ player1Id: playerId }, { player2Id: playerId }],
      },
      order: [['scheduledTime', 'DESC']],
    });

    const wins = matches.filter(m => m.winnerId === playerId).length;
    const losses = matches.length - wins;

    // Games analysis
    let totalGamesWon = 0, totalGamesLost = 0, totalPointsWon = 0, totalPointsLost = 0;
    matches.forEach(m => {
      if (m.score?.games) {
        m.score.games.forEach(g => {
          const s1 = parseInt(g[0]) || 0;
          const s2 = parseInt(g[1]) || 0;
          if (m.player1Id === playerId) {
            totalPointsWon += s1; totalPointsLost += s2;
            if (s1 > s2) totalGamesWon++; else totalGamesLost++;
          } else {
            totalPointsWon += s2; totalPointsLost += s1;
            if (s2 > s1) totalGamesWon++; else totalGamesLost++;
          }
        });
      }
    });

    // ELO history
    const eloHistory = await PlayerEloHistory.findAll({
      where: { playerId },
      order: [['createdAt', 'ASC']],
      attributes: ['newRating', 'ratingChange', 'result', 'createdAt'],
    });

    // Form (last 10)
    const form = matches.slice(0, 10).map(m => m.winnerId === playerId ? 'W' : 'L');

    res.json({
      player: {
        id: player.id,
        name: `${player.User.firstName} ${player.User.lastName}`,
        ranking: player.ranking,
        eloRating: player.eloRating,
        nationality: player.nationality,
        hand: player.hand,
      },
      stats: {
        totalMatches: matches.length,
        wins,
        losses,
        winPercentage: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
        totalGamesWon,
        totalGamesLost,
        totalPointsWon,
        totalPointsLost,
        avgPointsPerMatch: matches.length > 0 ? Math.round(totalPointsWon / matches.length) : 0,
        form,
      },
      eloHistory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

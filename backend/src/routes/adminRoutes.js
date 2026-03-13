import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { User, Player, Coach, Tournament, Match, Venue, Club, Discipline, Ranking } from '../models/index.js';

const router = express.Router();

// ==========================================
// ADMIN OVERVIEW STATS
// ==========================================
router.get('/stats', authenticate, authorize('regulator', 'organiser'), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalPlayers = await Player.count();
    const totalCoaches = await Coach.count();
    const totalTournaments = await Tournament.count();
    const totalMatches = await Match.count();
    const totalVenues = await Venue.count();
    const totalClubs = await Club.count();
    const activeDisciplines = await Discipline.count({ where: { status: 'active' } });

    const usersByRole = await User.findAll({
      attributes: ['role', [await import('sequelize').then(m => m.fn('COUNT', m.col('id'))), 'count']],
      group: ['role'],
    });

    res.json({
      totalUsers, totalPlayers, totalCoaches, totalTournaments,
      totalMatches, totalVenues, totalClubs, activeDisciplines,
      usersByRole,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// USER MANAGEMENT
// ==========================================
router.get('/users', authenticate, authorize('regulator'), async (req, res) => {
  try {
    const { role, status } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user active status
router.put('/users/:id/toggle-status', authenticate, authorize('regulator'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({ isActive: !user.isActive });
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { id: user.id, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PLAYER VERIFICATION
// ==========================================
router.get('/players', authenticate, authorize('regulator', 'organiser'), async (req, res) => {
  try {
    const players = await Player.findAll({
      include: [{ model: User, attributes: { exclude: ['password'] } }],
      order: [['ranking', 'ASC']],
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update player status (verify/suspend)
router.put('/players/:id/status', authenticate, authorize('regulator'), async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const { status } = req.body;
    if (!['active', 'inactive', 'retired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await player.update({ status });
    res.json({ message: `Player status updated to ${status}`, player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TOURNAMENT OVERSIGHT
// ==========================================
router.get('/tournaments', authenticate, authorize('regulator', 'organiser'), async (req, res) => {
  try {
    const tournaments = await Tournament.findAll({
      include: [{ model: User, as: 'organizer', attributes: ['firstName', 'lastName', 'email'] }],
      order: [['startDate', 'DESC']],
    });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tournament status
router.put('/tournaments/:id/status', authenticate, authorize('regulator'), async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const { status } = req.body;
    await tournament.update({ status });
    res.json({ message: `Tournament status updated to ${status}`, tournament });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

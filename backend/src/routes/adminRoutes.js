import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { User, Player, Coach, Tournament, Match, Venue, Club, Discipline, Ranking, Region } from '../models/index.js';

const router = express.Router();

// Helper: build region filter for non-super_admin users
const getRegionWhere = (req, field = 'regionId') => {
  if (req.userRole === 'super_admin') return {};
  if (!req.userRegionId) return {};
  return { [field]: req.userRegionId };
};

// ==========================================
// ADMIN OVERVIEW STATS
// ==========================================
router.get('/stats', authenticate, authorize('regulator', 'organiser', 'super_admin'), async (req, res) => {
  try {
    const regionFilter = getRegionWhere(req);

    const totalUsers = await User.count({ where: regionFilter });
    const totalPlayers = await Player.count({
      include: [{ model: User, where: regionFilter, attributes: [] }],
    });
    const totalCoaches = await Coach.count({
      include: [{ model: User, where: regionFilter, attributes: [] }],
    });
    const totalTournaments = await Tournament.count({ where: regionFilter });
    const totalMatches = await Match.count();
    const totalVenues = await Venue.count();
    const totalClubs = await Club.count();
    const activeDisciplines = await Discipline.count({ where: { status: 'active' } });

    const usersByRole = await User.findAll({
      where: regionFilter,
      attributes: ['role', [await import('sequelize').then(m => m.fn('COUNT', m.col('id'))), 'count']],
      group: ['role'],
    });

    res.json({
      totalUsers, totalPlayers, totalCoaches, totalTournaments,
      totalMatches, totalVenues, totalClubs, activeDisciplines,
      usersByRole,
      regionId: req.userRegionId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// USER MANAGEMENT
// ==========================================
router.get('/users', authenticate, authorize('regulator', 'super_admin'), async (req, res) => {
  try {
    const { role, status } = req.query;
    const where = { ...getRegionWhere(req) };
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Region, as: 'region', attributes: ['id', 'name', 'code'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user active status
router.put('/users/:id/toggle-status', authenticate, authorize('regulator', 'super_admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Region guard: non-super_admin can only manage users in their region
    if (req.userRole !== 'super_admin' && req.userRegionId && user.regionId !== req.userRegionId) {
      return res.status(403).json({ error: 'Access denied: user outside your region' });
    }

    await user.update({ isActive: !user.isActive });
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { id: user.id, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PLAYER VERIFICATION
// ==========================================
router.get('/players', authenticate, authorize('regulator', 'organiser', 'super_admin'), async (req, res) => {
  try {
    const regionFilter = getRegionWhere(req);
    const players = await Player.findAll({
      include: [{ model: User, where: regionFilter, attributes: { exclude: ['password'] } }],
      order: [['ranking', 'ASC']],
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update player status (verify/suspend)
router.put('/players/:id/status', authenticate, authorize('regulator', 'super_admin'), async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['regionId'] }],
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (req.userRole !== 'super_admin' && req.userRegionId && player.User?.regionId !== req.userRegionId) {
      return res.status(403).json({ error: 'Access denied: player outside your region' });
    }

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
// TOURNAMENT OVERSIGHT (region-filtered)
// ==========================================
router.get('/tournaments', authenticate, authorize('regulator', 'organiser', 'super_admin'), async (req, res) => {
  try {
    const regionFilter = getRegionWhere(req);
    const tournaments = await Tournament.findAll({
      where: regionFilter,
      include: [
        { model: User, as: 'organizer', attributes: ['firstName', 'lastName', 'email'] },
        { model: Region, as: 'region', attributes: ['id', 'name', 'code'] },
      ],
      order: [['startDate', 'DESC']],
    });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tournament status
router.put('/tournaments/:id/status', authenticate, authorize('regulator', 'super_admin'), async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    if (req.userRole !== 'super_admin' && req.userRegionId && tournament.regionId !== req.userRegionId) {
      return res.status(403).json({ error: 'Access denied: tournament outside your region' });
    }

    const { status } = req.body;
    await tournament.update({ status });
    res.json({ message: `Tournament status updated to ${status}`, tournament });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// REGION MANAGEMENT (super_admin sees all regions)
// ==========================================
router.get('/regions', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const regions = await Region.findAll({ order: [['name', 'ASC']] });
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign region to user (super_admin only)
router.put('/users/:id/region', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { regionId } = req.body;
    await user.update({ regionId });
    res.json({ message: 'User region updated', user: { id: user.id, regionId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

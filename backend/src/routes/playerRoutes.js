import express from 'express';
import { Op } from 'sequelize';
import { authenticate } from '../middleware/auth.js';
import Player from '../models/Player.js';
import User from '../models/User.js';
import PlayerEloHistory from '../models/PlayerEloHistory.js';
import Match from '../models/Match.js';
import Coach from '../models/Coach.js';
import PlayerCoach from '../models/PlayerCoach.js';
import Region from '../models/Region.js';

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

// ==========================================
// PUBLIC COACHES DIRECTORY
// ==========================================

// Get all coaches (public)
router.get('/coaches/directory', async (req, res) => {
  try {
    const coaches = await Coach.findAll({
      where: { status: 'active' },
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'profilePicture', 'email'],
        include: [{
          model: Region,
          as: 'region',
          attributes: ['name'],
          required: false,
        }],
      }],
    });

    // Get active player counts per coach
    const playerCounts = await PlayerCoach.findAll({
      where: { status: 'active' },
      attributes: ['coachId', [PlayerCoach.sequelize.fn('COUNT', PlayerCoach.sequelize.col('playerId')), 'playerCount']],
      group: ['coachId'],
    });
    const countMap = {};
    playerCounts.forEach(pc => { countMap[pc.coachId] = parseInt(pc.getDataValue('playerCount')); });

    const result = coaches.map(c => ({
      id: c.id,
      firstName: c.User.firstName,
      lastName: c.User.lastName,
      profilePicture: c.User.profilePicture,
      certification: c.certification,
      specialization: c.specialization,
      experience: c.experience,
      bio: c.bio,
      status: c.status,
      country: c.User.region?.name || null,
      activePlayers: countMap[c.id] || 0,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get coach by ID (public)
router.get('/coaches/directory/:id', async (req, res) => {
  try {
    const coach = await Coach.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['firstName', 'lastName', 'profilePicture', 'email'],
        include: [{
          model: Region,
          as: 'region',
          attributes: ['name'],
          required: false,
        }],
      }],
    });
    if (!coach) return res.status(404).json({ error: 'Coach not found' });

    // Get active players for this coach
    const playerLinks = await PlayerCoach.findAll({
      where: { coachId: coach.id, status: 'active' },
      include: [{
        model: Player,
        include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      }],
    });

    res.json({
      id: coach.id,
      firstName: coach.User.firstName,
      lastName: coach.User.lastName,
      profilePicture: coach.User.profilePicture,
      certification: coach.certification,
      specialization: coach.specialization,
      experience: coach.experience,
      bio: coach.bio,
      status: coach.status,
      country: coach.User.region?.name || null,
      players: playerLinks.map(l => ({
        id: l.Player.id,
        name: `${l.Player.User.firstName} ${l.Player.User.lastName}`,
        ranking: l.Player.ranking,
        eloRating: l.Player.eloRating,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// COACH SELECTION ENDPOINTS
// ==========================================

// Get all available coaches grouped by country (with search and country filter)
router.get('/coaches/available', authenticate, async (req, res) => {
  try {
    const { search, country } = req.query;

    const whereUser = {};
    if (search) {
      whereUser[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
      ];
    }

    const whereRegion = {};
    if (country) {
      whereRegion.name = country;
    }

    const coaches = await Coach.findAll({
      where: { status: 'active' },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'regionId'],
        where: whereUser,
        include: [{
          model: Region,
          as: 'region',
          attributes: ['id', 'name', 'code'],
          where: Object.keys(whereRegion).length > 0 ? whereRegion : undefined,
          required: !!country,
        }],
      }],
    });

    // Group by country (region name)
    const grouped = {};
    coaches.forEach(c => {
      const countryName = c.User.region?.name || 'Unknown';
      if (!grouped[countryName]) grouped[countryName] = [];
      grouped[countryName].push({
        id: c.id,
        firstName: c.User.firstName,
        lastName: c.User.lastName,
        profilePicture: c.User.profilePicture,
        certification: c.certification,
        specialization: c.specialization,
        experience: c.experience,
        country: countryName,
      });
    });

    // Sort countries alphabetically, coaches by name within each country
    const result = Object.keys(grouped).sort().map(countryName => ({
      country: countryName,
      coaches: grouped[countryName].sort((a, b) => a.firstName.localeCompare(b.firstName)),
    }));

    // Also return distinct country list for the filter dropdown
    const allRegions = await Region.findAll({
      attributes: ['name'],
      where: { status: 'active' },
      order: [['name', 'ASC']],
    });
    const countries = allRegions.map(r => r.name);

    res.json({ groups: result, countries });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my current and past coaches
router.get('/my/coaches', authenticate, async (req, res) => {
  try {
    const player = await Player.findOne({ where: { userId: req.userId } });
    if (!player) return res.status(404).json({ error: 'Player profile not found' });

    const links = await PlayerCoach.findAll({
      where: { playerId: player.id },
      include: [{
        model: Coach,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName', 'profilePicture'],
        }],
      }],
      order: [['startDate', 'DESC']],
    });

    const mapLink = l => ({
      linkId: l.id,
      coachId: l.Coach.id,
      name: `${l.Coach.User.firstName} ${l.Coach.User.lastName}`,
      profilePicture: l.Coach.User.profilePicture,
      certification: l.Coach.certification,
      specialization: l.Coach.specialization,
      startDate: l.startDate,
      endDate: l.endDate,
      status: l.status,
    });

    const current = links.filter(l => l.status === 'active').map(mapLink);
    const pending = links.filter(l => l.status === 'pending').map(mapLink);
    const past = links.filter(l => l.status === 'inactive' || l.status === 'rejected').map(mapLink);

    res.json({ current, pending, past });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign a coach to myself
router.post('/my/coaches', authenticate, async (req, res) => {
  try {
    const { coachId } = req.body;
    if (!coachId) return res.status(400).json({ error: 'coachId is required' });

    const player = await Player.findOne({ where: { userId: req.userId } });
    if (!player) return res.status(404).json({ error: 'Player profile not found' });

    const coach = await Coach.findByPk(coachId);
    if (!coach || coach.status !== 'active') return res.status(404).json({ error: 'Coach not found or inactive' });

    // Check if already assigned or pending
    const existing = await PlayerCoach.findOne({
      where: { playerId: player.id, coachId, status: { [Op.in]: ['active', 'pending'] } },
    });
    if (existing && existing.status === 'active') return res.status(400).json({ error: 'This coach is already assigned to you' });
    if (existing && existing.status === 'pending') return res.status(400).json({ error: 'A request to this coach is already pending' });

    await PlayerCoach.create({
      playerId: player.id,
      coachId,
      startDate: new Date(),
      status: 'pending',
    });

    res.json({ message: 'Coach request sent. Waiting for coach approval.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove (end) a coach assignment
router.delete('/my/coaches/:linkId', authenticate, async (req, res) => {
  try {
    const player = await Player.findOne({ where: { userId: req.userId } });
    if (!player) return res.status(404).json({ error: 'Player profile not found' });

    const link = await PlayerCoach.findOne({
      where: { id: req.params.linkId, playerId: player.id, status: { [Op.in]: ['active', 'pending'] } },
    });
    if (!link) return res.status(404).json({ error: 'Coaching assignment not found' });

    await link.update({ status: 'inactive', endDate: new Date() });

    res.json({ message: 'Coach removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// COACH APPROVAL ENDPOINTS
// ==========================================

// Get pending requests for a coach
router.get('/coach/requests', authenticate, async (req, res) => {
  try {
    const coach = await Coach.findOne({ where: { userId: req.userId } });
    if (!coach) return res.status(404).json({ error: 'Coach profile not found' });

    const pending = await PlayerCoach.findAll({
      where: { coachId: coach.id, status: 'pending' },
      include: [{
        model: Player,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'profilePicture'] }],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json(pending.map(l => ({
      linkId: l.id,
      playerId: l.Player.id,
      name: `${l.Player.User.firstName} ${l.Player.User.lastName}`,
      profilePicture: l.Player.User.profilePicture,
      ranking: l.Player.ranking,
      eloRating: l.Player.eloRating,
      requestedAt: l.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a coaching request
router.put('/coach/requests/:linkId/approve', authenticate, async (req, res) => {
  try {
    const coach = await Coach.findOne({ where: { userId: req.userId } });
    if (!coach) return res.status(404).json({ error: 'Coach profile not found' });

    const link = await PlayerCoach.findOne({
      where: { id: req.params.linkId, coachId: coach.id, status: 'pending' },
    });
    if (!link) return res.status(404).json({ error: 'Pending request not found' });

    await link.update({ status: 'active' });
    res.json({ message: 'Player request approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a coaching request
router.put('/coach/requests/:linkId/reject', authenticate, async (req, res) => {
  try {
    const coach = await Coach.findOne({ where: { userId: req.userId } });
    if (!coach) return res.status(404).json({ error: 'Coach profile not found' });

    const link = await PlayerCoach.findOne({
      where: { id: req.params.linkId, coachId: coach.id, status: 'pending' },
    });
    if (!link) return res.status(404).json({ error: 'Pending request not found' });

    await link.update({ status: 'rejected', endDate: new Date() });
    res.json({ message: 'Player request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

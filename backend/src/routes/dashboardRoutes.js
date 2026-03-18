import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { User, Player, Match, Tournament, TournamentRegistration, Ranking, Activity, Club, ClubMembership, Coach, PlayerCoach } from '../models/index.js';

const router = express.Router();

// ==========================================
// PLAYER DASHBOARD
// ==========================================
router.get('/player', authenticate, async (req, res) => {
  try {
    const { Op } = await import('sequelize');

    const player = await Player.findOne({
      where: { userId: req.userId },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
    });
    if (!player) return res.status(404).json({ error: 'Player profile not found' });

    // Upcoming matches
    const upcomingMatches = await Match.findAll({
      where: {
        [Op.or]: [{ player1Id: player.id }, { player2Id: player.id }],
        status: { [Op.in]: ['scheduled', 'ongoing'] },
      },
      include: [
        { model: Player, as: 'player1', attributes: ['id', 'ranking', 'eloRating'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Player, as: 'player2', attributes: ['id', 'ranking', 'eloRating'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Tournament, attributes: ['id', 'name'] },
      ],
      order: [['scheduledTime', 'ASC']],
      limit: 5,
    });

    // Recent results
    const recentMatches = await Match.findAll({
      where: {
        [Op.or]: [{ player1Id: player.id }, { player2Id: player.id }],
        status: 'completed',
      },
      include: [
        { model: Player, as: 'player1', attributes: ['id', 'ranking'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Player, as: 'player2', attributes: ['id', 'ranking'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Tournament, attributes: ['id', 'name'] },
      ],
      order: [['scheduledTime', 'DESC']],
      limit: 5,
    });

    // Registered tournaments
    const registrations = await TournamentRegistration.findAll({
      where: { playerId: player.id, status: { [Op.in]: ['registered', 'confirmed'] } },
      include: [{ model: Tournament, attributes: ['id', 'name', 'startDate', 'endDate', 'location', 'status'] }],
      limit: 5,
    });

    // World ranking
    const worldRanking = await Ranking.findOne({
      where: { playerId: player.id, category: 'world' },
    });

    // Club memberships
    const clubMemberships = await ClubMembership.findAll({
      where: { userId: req.userId, status: 'active' },
      include: [{ model: Club, attributes: ['id', 'name', 'city', 'country'] }],
    });

    // Current and pending coaches
    const coachLinks = await PlayerCoach.findAll({
      where: { playerId: player.id, status: { [Op.in]: ['active', 'pending'] } },
      include: [{
        model: Coach,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'profilePicture'] }],
      }],
    });
    const mapCoachLink = l => ({
      linkId: l.id,
      coachId: l.Coach.id,
      name: `${l.Coach.User.firstName} ${l.Coach.User.lastName}`,
      profilePicture: l.Coach.User.profilePicture,
      certification: l.Coach.certification,
      specialization: l.Coach.specialization,
      startDate: l.startDate,
      status: l.status,
    });
    const currentCoaches = coachLinks.filter(l => l.status === 'active').map(mapCoachLink);
    const pendingCoaches = coachLinks.filter(l => l.status === 'pending').map(mapCoachLink);

    const completedMatches = await Match.count({
      where: {
        [Op.or]: [{ player1Id: player.id }, { player2Id: player.id }],
        status: 'completed',
      },
    });

    res.json({
      player: {
        id: player.id,
        name: `${player.User.firstName} ${player.User.lastName}`,
        ranking: worldRanking?.rank || player.ranking,
        eloRating: player.eloRating,
        points: player.points,
        wins: player.wins,
        losses: player.losses,
        nationality: player.nationality,
        totalMatches: completedMatches,
        winPercentage: completedMatches > 0 ? Math.round((player.wins / completedMatches) * 100) : 0,
      },
      upcomingMatches,
      recentMatches,
      registeredTournaments: registrations,
      clubs: clubMemberships,
      currentCoaches,
      pendingCoaches,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ORGANISER DASHBOARD
// ==========================================
router.get('/organiser', authenticate, async (req, res) => {
  try {
    const { Op } = await import('sequelize');

    const tournaments = await Tournament.findAll({
      where: { organizerId: req.userId },
      include: [
        { model: TournamentRegistration, as: 'registrations', attributes: ['id'] },
      ],
      order: [['startDate', 'DESC']],
    });

    const tournamentIds = tournaments.map(t => t.id);

    const totalMatches = await Match.count({
      where: { tournamentId: { [Op.in]: tournamentIds } },
    });

    const completedMatches = await Match.count({
      where: { tournamentId: { [Op.in]: tournamentIds }, status: 'completed' },
    });

    const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
    const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing');
    const completedTournaments = tournaments.filter(t => t.status === 'completed');

    res.json({
      stats: {
        totalTournaments: tournaments.length,
        upcoming: upcomingTournaments.length,
        ongoing: ongoingTournaments.length,
        completed: completedTournaments.length,
        totalMatches,
        completedMatches,
      },
      upcomingTournaments,
      ongoingTournaments,
      recentTournaments: completedTournaments.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// COACH DASHBOARD
// ==========================================
router.get('/coach', authenticate, async (req, res) => {
  try {
    const { Coach, PlayerCoach } = await import('../models/index.js');
    const { Op } = await import('sequelize');

    const coach = await Coach.findOne({ where: { userId: req.userId } });
    if (!coach) return res.status(404).json({ error: 'Coach profile not found' });

    // Active players
    const activeLinks = await PlayerCoach.findAll({
      where: { coachId: coach.id, status: 'active' },
    });
    const activePlayerIds = activeLinks.map(pl => pl.playerId);
    const players = await Player.findAll({
      where: { id: { [Op.in]: activePlayerIds } },
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      order: [['ranking', 'ASC']],
    });

    // Pending requests
    const pendingLinks = await PlayerCoach.findAll({
      where: { coachId: coach.id, status: 'pending' },
      include: [{
        model: Player,
        include: [{ model: User, attributes: ['firstName', 'lastName', 'profilePicture'] }],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      coach: {
        id: coach.id,
        certification: coach.certification,
        specialization: coach.specialization,
        experience: coach.experience,
      },
      players: players.map(p => ({
        id: p.id,
        name: `${p.User.firstName} ${p.User.lastName}`,
        ranking: p.ranking,
        eloRating: p.eloRating,
        wins: p.wins,
        losses: p.losses,
        nationality: p.nationality,
      })),
      totalPlayers: players.length,
      pendingRequests: pendingLinks.map(l => ({
        linkId: l.id,
        playerId: l.Player.id,
        name: `${l.Player.User.firstName} ${l.Player.User.lastName}`,
        profilePicture: l.Player.User.profilePicture,
        ranking: l.Player.ranking,
        eloRating: l.Player.eloRating,
        requestedAt: l.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ACTIVITY FEED (Public)
// ==========================================
router.get('/activity-feed', async (req, res) => {
  try {
    const { limit = 15 } = req.query;
    const activities = await Activity.findAll({
      include: [{ model: User, as: 'actor', attributes: ['firstName', 'lastName'], required: false }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// HOME STATS (Public)
// ==========================================
router.get('/home-stats', async (req, res) => {
  try {
    const { Op } = await import('sequelize');

    const totalPlayers = await Player.count({ where: { status: 'active' } });
    const totalTournaments = await Tournament.count();
    const totalMatches = await Match.count({ where: { status: 'completed' } });
    const totalClubs = await Club.count({ where: { status: 'active' } });

    // Top 5 players
    const topPlayers = await Player.findAll({
      include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      order: [['ranking', 'ASC']],
      limit: 5,
    });

    // Upcoming tournaments
    const upcomingTournaments = await Tournament.findAll({
      where: { status: { [Op.in]: ['upcoming', 'ongoing'] } },
      include: [{ model: User, as: 'organizer', attributes: ['firstName', 'lastName'] }],
      order: [['startDate', 'ASC']],
      limit: 4,
    });

    // Recent results
    const recentResults = await Match.findAll({
      where: { status: 'completed' },
      include: [
        { model: Player, as: 'player1', attributes: ['id', 'ranking'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Player, as: 'player2', attributes: ['id', 'ranking'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: Tournament, attributes: ['name'] },
      ],
      order: [['updatedAt', 'DESC']],
      limit: 5,
    });

    res.json({
      counts: { players: totalPlayers, tournaments: totalTournaments, matches: totalMatches, clubs: totalClubs },
      topPlayers,
      upcomingTournaments,
      recentResults,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

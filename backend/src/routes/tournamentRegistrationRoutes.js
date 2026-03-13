import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { Tournament, TournamentRegistration, TournamentDraw, Player, User } from '../models/index.js';
import { generateSingleElimination, generateRoundRobin } from '../utils/bracket.js';

const router = express.Router();

// ==========================================
// TOURNAMENT REGISTRATION ENDPOINTS
// ==========================================

// Register for a tournament (player only)
router.post('/:tournamentId/register', authenticate, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (!tournament.registrationOpen) {
      return res.status(400).json({ error: 'Registration is closed for this tournament' });
    }

    if (tournament.registrationDeadline && new Date() > new Date(tournament.registrationDeadline)) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    if (tournament.registeredParticipants >= tournament.maxParticipants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Find the player profile for this user
    const player = await Player.findOne({ where: { userId: req.userId } });
    if (!player) {
      return res.status(400).json({ error: 'You must have a player profile to register' });
    }

    // Check if already registered
    const existing = await TournamentRegistration.findOne({
      where: { tournamentId, playerId: player.id },
    });
    if (existing) {
      return res.status(400).json({ error: 'You are already registered for this tournament' });
    }

    const registration = await TournamentRegistration.create({
      tournamentId,
      playerId: player.id,
      status: 'registered',
    });

    // Update participant count
    await tournament.increment('registeredParticipants');

    res.status(201).json({ message: 'Successfully registered for tournament', registration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw from tournament
router.delete('/:tournamentId/register', authenticate, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const player = await Player.findOne({ where: { userId: req.userId } });
    if (!player) {
      return res.status(400).json({ error: 'Player profile not found' });
    }

    const registration = await TournamentRegistration.findOne({
      where: { tournamentId, playerId: player.id },
    });
    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    await registration.update({ status: 'withdrawn' });

    const tournament = await Tournament.findByPk(tournamentId);
    if (tournament && tournament.registeredParticipants > 0) {
      await tournament.decrement('registeredParticipants');
    }

    res.json({ message: 'Successfully withdrawn from tournament' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get registrations for a tournament
router.get('/:tournamentId/registrations', async (req, res) => {
  try {
    const registrations = await TournamentRegistration.findAll({
      where: { tournamentId: req.params.tournamentId },
      include: [{
        model: Player,
        include: [{
          model: User,
          attributes: ['firstName', 'lastName', 'profilePicture'],
        }],
      }],
      order: [['seedNumber', 'ASC'], ['registeredAt', 'ASC']],
    });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if current user is registered for a tournament
router.get('/:tournamentId/my-registration', authenticate, async (req, res) => {
  try {
    const player = await Player.findOne({ where: { userId: req.userId } });
    if (!player) {
      return res.json({ registered: false });
    }

    const registration = await TournamentRegistration.findOne({
      where: {
        tournamentId: req.params.tournamentId,
        playerId: player.id,
        status: ['registered', 'confirmed'],
      },
    });

    res.json({ registered: !!registration, registration });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed players (organiser only)
router.put('/:tournamentId/seed', authenticate, authorize('organiser'), async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    // Auto-seed based on ranking
    const registrations = await TournamentRegistration.findAll({
      where: { tournamentId, status: ['registered', 'confirmed'] },
      include: [{
        model: Player,
        attributes: ['id', 'ranking', 'eloRating', 'points'],
      }],
    });

    // Sort by ELO rating (highest first), then by ranking
    const sorted = registrations.sort((a, b) => {
      const aRating = parseFloat(a.Player?.eloRating || 1500);
      const bRating = parseFloat(b.Player?.eloRating || 1500);
      return bRating - aRating;
    });

    // Assign seed numbers
    for (let i = 0; i < sorted.length; i++) {
      await sorted[i].update({ seedNumber: i + 1, status: 'confirmed' });
    }

    res.json({ message: `${sorted.length} players seeded successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TOURNAMENT DRAW / BRACKET ENDPOINTS
// ==========================================

// Generate draw/bracket (organiser only)
router.post('/:tournamentId/draw', authenticate, authorize('organiser'), async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Get confirmed/registered players
    const registrations = await TournamentRegistration.findAll({
      where: { tournamentId, status: ['registered', 'confirmed'] },
      include: [{
        model: Player,
        include: [{ model: User, attributes: ['firstName', 'lastName'] }],
      }],
      order: [['seedNumber', 'ASC']],
    });

    if (registrations.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 registered players to generate a draw' });
    }

    const players = registrations.map(r => ({
      playerId: r.Player.id,
      seedNumber: r.seedNumber,
      playerName: `${r.Player.User.firstName} ${r.Player.User.lastName}`,
    }));

    const drawType = tournament.drawType || 'single_elimination';
    let bracketData;

    if (drawType === 'round_robin') {
      bracketData = generateRoundRobin(players);
    } else {
      bracketData = generateSingleElimination(players);
    }

    // Delete existing draw if any
    await TournamentDraw.destroy({ where: { tournamentId } });

    const draw = await TournamentDraw.create({
      tournamentId,
      drawType,
      totalRounds: bracketData.totalRounds,
      bracketData,
      status: 'published',
    });

    // Close registration
    await tournament.update({ registrationOpen: false, status: 'ongoing' });

    res.status(201).json({ message: 'Draw generated successfully', draw });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tournament draw/bracket
router.get('/:tournamentId/draw', async (req, res) => {
  try {
    const draw = await TournamentDraw.findOne({
      where: { tournamentId: req.params.tournamentId },
    });
    if (!draw) {
      return res.status(404).json({ error: 'No draw found for this tournament' });
    }
    res.json(draw);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

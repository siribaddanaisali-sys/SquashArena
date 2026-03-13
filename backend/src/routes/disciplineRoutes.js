import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { Discipline, Player, User, Tournament, Match } from '../models/index.js';

const router = express.Router();

// Get all discipline records (regulator/organiser)
router.get('/', authenticate, authorize('regulator', 'organiser'), async (req, res) => {
  try {
    const { status, type, playerId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (playerId) where.playerId = playerId;

    const records = await Discipline.findAll({
      where,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'ranking', 'nationality'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
        { model: User, as: 'issuer', attributes: ['firstName', 'lastName'] },
        { model: Tournament, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get discipline history for a specific player (public)
router.get('/player/:playerId', async (req, res) => {
  try {
    const records = await Discipline.findAll({
      where: { playerId: req.params.playerId },
      include: [
        { model: User, as: 'issuer', attributes: ['firstName', 'lastName'] },
        { model: Tournament, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Issue a discipline action (regulator only)
router.post('/', authenticate, authorize('regulator'), async (req, res) => {
  try {
    const { playerId, type, reason, tournamentId, matchId, endDate } = req.body;

    const player = await Player.findByPk(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const record = await Discipline.create({
      playerId,
      issuedBy: req.userId,
      type,
      reason,
      tournamentId: tournamentId || null,
      matchId: matchId || null,
      startDate: new Date(),
      endDate: endDate || null,
      status: 'active',
    });

    res.status(201).json({ message: 'Discipline action issued', record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update discipline record (appeal/overturn)
router.put('/:id', authenticate, authorize('regulator'), async (req, res) => {
  try {
    const record = await Discipline.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Discipline record not found' });

    const { status, reason, endDate } = req.body;
    await record.update({
      ...(status && { status }),
      ...(reason && { reason }),
      ...(endDate && { endDate }),
    });

    res.json({ message: 'Discipline record updated', record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete discipline record (regulator only)
router.delete('/:id', authenticate, authorize('regulator'), async (req, res) => {
  try {
    const record = await Discipline.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: 'Discipline record not found' });

    await record.destroy();
    res.json({ message: 'Discipline record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

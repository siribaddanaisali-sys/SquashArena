import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Tournament from '../models/Tournament.js';
import User from '../models/User.js';

const router = express.Router();

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const tournaments = await Tournament.findAll({
      where,
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['firstName', 'lastName'],
      }],
      order: [['startDate', 'DESC']],
    });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'organizer',
        attributes: { exclude: ['password'] },
      }],
    });
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create tournament
router.post('/', authenticate, authorize('organiser'), async (req, res) => {
  try {
    const { name, description, startDate, endDate, category, location, maxParticipants } = req.body;

    const tournament = await Tournament.create({
      name,
      description,
      startDate,
      endDate,
      category,
      location,
      maxParticipants,
      organizerId: req.userId,
      status: 'upcoming',
    });

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tournament
router.put('/:id', authenticate, authorize('organiser'), async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const { name, description, status, location } = req.body;
    await tournament.update({ name, description, status, location });

    res.json({ message: 'Tournament updated successfully', tournament });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

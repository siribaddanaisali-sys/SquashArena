import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Venue from '../models/Venue.js';

const router = express.Router();

// Get all venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.findAll({
      order: [['city', 'ASC']],
    });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get venue by ID
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create venue
router.post('/', authenticate, authorize('organiser', 'regulator'), async (req, res) => {
  try {
    const { name, city, country, address, numCourts, contactPhone, contactEmail } = req.body;

    const venue = await Venue.create({
      name,
      city,
      country,
      address,
      numCourts,
      contactPhone,
      contactEmail,
    });

    res.status(201).json({
      message: 'Venue created successfully',
      venue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update venue
router.put('/:id', authenticate, authorize('organiser', 'regulator'), async (req, res) => {
  try {
    const venue = await Venue.findByPk(req.params.id);
    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    const { name, city, country, address, numCourts, status } = req.body;
    await venue.update({ name, city, country, address, numCourts, status });

    res.json({ message: 'Venue updated successfully', venue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

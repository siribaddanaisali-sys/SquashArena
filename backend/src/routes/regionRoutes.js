import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Region from '../models/Region.js';

const router = express.Router();

// Get all regions (public)
router.get('/', async (req, res) => {
  try {
    const regions = await Region.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']],
    });
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get region by ID
router.get('/:id', async (req, res) => {
  try {
    const region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).json({ error: 'Region not found' });
    res.json(region);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create region (super_admin only)
router.post('/', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { name, code, continent } = req.body;
    const region = await Region.create({ name, code, continent });
    res.status(201).json({ message: 'Region created', region });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update region (super_admin only)
router.put('/:id', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).json({ error: 'Region not found' });

    const { name, code, continent, status } = req.body;
    await region.update({ name, code, continent, status });
    res.json({ message: 'Region updated', region });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

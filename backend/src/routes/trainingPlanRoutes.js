import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { TrainingPlan, Coach, Player, User } from '../models/index.js';

const router = express.Router();

// Get training plans for the logged-in coach
router.get('/coach', authenticate, authorize('coach'), async (req, res) => {
  try {
    const coach = await Coach.findOne({ where: { userId: req.userId } });
    if (!coach) return res.status(404).json({ error: 'Coach profile not found' });

    const plans = await TrainingPlan.findAll({
      where: { coachId: coach.id },
      include: [
        { model: Player, as: 'player', attributes: ['id', 'ranking', 'nationality'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get training plans for the logged-in player
router.get('/player', authenticate, async (req, res) => {
  try {
    const player = await Player.findOne({ where: { userId: req.userId } });
    if (!player) return res.status(404).json({ error: 'Player profile not found' });

    const plans = await TrainingPlan.findAll({
      where: { playerId: player.id },
      include: [
        { model: Coach, as: 'coach', attributes: ['id', 'certification', 'specialization'], include: [{ model: User, attributes: ['firstName', 'lastName'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a training plan (coach only)
router.post('/', authenticate, authorize('coach'), async (req, res) => {
  try {
    const coach = await Coach.findOne({ where: { userId: req.userId } });
    if (!coach) return res.status(404).json({ error: 'Coach profile not found' });

    const { playerId, title, description, category, startDate, endDate, exercises } = req.body;

    const player = await Player.findByPk(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const plan = await TrainingPlan.create({
      coachId: coach.id,
      playerId,
      title,
      description,
      category,
      startDate,
      endDate,
      exercises: exercises || [],
    });

    res.status(201).json({ message: 'Training plan created', plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a training plan (coach only)
router.put('/:id', authenticate, authorize('coach'), async (req, res) => {
  try {
    const plan = await TrainingPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Training plan not found' });

    const { title, description, category, startDate, endDate, exercises, status } = req.body;
    await plan.update({
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(exercises && { exercises }),
      ...(status && { status }),
    });

    res.json({ message: 'Training plan updated', plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a training plan (coach only)
router.delete('/:id', authenticate, authorize('coach'), async (req, res) => {
  try {
    const plan = await TrainingPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Training plan not found' });

    await plan.destroy();
    res.json({ message: 'Training plan deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { Club, ClubMembership, User, Player, Activity } from '../models/index.js';

const router = express.Router();

// Get all clubs
router.get('/', async (req, res) => {
  try {
    const { country, city, search } = req.query;
    const { Op } = await import('sequelize');
    const where = { status: 'active' };

    if (country) where.country = country;
    if (city) where.city = city;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { city: { [Op.like]: `%${search}%` } },
        { country: { [Op.like]: `%${search}%` } },
      ];
    }

    const clubs = await Club.findAll({
      where,
      include: [{
        model: User,
        as: 'owner',
        attributes: ['firstName', 'lastName'],
      }],
      order: [['name', 'ASC']],
    });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single club with members
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['firstName', 'lastName', 'email'],
      }],
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const members = await ClubMembership.findAll({
      where: { clubId: club.id, status: 'active' },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'role', 'profilePicture'],
        include: [{
          model: Player,
          attributes: ['id', 'ranking', 'eloRating', 'nationality'],
          required: false,
        }],
      }],
      order: [['role', 'ASC']],
    });

    res.json({ club, members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a club
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, city, country, address, website, contactEmail, contactPhone, foundedYear } = req.body;
    if (!name || !city || !country) {
      return res.status(400).json({ error: 'Name, city, and country are required' });
    }

    const club = await Club.create({
      name, description, city, country, address, website, contactEmail, contactPhone, foundedYear,
      ownerId: req.userId,
      memberCount: 1,
    });

    // Auto-add creator as admin member
    await ClubMembership.create({
      clubId: club.id,
      userId: req.userId,
      role: 'admin',
      status: 'active',
    });

    await Activity.create({
      type: 'club_created',
      title: `New Club: ${name}`,
      description: `${name} has been established in ${city}, ${country}`,
      userId: req.userId,
      metadata: { clubId: club.id },
    });

    res.status(201).json({ message: 'Club created successfully', club });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update club
router.put('/:id', authenticate, async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    // Only owner or admin member can update
    const membership = await ClubMembership.findOne({
      where: { clubId: club.id, userId: req.userId, role: 'admin', status: 'active' },
    });
    if (club.ownerId !== req.userId && !membership) {
      return res.status(403).json({ error: 'Only club admin can update' });
    }

    const { name, description, city, country, address, website, contactEmail, contactPhone } = req.body;
    await club.update({ name, description, city, country, address, website, contactEmail, contactPhone });
    res.json({ message: 'Club updated', club });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join a club
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const existing = await ClubMembership.findOne({
      where: { clubId: club.id, userId: req.userId },
    });
    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({ error: 'Already a member' });
      }
      await existing.update({ status: 'active', joinedAt: new Date() });
    } else {
      await ClubMembership.create({
        clubId: club.id,
        userId: req.userId,
        role: 'member',
        status: 'active',
      });
    }

    await club.update({ memberCount: club.memberCount + 1 });

    await Activity.create({
      type: 'club_joined',
      title: 'New Club Member',
      description: `A new member joined ${club.name}`,
      userId: req.userId,
      metadata: { clubId: club.id },
    });

    res.json({ message: `Joined ${club.name} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave a club
router.delete('/:id/leave', authenticate, async (req, res) => {
  try {
    const membership = await ClubMembership.findOne({
      where: { clubId: req.params.id, userId: req.userId, status: 'active' },
    });
    if (!membership) return res.status(404).json({ error: 'Not a member' });

    await membership.update({ status: 'left' });

    const club = await Club.findByPk(req.params.id);
    if (club && club.memberCount > 0) {
      await club.update({ memberCount: club.memberCount - 1 });
    }

    res.json({ message: 'Left club successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check membership
router.get('/:id/my-membership', authenticate, async (req, res) => {
  try {
    const membership = await ClubMembership.findOne({
      where: { clubId: req.params.id, userId: req.userId },
    });
    res.json({
      isMember: membership?.status === 'active',
      role: membership?.role || null,
      membership,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { Club, ClubMembership, User, Player, Activity, Notification } from '../models/index.js';

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

// Request to join a club (pending approval)
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
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Join request already pending' });
      }
      // Re-request if previously left or suspended
      await existing.update({ status: 'pending', role: 'member' });
    } else {
      await ClubMembership.create({
        clubId: club.id,
        userId: req.userId,
        role: 'member',
        status: 'pending',
      });
    }

    // Notify club admins about the join request
    const requester = await User.findByPk(req.userId, { attributes: ['firstName', 'lastName'] });
    const adminMembers = await ClubMembership.findAll({
      where: { clubId: club.id, role: 'admin', status: 'active' },
      attributes: ['userId'],
    });
    const notifications = adminMembers.map(admin => ({
      userId: admin.userId,
      type: 'club_invite',
      title: 'New Join Request',
      message: `${requester.firstName} ${requester.lastName} wants to join ${club.name}`,
      link: `/clubs/${club.id}`,
      metadata: { clubId: club.id, requesterId: req.userId },
    }));
    if (notifications.length > 0) {
      await Notification.bulkCreate(notifications);
    }

    res.json({ message: `Join request sent to ${club.name}. Waiting for admin approval.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending join requests (club admin only)
router.get('/:id/pending', authenticate, async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const adminCheck = await ClubMembership.findOne({
      where: { clubId: club.id, userId: req.userId, role: 'admin', status: 'active' },
    });
    if (club.ownerId !== req.userId && !adminCheck) {
      return res.status(403).json({ error: 'Only club admins can view pending requests' });
    }

    const pending = await ClubMembership.findAll({
      where: { clubId: club.id, status: 'pending' },
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'profilePicture'],
        include: [{
          model: Player,
          attributes: ['id', 'ranking', 'eloRating', 'nationality'],
          required: false,
        }],
      }],
      order: [['createdAt', 'ASC']],
    });

    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve a join request (club admin only)
router.post('/:id/approve/:membershipId', authenticate, async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const adminCheck = await ClubMembership.findOne({
      where: { clubId: club.id, userId: req.userId, role: 'admin', status: 'active' },
    });
    if (club.ownerId !== req.userId && !adminCheck) {
      return res.status(403).json({ error: 'Only club admins can approve requests' });
    }

    const membership = await ClubMembership.findOne({
      where: { id: req.params.membershipId, clubId: club.id, status: 'pending' },
    });
    if (!membership) return res.status(404).json({ error: 'Pending request not found' });

    await membership.update({ status: 'active', joinedAt: new Date() });
    await club.update({ memberCount: club.memberCount + 1 });

    // Notify the user they've been approved
    await Notification.create({
      userId: membership.userId,
      type: 'club_invite',
      title: 'Club Membership Approved',
      message: `Your request to join ${club.name} has been approved! Welcome to the club.`,
      link: `/clubs/${club.id}`,
      metadata: { clubId: club.id },
    });

    await Activity.create({
      type: 'club_joined',
      title: 'New Club Member',
      description: `A new member joined ${club.name}`,
      userId: membership.userId,
      metadata: { clubId: club.id },
    });

    res.json({ message: 'Member approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject a join request (club admin only)
router.post('/:id/reject/:membershipId', authenticate, async (req, res) => {
  try {
    const club = await Club.findByPk(req.params.id);
    if (!club) return res.status(404).json({ error: 'Club not found' });

    const adminCheck = await ClubMembership.findOne({
      where: { clubId: club.id, userId: req.userId, role: 'admin', status: 'active' },
    });
    if (club.ownerId !== req.userId && !adminCheck) {
      return res.status(403).json({ error: 'Only club admins can reject requests' });
    }

    const membership = await ClubMembership.findOne({
      where: { id: req.params.membershipId, clubId: club.id, status: 'pending' },
    });
    if (!membership) return res.status(404).json({ error: 'Pending request not found' });

    await membership.destroy();

    // Notify the user they've been rejected
    await Notification.create({
      userId: membership.userId,
      type: 'club_invite',
      title: 'Club Request Declined',
      message: `Your request to join ${club.name} was not approved at this time.`,
      link: `/clubs/${club.id}`,
      metadata: { clubId: club.id },
    });

    res.json({ message: 'Request rejected' });
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
      isPending: membership?.status === 'pending',
      role: membership?.role || null,
      membership,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

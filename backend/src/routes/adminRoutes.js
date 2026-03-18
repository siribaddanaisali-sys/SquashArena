import express from 'express';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import { Op } from 'sequelize';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  User, Player, Coach, Tournament, Match, Venue, Club, Discipline, Ranking, Region,
  AuditLog, ApprovalRequest, SuperAdminTransfer,
} from '../models/index.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// Helper: build region filter for non-super_admin users
// admin role is also region-restricted
const getRegionWhere = (req, field = 'regionId') => {
  if (req.userRole === 'super_admin') return {};
  if (!req.userRegionId) return {};
  return { [field]: req.userRegionId };
};

// Allowed roles for admin panel access
const ADMIN_ROLES = ['regulator', 'organiser', 'super_admin', 'admin'];
const ELEVATED_ROLES = ['regulator', 'super_admin', 'admin'];

// ==========================================
// ADMIN OVERVIEW STATS
// ==========================================
router.get('/stats', authenticate, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    const regionFilter = getRegionWhere(req);

    const totalUsers = await User.count({ where: regionFilter });
    const totalPlayers = await Player.count({
      include: [{ model: User, where: regionFilter, attributes: [] }],
    });
    const totalCoaches = await Coach.count({
      include: [{ model: User, where: regionFilter, attributes: [] }],
    });
    const totalTournaments = await Tournament.count({ where: regionFilter });
    const totalMatches = await Match.count();
    const totalVenues = await Venue.count();
    const totalClubs = await Club.count();
    const activeDisciplines = await Discipline.count({ where: { status: 'active' } });
    const pendingApprovals = await ApprovalRequest.count({ where: { status: 'pending' } });

    const usersByRole = await User.findAll({
      where: regionFilter,
      attributes: ['role', [await import('sequelize').then(m => m.fn('COUNT', m.col('id'))), 'count']],
      group: ['role'],
    });

    res.json({
      totalUsers, totalPlayers, totalCoaches, totalTournaments,
      totalMatches, totalVenues, totalClubs, activeDisciplines,
      pendingApprovals,
      usersByRole,
      regionId: req.userRegionId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// USER MANAGEMENT
// ==========================================
router.get('/users', authenticate, authorize(...ELEVATED_ROLES), async (req, res) => {
  try {
    const { role, status } = req.query;
    const where = { ...getRegionWhere(req) };
    if (role) where.role = role;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [{ model: Region, as: 'region', attributes: ['id', 'name', 'code'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle user active status (suspend / reactivate)
router.put('/users/:id/toggle-status', authenticate, authorize(...ELEVATED_ROLES), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Region guard: non-super_admin can only manage users in their region
    if (req.userRole !== 'super_admin' && req.userRegionId && user.regionId !== req.userRegionId) {
      return res.status(403).json({ error: 'Access denied: user outside your region' });
    }

    // Cannot deactivate a super_admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot deactivate SuperAdmin' });
    }

    const oldValue = { isActive: user.isActive };
    await user.update({ isActive: !user.isActive });

    await logAudit({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: user.id,
      oldValue,
      newValue: { isActive: user.isActive },
      ipAddress: req.ip,
    });

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { id: user.id, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ROLE MANAGEMENT (promote / demote)
// ==========================================

// Promote user to Admin — SuperAdmin only
// Security: No user can assign roles to themselves
router.put('/users/:id/promote', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Cannot promote yourself
    if (targetUser.id === req.userId) {
      return res.status(403).json({ error: 'Cannot promote yourself' });
    }

    // Can only promote non-admin/non-superadmin users to admin
    if (targetUser.role === 'super_admin') {
      return res.status(400).json({ error: 'User is already SuperAdmin' });
    }
    if (targetUser.role === 'admin') {
      return res.status(400).json({ error: 'User is already an Admin' });
    }

    const { regionId } = req.body;
    const oldValue = { role: targetUser.role, regionId: targetUser.regionId };

    const updates = { role: 'admin' };
    if (regionId) updates.regionId = regionId;

    await targetUser.update(updates);

    await logAudit({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: targetUser.id,
      oldValue,
      newValue: { role: 'admin', regionId: targetUser.regionId },
      ipAddress: req.ip,
    });

    res.json({
      message: `${targetUser.firstName} ${targetUser.lastName} promoted to Admin`,
      user: { id: targetUser.id, role: targetUser.role, regionId: targetUser.regionId },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demote Admin to Organiser — SuperAdmin only
router.put('/users/:id/demote', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const targetUser = await User.findByPk(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    if (targetUser.id === req.userId) {
      return res.status(403).json({ error: 'Cannot demote yourself' });
    }

    if (targetUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot demote SuperAdmin via this endpoint. Use transfer instead.' });
    }

    if (targetUser.role !== 'admin') {
      return res.status(400).json({ error: 'User is not an Admin — nothing to demote' });
    }

    const oldValue = { role: targetUser.role };
    await targetUser.update({ role: 'organiser' });

    await logAudit({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: targetUser.id,
      oldValue,
      newValue: { role: 'organiser' },
      ipAddress: req.ip,
    });

    res.json({
      message: `${targetUser.firstName} ${targetUser.lastName} demoted to Organiser`,
      user: { id: targetUser.id, role: targetUser.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PLAYER VERIFICATION
// ==========================================
router.get('/players', authenticate, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    const regionFilter = getRegionWhere(req);
    const players = await Player.findAll({
      include: [{ model: User, where: regionFilter, attributes: { exclude: ['password'] } }],
      order: [['ranking', 'ASC']],
    });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update player status (verify/suspend)
router.put('/players/:id/status', authenticate, authorize(...ELEVATED_ROLES), async (req, res) => {
  try {
    const player = await Player.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['regionId'] }],
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (req.userRole !== 'super_admin' && req.userRegionId && player.User?.regionId !== req.userRegionId) {
      return res.status(403).json({ error: 'Access denied: player outside your region' });
    }

    const { status } = req.body;
    if (!['active', 'inactive', 'retired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const oldValue = { status: player.status };
    await player.update({ status });

    await logAudit({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'Player',
      entityId: player.id,
      oldValue,
      newValue: { status },
      ipAddress: req.ip,
    });

    res.json({ message: `Player status updated to ${status}`, player });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TOURNAMENT OVERSIGHT (region-filtered)
// ==========================================
router.get('/tournaments', authenticate, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    const regionFilter = getRegionWhere(req);
    const tournaments = await Tournament.findAll({
      where: regionFilter,
      include: [
        { model: User, as: 'organizer', attributes: ['firstName', 'lastName', 'email'] },
        { model: Region, as: 'region', attributes: ['id', 'name', 'code'] },
      ],
      order: [['startDate', 'DESC']],
    });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update tournament status
router.put('/tournaments/:id/status', authenticate, authorize(...ELEVATED_ROLES), async (req, res) => {
  try {
    const tournament = await Tournament.findByPk(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    if (req.userRole !== 'super_admin' && req.userRegionId && tournament.regionId !== req.userRegionId) {
      return res.status(403).json({ error: 'Access denied: tournament outside your region' });
    }

    const { status } = req.body;
    const oldValue = { status: tournament.status };
    await tournament.update({ status });

    await logAudit({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'Tournament',
      entityId: tournament.id,
      oldValue,
      newValue: { status },
      ipAddress: req.ip,
    });

    res.json({ message: `Tournament status updated to ${status}`, tournament });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// REGION MANAGEMENT (super_admin only)
// ==========================================
router.get('/regions', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const regions = await Region.findAll({ order: [['name', 'ASC']] });
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign region to user (super_admin only)
router.put('/users/:id/region', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const oldValue = { regionId: user.regionId };
    const { regionId } = req.body;
    await user.update({ regionId });

    await logAudit({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: user.id,
      oldValue,
      newValue: { regionId },
      ipAddress: req.ip,
    });

    res.json({ message: 'User region updated', user: { id: user.id, regionId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// APPROVAL WORKFLOW (sensitive actions)
// ==========================================

// Submit an approval request (admin/organiser/regulator submits for SuperAdmin review)
// Sensitive actions: delete_tournament, update_match_result, modify_ranking
router.post('/approvals', authenticate, authorize(...ADMIN_ROLES), async (req, res) => {
  try {
    const { actionType, entityType, entityId, payload } = req.body;

    const allowed = ['delete_tournament', 'update_match_result', 'modify_ranking'];
    if (!allowed.includes(actionType)) {
      return res.status(400).json({ error: `Invalid actionType. Allowed: ${allowed.join(', ')}` });
    }

    if (!['Tournament', 'Match', 'Ranking'].includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entityType' });
    }

    // Check for duplicate pending request
    const existing = await ApprovalRequest.findOne({
      where: { userId: req.userId, entityType, entityId, actionType, status: 'pending' },
    });
    if (existing) {
      return res.status(409).json({ error: 'A pending request for this action already exists' });
    }

    const request = await ApprovalRequest.create({
      userId: req.userId,
      actionType,
      entityType,
      entityId,
      payload: payload || null,
    });

    await logAudit({
      userId: req.userId,
      action: 'CREATE',
      entity: 'ApprovalRequest',
      entityId: request.id,
      newValue: { actionType, entityType, entityId },
      ipAddress: req.ip,
    });

    res.status(201).json({ message: 'Approval request submitted', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List approval requests
// SuperAdmin sees all; admin/regulator sees their own region's requests
router.get('/approvals', authenticate, authorize('super_admin', 'admin', 'regulator'), async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const requests = await ApprovalRequest.findAll({
      where,
      include: [
        { model: User, as: 'requester', attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'regionId'] },
        { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName'], required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Non-super_admin: filter to requests from users in their region
    const filtered = req.userRole === 'super_admin'
      ? requests
      : requests.filter(r => r.requester?.regionId === req.userRegionId);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve an approval request — SuperAdmin only
// Executes the pending action upon approval
router.put('/approvals/:id/approve', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const request = await ApprovalRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    const { note } = req.body;

    // Execute the approved action
    let result = null;
    if (request.actionType === 'delete_tournament') {
      const tournament = await Tournament.findByPk(request.entityId);
      if (tournament) {
        await logAudit({
          userId: req.userId,
          action: 'DELETE',
          entity: 'Tournament',
          entityId: tournament.id,
          oldValue: tournament.toJSON(),
          ipAddress: req.ip,
        });
        await tournament.destroy();
        result = 'Tournament deleted';
      }
    } else if (request.actionType === 'update_match_result') {
      const match = await Match.findByPk(request.entityId);
      if (match && request.payload) {
        const oldValue = match.toJSON();
        await match.update(request.payload);
        await logAudit({
          userId: req.userId,
          action: 'UPDATE',
          entity: 'Match',
          entityId: match.id,
          oldValue,
          newValue: request.payload,
          ipAddress: req.ip,
        });
        result = 'Match result updated';
      }
    } else if (request.actionType === 'modify_ranking') {
      const ranking = await Ranking.findByPk(request.entityId);
      if (ranking && request.payload) {
        const oldValue = ranking.toJSON();
        await ranking.update(request.payload);
        await logAudit({
          userId: req.userId,
          action: 'UPDATE',
          entity: 'Ranking',
          entityId: ranking.id,
          oldValue,
          newValue: request.payload,
          ipAddress: req.ip,
        });
        result = 'Ranking modified';
      }
    }

    await request.update({
      status: 'approved',
      reviewedBy: req.userId,
      reviewNote: note || null,
      reviewedAt: new Date(),
    });

    res.json({ message: 'Request approved and executed', result, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject an approval request — SuperAdmin only
router.put('/approvals/:id/reject', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const request = await ApprovalRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}` });
    }

    const { note } = req.body;
    await request.update({
      status: 'rejected',
      reviewedBy: req.userId,
      reviewNote: note || null,
      reviewedAt: new Date(),
    });

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AUDIT LOGS
// ==========================================

// View audit logs — SuperAdmin sees all, admin/regulator sees own actions
router.get('/audit-logs', authenticate, authorize('super_admin', 'admin', 'regulator'), async (req, res) => {
  try {
    const { entity, action, limit = 100, offset = 0 } = req.query;
    const where = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    // Non-super_admin can only see their own audit logs
    if (req.userRole !== 'super_admin') {
      where.userId = req.userId;
    }

    const logs = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 500),
      offset: parseInt(offset),
    });

    res.json({ logs: logs.rows, total: logs.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rollback a change using audit log — SuperAdmin only
// Reads oldValue from the audit log and restores the entity
router.post('/audit-logs/:id/rollback', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const auditEntry = await AuditLog.findByPk(req.params.id);
    if (!auditEntry) return res.status(404).json({ error: 'Audit log entry not found' });

    if (!auditEntry.oldValue) {
      return res.status(400).json({ error: 'No old value stored — rollback not possible' });
    }

    // Determine the model to rollback
    const modelMap = { Tournament, Match, Ranking, User, Player };
    const Model = modelMap[auditEntry.entity];
    if (!Model) {
      return res.status(400).json({ error: `Rollback not supported for entity: ${auditEntry.entity}` });
    }

    if (auditEntry.action === 'DELETE') {
      // Re-create the deleted entity
      const restored = await Model.create(auditEntry.oldValue);
      await logAudit({
        userId: req.userId,
        action: 'CREATE',
        entity: auditEntry.entity,
        entityId: restored.id,
        newValue: restored.toJSON(),
        ipAddress: req.ip,
      });
      return res.json({ message: `${auditEntry.entity} restored from deletion`, restored });
    }

    if (auditEntry.action === 'UPDATE') {
      const record = await Model.findByPk(auditEntry.entityId);
      if (!record) return res.status(404).json({ error: 'Entity no longer exists' });

      const currentValue = record.toJSON();
      await record.update(auditEntry.oldValue);
      await logAudit({
        userId: req.userId,
        action: 'UPDATE',
        entity: auditEntry.entity,
        entityId: record.id,
        oldValue: currentValue,
        newValue: auditEntry.oldValue,
        ipAddress: req.ip,
      });
      return res.json({ message: `${auditEntry.entity} rolled back to previous state`, record });
    }

    res.status(400).json({ error: 'Rollback only supported for UPDATE and DELETE actions' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SUPERADMIN TRANSFER SYSTEM
// ==========================================

// Step 1: Initiate transfer — current SuperAdmin selects target user
// Creates a pending transfer with a secure confirmation token
router.post('/transfer/initiate', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ error: 'toUserId is required' });

    // Cannot transfer to yourself
    if (toUserId === req.userId) {
      return res.status(400).json({ error: 'Cannot transfer SuperAdmin to yourself' });
    }

    const targetUser = await User.findByPk(toUserId);
    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });
    if (!targetUser.isActive) return res.status(400).json({ error: 'Target user is inactive' });

    // Cancel any existing pending transfers
    await SuperAdminTransfer.update(
      { status: 'cancelled' },
      { where: { fromUserId: req.userId, status: 'pending' } }
    );

    // Generate a secure confirmation token (32 bytes → 64-char hex string)
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Transfer expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const transfer = await SuperAdminTransfer.create({
      fromUserId: req.userId,
      toUserId,
      confirmationToken,
      expiresAt,
    });

    await logAudit({
      userId: req.userId,
      action: 'CREATE',
      entity: 'SuperAdminTransfer',
      entityId: transfer.id,
      newValue: { toUserId, expiresAt },
      ipAddress: req.ip,
    });

    // Return the token — in production this would be sent via secure channel
    res.json({
      message: 'Transfer initiated. Confirm with your password and the token below.',
      transferId: transfer.id,
      confirmationToken,
      expiresAt,
      targetUser: { id: targetUser.id, name: `${targetUser.firstName} ${targetUser.lastName}`, email: targetUser.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Confirm transfer — requires password re-entry + confirmation token
router.post('/transfer/confirm', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const { transferId, confirmationToken, password } = req.body;
    if (!transferId || !confirmationToken || !password) {
      return res.status(400).json({ error: 'transferId, confirmationToken, and password are required' });
    }

    // Verify the SuperAdmin's password
    const currentAdmin = await User.findByPk(req.userId);
    const isPasswordValid = await bcryptjs.compare(password, currentAdmin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const transfer = await SuperAdminTransfer.findByPk(transferId);
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

    // Verify it belongs to the current user
    if (transfer.fromUserId !== req.userId) {
      return res.status(403).json({ error: 'This transfer was not initiated by you' });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({ error: `Transfer is already ${transfer.status}` });
    }

    // Check expiration
    if (new Date() > new Date(transfer.expiresAt)) {
      await transfer.update({ status: 'expired' });
      return res.status(400).json({ error: 'Transfer has expired. Please initiate a new one.' });
    }

    // Verify token (constant-time comparison to prevent timing attacks)
    if (!crypto.timingSafeEqual(
      Buffer.from(transfer.confirmationToken),
      Buffer.from(confirmationToken)
    )) {
      return res.status(401).json({ error: 'Invalid confirmation token' });
    }

    // Execute the transfer
    const newAdmin = await User.findByPk(transfer.toUserId);
    if (!newAdmin) return res.status(404).json({ error: 'Target user no longer exists' });

    // Promote target → super_admin
    await newAdmin.update({ role: 'super_admin' });
    // Downgrade current → admin
    await currentAdmin.update({ role: 'admin' });

    await transfer.update({ status: 'confirmed', confirmedAt: new Date() });

    await logAudit({
      userId: req.userId,
      action: 'UPDATE',
      entity: 'SuperAdminTransfer',
      entityId: transfer.id,
      oldValue: { fromRole: 'super_admin', toRole: newAdmin.role },
      newValue: { newSuperAdmin: newAdmin.id, previousSuperAdmin: currentAdmin.id },
      ipAddress: req.ip,
    });

    res.json({
      message: 'SuperAdmin transfer completed successfully',
      newSuperAdmin: { id: newAdmin.id, name: `${newAdmin.firstName} ${newAdmin.lastName}` },
      previousSuperAdmin: { id: currentAdmin.id, role: 'admin' },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending transfer (if any)
router.get('/transfer/pending', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const transfer = await SuperAdminTransfer.findOne({
      where: { fromUserId: req.userId, status: 'pending' },
      include: [
        { model: User, as: 'toUser', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
    });

    // Auto-expire if past due
    if (transfer && new Date() > new Date(transfer.expiresAt)) {
      await transfer.update({ status: 'expired' });
      return res.json({ transfer: null });
    }

    res.json({ transfer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel pending transfer
router.post('/transfer/cancel', authenticate, authorize('super_admin'), async (req, res) => {
  try {
    const transfer = await SuperAdminTransfer.findOne({
      where: { fromUserId: req.userId, status: 'pending' },
    });
    if (!transfer) return res.status(404).json({ error: 'No pending transfer found' });

    await transfer.update({ status: 'cancelled' });
    res.json({ message: 'Transfer cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DATABASE VIEWER (super_admin / regulator only)
// ==========================================
router.get('/database-viewer', authenticate, authorize('regulator', 'super_admin'), async (req, res) => {
  try {
    const { QueryTypes } = await import('sequelize');
    const sequelize = (await import('../../config/database.js')).default;

    const tableRows = await sequelize.query('SHOW TABLES', { type: QueryTypes.SELECT });
    const tableKey = Object.keys(tableRows[0])[0];
    const tableNames = tableRows.map(t => t[tableKey]);

    const tables = {};
    for (const name of tableNames) {
      const columns = await sequelize.query(`SHOW COLUMNS FROM \`${name}\``, { type: QueryTypes.SELECT });
      const rows = await sequelize.query(`SELECT * FROM \`${name}\` LIMIT 200`, { type: QueryTypes.SELECT });
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM \`${name}\``, { type: QueryTypes.SELECT });
      tables[name] = {
        columns: columns.map(c => ({ field: c.Field, type: c.Type, key: c.Key, nullable: c.Null, default: c.Default })),
        rows,
        total: countResult.total,
      };
    }

    res.json({ tables });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import AuditLog from '../models/AuditLog.js';

/**
 * Log an action to the audit trail.
 * Called from route handlers after performing sensitive operations.
 * Stores old/new values for rollback capability.
 */
export const logAudit = async ({ userId, action, entity, entityId, oldValue, newValue, ipAddress }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId: entityId || null,
      oldValue: oldValue || null,
      newValue: newValue || null,
      ipAddress: ipAddress || null,
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error('Audit log failed:', error.message);
  }
};

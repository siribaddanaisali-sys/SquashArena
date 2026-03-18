import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  action: {
    // Type of action performed
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
    allowNull: false,
  },
  entity: {
    // Name of the entity affected (Tournament, Match, Ranking, User, etc.)
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  oldValue: {
    // Snapshot of entity BEFORE the change (for rollback capability)
    type: DataTypes.JSON,
    allowNull: true,
  },
  newValue: {
    // Snapshot of entity AFTER the change
    type: DataTypes.JSON,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  freezeTableName: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['entity', 'entityId'] },
    { fields: ['createdAt'] },
  ],
});

export default AuditLog;

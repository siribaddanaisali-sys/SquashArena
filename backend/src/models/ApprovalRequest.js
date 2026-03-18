import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const ApprovalRequest = sequelize.define('ApprovalRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    // The user who requested the sensitive action
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  actionType: {
    // What action is being requested (delete_tournament, update_match_result, modify_ranking)
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityType: {
    // The model name (Tournament, Match, Ranking)
    type: DataTypes.STRING,
    allowNull: false,
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  payload: {
    // The proposed changes to be applied on approval
    type: DataTypes.JSON,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  reviewedBy: {
    // SuperAdmin who reviewed this request
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  reviewNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'approval_requests',
  timestamps: true,
  freezeTableName: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['entityType', 'entityId'] },
  ],
});

export default ApprovalRequest;

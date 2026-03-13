import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Notification = sequelize.define('Notification', {
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
  type: {
    type: DataTypes.ENUM(
      'match_scheduled', 'match_result', 'tournament_update',
      'registration_confirmed', 'club_invite', 'ranking_change',
      'general'
    ),
    defaultValue: 'general',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    get() {
      const val = this.getDataValue('metadata');
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return {}; }
      }
      return val || {};
    },
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  freezeTableName: true,
});

export default Notification;

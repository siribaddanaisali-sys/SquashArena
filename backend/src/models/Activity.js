import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(
      'match_completed', 'tournament_created', 'tournament_started',
      'tournament_completed', 'player_registered', 'ranking_updated',
      'club_created', 'club_joined'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  userId: {
    type: DataTypes.UUID,
    defaultValue: null,
    references: { model: 'users', key: 'id' },
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
  tableName: 'activities',
  timestamps: true,
  freezeTableName: true,
});

export default Activity;

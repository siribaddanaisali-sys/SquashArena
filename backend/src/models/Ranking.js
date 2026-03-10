import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Ranking = sequelize.define('Ranking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  points: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  category: {
    type: DataTypes.ENUM('world', 'regional', 'national'),
    defaultValue: 'world',
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'rankings',
  timestamps: false,
  freezeTableName: true,
});

export default Ranking;

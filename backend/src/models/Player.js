import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Player = sequelize.define('Player', {
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
  ranking: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  points: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  hand: {
    type: DataTypes.ENUM('right', 'left'),
    defaultValue: 'right',
  },
  nationality: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'retired'),
    defaultValue: 'active',
  },
}, {
  tableName: 'players',
  timestamps: true,
  freezeTableName: true,
});

export default Player;

import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Tournament = sequelize.define('Tournament', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('professional', 'amateur', 'junior', 'masters'),
    defaultValue: 'amateur',
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'upcoming',
  },
  location: {
    type: DataTypes.STRING,
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 32,
  },
  registeredParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  organizerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'tournaments',
  timestamps: true,
});

export default Tournament;

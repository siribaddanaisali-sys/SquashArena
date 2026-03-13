import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const TrainingPlan = sequelize.define('TrainingPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  coachId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'coaches', key: 'id' },
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'players', key: 'id' },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.ENUM('technical', 'fitness', 'mental', 'tactical', 'general'),
    defaultValue: 'general',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
  },
  exercises: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('exercises');
      try { return JSON.parse(raw); } catch { return []; }
    },
    set(val) {
      this.setDataValue('exercises', JSON.stringify(val));
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active',
  },
}, {
  tableName: 'training_plans',
  timestamps: true,
  freezeTableName: true,
});

export default TrainingPlan;

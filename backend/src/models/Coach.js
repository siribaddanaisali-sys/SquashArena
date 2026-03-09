import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Coach = sequelize.define('Coach', {
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
  certification: {
    type: DataTypes.STRING,
  },
  experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  specialization: {
    type: DataTypes.STRING,
  },
  bio: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  tableName: 'coaches',
  timestamps: true,
});

export default Coach;

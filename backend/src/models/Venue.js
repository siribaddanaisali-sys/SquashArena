import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
  },
  numCourts: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  contactPhone: {
    type: DataTypes.STRING,
  },
  contactEmail: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  tableName: 'venues',
  timestamps: true,
});

export default Venue;

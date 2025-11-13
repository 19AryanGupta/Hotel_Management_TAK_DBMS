const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hotshortcutel',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    logging: false
  }
);

// Define models
const Room = sequelize.define('Room', {
  roomNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  roomType: { type: DataTypes.ENUM('Single','Double','Suite','Deluxe'), allowNull: false },
  pricePerNight: { type: DataTypes.FLOAT, allowNull: false },
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { timestamps: true });

const Customer = sequelize.define('Customer', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(10), allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

const Admin = sequelize.define('Admin', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

const Booking = sequelize.define('Booking', {
  checkInDate: { type: DataTypes.DATE, allowNull: false },
  checkOutDate: { type: DataTypes.DATE, allowNull: false },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM('Booked','Cancelled'), defaultValue: 'Booked' }
}, { timestamps: true });

const Invoice = sequelize.define('Invoice', {
  invoiceDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  amountPaid: { type: DataTypes.FLOAT, allowNull: false }
}, { timestamps: true });

// Associations
Customer.hasMany(Booking, { foreignKey: 'customerId', as: 'bookings' });
Booking.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Room.hasMany(Booking, { foreignKey: 'roomId', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

Booking.hasOne(Invoice, { foreignKey: 'bookingId', as: 'invoice' });
Invoice.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

module.exports = {
  sequelize,
  Sequelize,
  Room,
  Customer,
  Admin,
  Booking,
  Invoice
};

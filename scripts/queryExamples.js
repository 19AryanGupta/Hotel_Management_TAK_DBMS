/**
 * Quick examples: run SELECT queries against your MySQL DB.
 * Usage:
 *   1) Ensure .env has DB credentials and you've run `npm install sequelize mysql2`.
 *   2) Start/ensure DB is reachable.
 *   3) Run: node scripts/queryExamples.js
 */

const { sequelize } = require('../models'); // sequelize instance
const { QueryTypes } = require('sequelize');
const Room = require('../models/Room');

async function run() {
  try {
    // 1) ORM-style: get all rooms (equivalent to SELECT * FROM Rooms)
    const rooms = await Room.findAll();
    console.log('ORM rooms (Room.findAll):', rooms.map(r => r.get()));

    // 2) Raw SQL via Sequelize: SELECT * FROM Rooms
    const [rows1] = await sequelize.query('SELECT * FROM Rooms', { type: QueryTypes.SELECT });
    console.log('Raw SQL rows (SELECT * FROM Rooms):', rows1); // rows1 is an array (QueryTypes.SELECT returns array)

    // 3) Parameterized raw SQL to avoid injection
    const roomType = 'Suite';
    const rows2 = await sequelize.query(
      'SELECT * FROM Rooms WHERE roomType = ?',
      { replacements: [roomType], type: QueryTypes.SELECT }
    );
    console.log(`Rooms with roomType='${roomType}':`, rows2);

    // 4) Raw SQL with named replacements
    const rows3 = await sequelize.query(
      'SELECT * FROM Rooms WHERE pricePerNight <= :maxPrice',
      { replacements: { maxPrice: 5000 }, type: QueryTypes.SELECT }
    );
    console.log('Rooms with price <= 5000:', rows3);

  } catch (err) {
    console.error('Query examples error:', err);
  } finally {
    await sequelize.close();
  }
}

run();

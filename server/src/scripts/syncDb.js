require('dotenv').config();
const { sequelize } = require('../models');

async function sync() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error synchronizing database:', err);
    process.exit(1);
  }
}

sync();

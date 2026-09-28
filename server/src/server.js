require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    await sequelize.authenticate();
    // In production, prefer migrations. `alter: true` is convenient for
    // this exercise so the schema self-creates on first run.
    await sequelize.sync({ alter: true });
    console.log('Database connected and synced.');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

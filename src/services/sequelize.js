const Sequelize = require('sequelize');
const logger = require('service-claire/helpers/logger');

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  logger.error('Could not connect to database. A DATABASE_URL is required');
  process.exit();
}

const sequelize = new Sequelize(
  DATABASE_URL,
  {
    dialect: 'postgres',
    logging: false,
    retry: {
      max: 10,
      match: [
        Sequelize.ConnectionError,
      ],
    },
  }
);

module.exports = sequelize;

const { Sequelize } = require("sequelize");
require("dotenv").config();
const logger = require("../utils/logger");
const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: "postgres",
    logging:
        process.env.NODE_ENV === "development"
            ? (msg) => logger.info(`[Sequelize] ${msg}`)
            : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: {
        ssl: false,
    },
});

const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connection established successfully");

        await sequelize.sync({ alter: true });
        logger.info("Database synchronized successfully");
    } catch (error) {
        logger.error("Unable to connect to database", error);
        process.exit(1);
    }
};

module.exports = { sequelize, initializeDatabase };

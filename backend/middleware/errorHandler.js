const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);

    if (process.env.NODE_ENV === "development") {
        console.error(err);
    }

    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;

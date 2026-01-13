const logger = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const logError = (error, request) => {
        const errorInfo = {
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url,
            userAgent: request.get("User-Agent"),
            ip: request.ip || request.connection.remoteAddress,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        };

        if (
            process.env.NODE_ENV === "production" &&
            error.status &&
            error.status < 500
        ) {
            delete errorInfo.error.stack;
        }
        logger.error("Error occurred:", errorInfo);
    };

    logError(err, req);

    let statusCode = 500;
    let errorResponse = {
        error: "Internal server error",
        timestamp: new Date().toISOString(),
        path: req.path,
    };

    if (err.name === "ValidationError") {
        statusCode = 400;
        errorResponse = {
            error: "Validation failed",
            details: Object.keys(err.errors).map((key) => ({
                field: key,
                message: err.errors[key].message,
            })),
            timestamp: new Date().toISOString(),
            path: req.path,
        };
    } else if (
        err.name === "UnauthorizedError" ||
        err.name === "JsonWebTokenError"
    ) {
        statusCode = 401;
        errorResponse = {
            error: "Unauthorized",
            message: "Authentication required",
            timestamp: new Date().toISOString(),
            path: req.path,
        };

        if (err.redirect) {
            errorResponse.redirect = err.redirect;
        }
    } else if (err.code === "rate_limit_exceeded" || err.status === 429) {
        statusCode = 429;
        errorResponse = {
            error: "Too many requests",
            message: "Rate limit exceeded. Please try again later.",
            retryAfter: err.retryAfter || 60,
            timestamp: new Date().toISOString(),
            path: req.path,
        };

        res.set("Retry-After", err.retryAfter || 60);
    } else if (err.code === "insufficient_quota" || err.status === 503) {
        statusCode = 503;
        errorResponse = {
            error: "Service unavailable",
            message: "Service temporarily unavailable. Please try again later.",
            timestamp: new Date().toISOString(),
            path: req.path,
        };

        res.set("Retry-After", "300");
    } else if (err.status || err.statusCode) {
        statusCode = err.status || err.statusCode;
        errorResponse = {
            error: err.message || "An error occurred",
            timestamp: new Date().toISOString(),
            path: req.path,
        };

        if (err.redirect) errorResponse.redirect = err.redirect;
        if (err.details) errorResponse.details = err.details;
    }

    if (process.env.NODE_ENV === "development") {
        errorResponse.stack = err.stack;
    }

    res.status(statusCode);

    if (
        req.accepts("html") &&
        !req.xhr &&
        statusCode >= 400 &&
        statusCode < 500
    ) {
        if (statusCode === 401 && err.redirect) {
            return res.redirect(err.redirect);
        }
    }

    res.json(errorResponse);
};

module.exports = errorHandler;

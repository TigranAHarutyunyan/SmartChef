const jwt = require("jsonwebtoken");
const { User } = require("../models");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            logger.warn("No token provided in Authorization header");

            return res.status(401).json({
                error: "Access denied. No token provided.",
                redirect: "/welcome",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: ["id", "email", "firstName", "lastName"],
        });

        if (!user) {
            logger.warn(
                `Token is valid but user not found (ID: ${decoded.id})`
            );

            return res
                .status(401)
                .json({ error: "Invalid token.", redirect: "/welcome" });
        }

        req.user = user.toJSON();
        logger.info(`Authenticated user: ${user.email}`);

        next();
    } catch (error) {
        logger.error("Auth middleware error", error);
        res.status(401).json({ error: "Invalid token.", redirect: "/welcome" });
    }
};

module.exports = authMiddleware;

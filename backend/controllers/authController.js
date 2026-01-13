const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const logger = require("../utils/logger");
const HOST = process.env.HOST;

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

const register = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Registration validation failed", {
            errors: errors.array(),
        });

        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        logger.warn(`Registration attempt with existing email: ${email}`);

        return res
            .status(400)
            .json({ error: "User with this email already exists" });
    }

    const savedUser = await User.create({
        email,
        password,
        firstName,
        lastName,
    });
    logger.info(`User registered successfully with ID: ${savedUser.id}`);

    const token = generateToken(savedUser.id);

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: savedUser.id,
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
        },
        token,
        redirect: "/",
    });
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Login validation failed", { errors: errors.array() });

        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        logger.warn(`Login failed: user not found (${email})`);

        return res.status(400).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
        logger.warn(`Login failed: wrong password for ${email}`);

        return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    logger.info(
        `User logged in successfully (ID: ${user.id}, email: ${email})`
    );

    res.json({
        message: "Login successful",
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        token,
        redirect: "/",
    });
};

const getProfile = async (req, res, next) => {
    logger.info(`Profile fetched for user ID: ${req.user.id}`);

    res.json({
        user: req.user,
    });
};

const updateProfile = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn("Validation failed on updateProfile", {
            errors: errors.array(),
        });
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, currentPassword, newPassword } =
        req.body;
    const userId = req.user.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            logger.warn(`User not found with ID: ${userId}`);
            return res.status(404).json({ error: "User not found" });
        }

        if (email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                logger.warn(`Email conflict on update for user ID: ${userId}`);

                return res.status(400).json({
                    error: "Email is already taken by another user",
                });
            }
        }

        const updateData = {
            firstName,
            lastName,
            email,
        };

        if (newPassword) {
            if (!currentPassword) {
                logger.warn(`Current password missing for user ID: ${userId}`);

                return res.status(400).json({
                    error: "Current password is required to set new password",
                });
            }

            const isCurrentPasswordValid = await user.comparePassword(
                currentPassword
            );
            if (!isCurrentPasswordValid) {
                logger.warn(`Invalid current password for user ID: ${userId}`);

                return res.status(400).json({
                    error: "Current password is incorrect",
                });
            }

            updateData.password = newPassword;
        }

        await user.update(updateData);
        logger.info(`User profile updated for ID: ${userId}`);
        const updatedUser = await User.findByPk(userId);

        res.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
            },
        });
    } catch (error) {
        logger.error(`Failed to update user ID: ${userId}`, error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUsers = async (req, res, next) => {
    const users = await User.findAll();
    res.json({ users });
};

const verify = async (req, res, next) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
        },
    });
};

const handleGoogleCallback = (req, res, next) => {
    if (!req.user || !req.user.token) {
        logger.warn("Google callback failed: no user or token");
        const error = new Error(
            "No user or token found after Google authentication"
        );
        error.redirect = `${HOST}/welcome?error=no_user`;
        return next(error);
    }
    logger.info(`Google authentication successful for user: ${req.user.email}`);
    const token = req.user.token;
    res.redirect(`${HOST}/?token=${token}`);
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    getUsers,
    generateToken,
    verify,
    handleGoogleCallback,
};

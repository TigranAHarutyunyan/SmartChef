const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const UserService = require("../services/UserService");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                "https://smartchef-77vm.onrender.com/api/auth/google/callback",
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let user = await UserService.findByGoogleId(profile.id);
                logger.debug(
                    `Google login attempt for: ${profile.emails[0].value}`
                );

                if (!user) {
                    logger.info(`No user found with Google ID: ${profile.id}`);
                    user = await UserService.findByEmail(
                        profile.emails[0].value
                    );

                    if (!user) {
                        logger.info(
                            `Creating new user for email: ${profile.emails[0].value}`
                        );

                        user = await UserService.create({
                            email: profile.emails[0].value,
                            password: null,
                            firstName: profile.name.givenName || "Unknown",
                            lastName: profile.name.familyName || "Unknown",
                            googleId: profile.id,
                        });
                    } else {
                        logger.info(
                            `Linking Google ID to existing user: ${user.id}`
                        );

                        await UserService.updateGoogleId(user.id, profile.id);
                        user.googleId = profile.id;
                    }
                }

                const token = generateToken(user.id);
                logger.info(`Google OAuth successful for user ID: ${user.id}`);

                done(null, {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    token: token,
                });
            } catch (error) {
                logger.error("Google OAuth error", error);
                done(error, null);
            }
        }
    )
);

module.exports = passport;

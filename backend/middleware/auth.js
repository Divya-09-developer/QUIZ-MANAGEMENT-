const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const jwtSecret = process.env.JWT_SECRET || config.jwtSecret;

        if (!jwtSecret) {
            return res.status(500).json({ error: 'JWT secret not configured.' });
        }

        // Verify the token and attach the decoded data (user info) to req.user
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token Verification Error:', error);
        return res.status(400).json({ error: 'Invalid token.' });
    }
};

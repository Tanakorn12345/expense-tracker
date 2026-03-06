import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        let token = req.cookies.token;

        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Missing token.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        req.user = decoded; // Contains { id: userId }
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

export default auth;

import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
    // Extract the authorization header
    const authHeader = req.headers['authorization'];

    // Check if the authorization header exists and starts with "Bearer"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Extract the token from the authorization header
    const token = authHeader.split(' ')[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }

        // Log the decoded token for debugging purposes
        console.log('Decoded JWT:', decoded);

        // Attach the decoded token to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    });
};

export default authenticateToken;

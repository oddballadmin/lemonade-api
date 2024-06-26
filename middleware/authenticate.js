import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/user.js'

const protect = asyncHandler(async (req, res, next) => {
    let token;

    token = req.cookies;
    token = token.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded._id);
            next();
        }
        catch (error) {
            console.error('JWT Verification Error:', error);
            console.log(token);
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }
    }
    else {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });

    }


})
export default protect;
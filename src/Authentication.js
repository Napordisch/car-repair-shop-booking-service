import jwt from "jsonwebtoken";
import pkg from "cookie-parser"
const {cookieParser} = pkg;

export function setAuthToken(res, userId) {
    console.log(process.env.JWT_SECRET);
    const token = jwt.sign({userId}, process.env.JWT_SECRET);

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'strict',
        path: '/',
    });
}

// puts userID into req
export function verifyAuthToken(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({message: 'Authentication required'});
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({message: 'Invalid token'});
        }
        req.userId = decoded.userId;
        next();
    });
}
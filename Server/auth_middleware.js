import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

function authmiddleware(req , res , next){
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success : false,
            message : "Please login"
        });
    }
    
    try {
        const verify = jwt.verify(token , JWT_SECRET);
        req.user = verify
        next();
    } catch (error) {
        console.log("Error verifying the token");
        return res.status(400).json({
            success : false,
            message : "Invalid or expired token"
        });
    }
}

export default authmiddleware
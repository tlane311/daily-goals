import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


export default async function verifyToken(req,res,next){
    const token = req.headers['x-access-token'];
    if (!token)
        return res.status(400).send({ auth: false, message: "No token provided." });
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err)
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.'});
        
        //if no err
        req.userId = decoded.id;
        next();
    })
}
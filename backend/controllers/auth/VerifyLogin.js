import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'
import { poolPromise } from '../../db.js';
dotenv.config();


export default async function verifyLogin(req,res,next){
    
    //check to make sure we aren't missing data in the body
    if (!req.body.password || !req.body.username){
        return res.status(400).send({
            message: 'Missing login data.'
        })
    }
    
    try{
        
        const pool = await poolPromise;
        
        const sqlStatement = `SELECT * FROM users WHERE username = ? `;

        const queryCallback = (err, results, fields) => {
            if (err) return res.status(500).send({
                message:'Server error',
                error: err
            });
            if (!results.length) return res.status(400).send({
                message:'Bad credentials.',
            });
            
            //note our passwords are stored as binary in the db; we have to convert back to utf8
            const dbPassword = results[0].password.toString('utf8');

            //compare submitted password to hashed password in db
            const passwordIsValid = bcrypt.compareSync(req.body.password, dbPassword)
            
            //if hashed submission doesn't match, then:
            if (!passwordIsValid) {
                req.validCredentials = false;
                return res.status(400).send({
                    message:'Bad credentials.',
                });    
            }

            //otherwise, attach data to req object
            req.userId = results[0].user_id;
            req.validCredentials = true;

            next(); //by calling next inside of the query callback, we guarantee that next is called AFTER the sqlStatement has been executed
        }

        await pool.query(sqlStatement,[req.body.username],queryCallback);
    } catch(e) {
        return res.status(500).send({
            message:'Server Error.',
            error: e
        });
        
    }
}
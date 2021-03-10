import express from "express";

import {poolPromise} from '../../db.js'; //this is a promise that resolves to a connection

import verifyToken from './VerifyToken.js'; // middleware for authenticating tokens
import verifyLogin from './VerifyLogin.js'; // middleware for authenticating logins

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

//we need the enviroment variables to sign json web tokens
import dotenv from 'dotenv';


const router = express.Router();
dotenv.config();


//Routes in this file in order top to btm: POST /register, GET /me, POST /login, PUT /update, DELETE /delete

// For each of our routes, we first verify (explicitly or in middleware) that the req.body req.headers actually have data and that is in the correct shape.
// If there is a problem with data, the db is never queried.





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// @route   POST api/register
// @desc    create new user
// @access  public
/*
    req.body = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }
*/
router.post('/register', async (req,res,next) => {    
    //make sure none of the fields are empty
    if (!req.body.email || !req.body.username || !req.body.password) {
        return res.status(400).send("Missing User Input Data");
    }
    
    //create hashed password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    
    //predefining out sql statement
    const sqlStatement = `INSERT INTO users(username,password,email) VALUES (?, ?, ?) `
    
    //sqlValues will be escaped and passed into sqlStatement as ?. for more info check out, https://www.npmjs.com/package/mysql#escaping-query-values    
    const sqlValues = {
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email
    }

    const queryCallback = (err, results, fields) => {
        //if there is an error with the query
        if (err) return res.status(500).send('There was a problem registering the user.');


        //creating token
        //the token has the user_id
        const token = jwt.sign( {id: results.insertId}, process.env.SECRET,{
            expiresIn: 86400 //expires in 24 hrs
        });

        //if no err, then respond with this:
        res.status(200).send({
            message: 'User account was successfully created.',
            auth:true,
            token:token
        });

    }

    try{
        const pool = await poolPromise; //if this resolves, it returns a mysql connection
        await pool.query(sqlStatement, [sqlValues.username, sqlValues.password, sqlValues.email], queryCallback); 
        //escaping values is handled by the array 
    } catch(e) {
        res.status(500).send({
            message: "Server error",
            error: e
        })
    }

})











// @route   GET api/me
// @desc    get username and email from a token
// @access  public
/*
    req.body = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }

    verifyToken: (token) => {if (token===valid) req.userId = user_id}

    verifyToken -> look up data
*/
router.get('/me', verifyToken, async (req, res, next) => {
    try{
        const pool = await poolPromise; //if this resolves, it returns a mysql connection
        
        const sqlStatement = `SELECT username, email FROM users WHERE user_id = ?`;
        
        const queryCallback = (err, results, fields) => {
            if (err) return res.status(500).send('There was an error finding user info.')
            return res.status(200).send({
                message: "Authentication successful",
                results: results[0]
            });
        }

        await pool.query(sqlStatement, [req.userId], queryCallback);
    } catch(e){
        res.status(500).send({
            message: "Server error",
            error: e
        })
    }
});







// @route   POST api/login
// @desc    verify login given credentials
// @access  public
/*
    req.body = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }

    verifyLogin(username,password) => {
        req.validCredentials = boolean
        req.userId = user_id
    }
*/
router.post('/login', verifyLogin, async (req, res, next) =>{
    try{
        //check if middleware verified login
        //if invalid credentials
        if (!req.validCredentials) return res.status(400).send({
            message: 'Bad credentials',
            auth: false
        });

        //otherwise, create token and sign with user_id
        const token = jwt.sign( {id: req.userId}, process.env.SECRET,{
            expiresIn: 86400 //expires in 24 hrs
        });
        
        //and then send this:
        return res.status(200).send({
            message: 'Login was successful.',
            auth:true,
            token:token
        });

    }catch(e){
        res.status(500).send({
            message: "Server error",
            error: e
        })
    }

});


// @route   PUT api/update
// @desc    update user info
// @access  public
/*
    req.body = {
        username: req.body.username,
        password: req.body.password,
        field: req.body.field,
        fieldData: req.body.fieldData
    }

    verifyToken: (token) => { if (token===valid)  req.userId = user_id}

    verifyToken -> verify old login credentials -> attempt to update row


    YOU NEED TO UPDATE TO USE verifyLogin MIDDLEWARE
*/

// Update needs to be revisited
router.put('/update', verifyLogin, verifyToken, async (req, res, next) =>{
    //verifyLogin makes sure that username password and given and valid
    //verifyToken returns the user_id as req.userId

    //checking that we aren't missing field data
    if (!req.body.field || !req.body.fieldData) return res.status(400).send({
        message: "Missing updated field data"
    })


    //if user wants to update the password, we will need to hash it
    const fieldIsPassword = req.body.field === 'password'
    const fieldData = fieldIsPassword               //if updating the password,
        ? bcrypt.hashSync(req.body.fieldData, 10)   //return hashed password
        : req.body.fieldData                        //otherwise, return original data
    
    const sqlStatement = `UPDATE users SET ?? = ? WHERE user_id = ?;`; // ? for value and ?? for column name

    const queryCallback = (err, results, fields) => {
        if (err) return res.status(500).send({
            message: 'Server error. There was a problem updating info.',
            error: err
        });
        
        //if the number of changedRows is positive we send the following
        if (results.changedRows) return res.status(200).send({
            message: 'User data was updated successfully.',
            auth:true,
        });
        //if no rows were changed, we send the following
        return res.status(200).send({message: 'User data was not updated', auth: true});
    }
    
    
    try{
        const pool = await poolPromise; //if this resolves, it returns a mysql connection
        
        await pool.query(sqlStatement,[req.body.field, fieldData, req.userId],queryCallback
        ); //the array escapes those values before they are placed in our sql statement
    
    }catch(e){
        res.status(500).send({
            message: "Server error",
            error: e
        })
    }
    
});






// @route   DELETE api/delete
// @desc    delete user from database
// @access  public
/*
    req.body = {
        username: req.body.username,
        password: req.body.password,
    }

    verifyToken: (token) => { if (token===valid)  req.userId = user_id}

    verify login credentials -> verifyToken -> attempt to delete 
*/
router.delete('/delete', verifyLogin, verifyToken, async (req, res) =>{
    //verifyLogin ensures we are given login credentials
    //verifyToken makes sure we're given a valid token and then returns req.userId=(user_id)

    //by checking both id and username here we make sure that login credentials are tied to the token
    const sqlStatement = `DELETE FROM users WHERE user_id = ? AND username = ?;`

    const queryCallback = (err, results, fields) => {
        if (err) return res.status(500).send({
            message:'Server error. There was a problem updating info.',
            error: err                
        });
        //if the number of changedRows is positive we send the following
        if (results.affectedRows) return res.status(200).send({
            message: 'User data was deleted.',
            auth:true,
        });
        //if no rows were changed, we send the following
        return res.status(200).send({message: 'User was not deleted', auth: true});
    }
    
    try{
        const pool = await poolPromise; //if this resolves, it returns a mysql connection       
        await pool.query(sqlStatement, [req.userId,req.body.username], queryCallback);
        //the array escapes those values before they are placed in our sql statement
    
    }catch(e){
        res.status(500).send({
            message: "Server error",
            error: e
        })
    }
    
});




export default router;
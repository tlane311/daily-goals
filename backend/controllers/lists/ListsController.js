import express from "express";

import {poolPromise} from '../../db.js'; //this is a promise that resolves to a connection

import verifyToken from '../auth/VerifyToken.js';   // middleware for authenticating tokens

// note we are not using verifyLogin here because we don't want to double check auth for goal CRUD



const router = express.Router();
// Routes in this file in order top to btm: POST /new, GET /me, PUT /update, DELETE /delete

// For each of our routes, we first verify (explicitly or in middleware) that the req.body req.headers actually have data and that is in the correct shape.
// If there is a problem with data, the db is never queried.





// @route   POST api/goals/delete
// @desc    create new list
// @access  public
// verifyToken -> req.userId = user_id
/*
    req.header['x-access-token'] = token
    req.body = {listName, orderNumber}

*/


router.post('/new', verifyToken, async (req, res) => {
    
    const sqlStatement="INSERT INTO lists(user_id, list_name, order_number) VALUES (?, ?, ?)";
    const queryCallback = (err, results,fields) => {
        if (err) {
            return res.status(500).send({
                message: "Server error",
                error: err
            });
        }
        return res.status(200).send({
            message: 'List added',
            results: results
        });
    }
    
    try {
        const pool = await poolPromise;
        await pool.query(sqlStatement,[req.userId, req.body.listName, req.body.orderNumber],queryCallback)
    } catch(e) {
        return res.status(500).send({message:"Sever error", error: e});
    }
})


/* 

What info do we test for API?

*/













/////////////////////////////////////////
router.get('/me', async (req, res) => {
    res.send('environment variables work')
});


export default router;
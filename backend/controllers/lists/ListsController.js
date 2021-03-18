import express from "express";

import {poolPromise} from '../../db.js'; //this is a promise that resolves to a connection

import verifyToken from '../auth/VerifyToken.js';   // middleware for authenticating tokens

// note we are not using verifyLogin here because we don't want to double check auth for goal CRUD



const router = express.Router();
// Routes in this file in order top to btm: POST /new, GET /me, PUT /, DELETE /

// For each of our routes, we first verify (explicitly or in middleware) that the req.body req.headers actually have data and that is in the correct shape.
// If there is a problem with data, the db is never queried.





// @route   POST api/lists/new
// @desc    create new list
// @access  public
// verifyToken -> req.userId = user_id
/*
    req.header['x-access-token'] = token
    req.body = {listName, orderNumber}

*/


router.post('/new', verifyToken, async (req, res) => {
    if (!req.body.listName || !req.body.orderNumber) return res.status(400).send({
        auth: true,
        message: "No listName or orderNumber provided."
    })

    
    const sqlStatement="INSERT INTO lists(user_id, list_name, order_number) VALUES (?, ?, ?) ;";
    const queryCallback = (err, results, fields) => {
        if (err) {
            return res.status(500).send({
                message: "Server error.",
                error: err
            });
        }
        return res.status(200).send({
            auth: true,
            message: 'List added.',
            results: results
        });
    }
    
    try {
        const pool = await poolPromise;
        await pool.query(sqlStatement,[req.userId, req.body.listName, req.body.orderNumber],queryCallback)
    } catch(e) {
        return res.status(500).send({message:"Sever error.", error: e});
    }
});

// @route   DELETE api/lists/
// @desc    delete a list
// @access  public
/*

    The middleware, verifyToken, will look at the token provided in the header. If valid, it will set req.userId = user_id (ie the id number in the db).    

    req.header = {'x-access-token'}
    req.body = { listId }

*/


router.delete('/', verifyToken, async (req, res) => {
    if (!req.body.listId) return res.status(400).send({
        auth: true,
        message: "No list provided."
    })

    
    const sqlStatement="DELETE FROM lists WHERE list_id = ? AND user_id = ? ;";
    const queryCallback = (err, results, fields) => {
        if (err) {
            return res.status(500).send({
                message: "Server error.",
                error: err
            });
        }

        //if there was a deletion, affectedRows > 0
        if (results.affectedRows) return res.status(200).send({
            auth:true,
            message: 'List was deleted.',
        });

        //otherwise, no rows were affected. very special case.
        return res.status(200).send({
            auth: true,
            message: 'List was not deleted.',
            results: results,
        });
    }
    
    try {
        const pool = await poolPromise;
        await pool.query(sqlStatement,[req.body.listId, req.userId], queryCallback)
    } catch(e) {
        return res.status(500).send({message:"Sever error.", error: e});
    }
})

















export default router;
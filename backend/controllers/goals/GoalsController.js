import express from "express";

import {poolPromise} from '../../db.js'; //this is a promise that resolves to a connection


import verifyToken from '../auth/VerifyToken.js';   // middleware for authenticating tokens

// note we are not using verifyLogin here because we don't want to double check auth for goal CRUD



const router = express.Router();
// Routes in this file in order top to btm: POST /new, GET /me, PUT /, DELETE /

// For each of our routes, we first verify (explicitly or in middleware) that the req.body req.headers actually have data and that is in the correct shape.
// If there is a problem with data, the db is never queried.






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// @route   POST api/goals/new
// @desc    add new goals to db
// @access  public
/*

    The middleware, verifyToken, will look at the token provided in the header. If valid, it will set req.userId = user_id (ie the id number in the db).    


    req.header['x-access-token'] = token
    req.body = {
        goals: req.body.goal,
    }

    each goal: {
        list_id,
        goal,
        order_number,
    }
*/

router.post('/new', verifyToken, async (req, res, next) => {
    //missing data handling
    if (!req.body.goals) return res.status(400).send({
        auth: true,
        message: 'Bad request'
    })

    //grabbing payload from req.body    
    const goals = req.body.goals; //this should be a non-empty array
    //Each member of goals should have shape {listId, goal, orderNumber}

    //Making sure the user sends an (1)array and (2)array with positive length
    if (!goals.length || !Array.isArray(goals)) return res.status(400).send({
        auth: true,
        message: 'No goals were submitted.'
    });

    // We need to make sure each goal has the correct shape
    // To do this, we need to iterate through each member of goals and check the shape.
    // The simplest way to do this is with the .reduce() method

    // this is a boolean which is true when (see name) and false when (see !name)
    const goalsHaveCorrectShape = goals.reduce( (accumulator, currentValue) => {
        
        // bool determines if each member has truthy values for the desired keys
        const bool = currentValue.listId && currentValue.goal && currentValue.orderNumber;

        // note, the listId should be positive, the goal shouldn't be an empty string, the orderNumber should be positive 
        // if bad data is passed in (i.e. say a string for the listId), the db will throw an error
        // hence, we don't need to typecheck here since the db does it for us

        return accumulator && bool; 
    }, true);

    if (!goalsHaveCorrectShape) return res.status(400).send({
        auth:true,
        message: "Issue with submitted goal.",
    });

    const queryCallback = (err, results,fields) => {
        if (err) {
            return res.status(500).send({
                auth:true,
                message: "Server error.",
                error: err
            });
        }
        return res.status(200).send({
            auth: true,
            message: 'Goals added.',
            results: results
        });
    }
    
    try {
        const pool = await poolPromise;

        //we are dynamically generating a string to add on to our sqlStatement specifying which elements to delete
        const goalsArr = await goals.map( obj => {
            let newString = `(${pool.escape(req.userId)}` //escaping is important to prevent sql injections
                +`, ${pool.escape(obj.listId)}`
                +`, ${pool.escape(obj.goal)}`
                +`, ${pool.escape(obj.orderNumber)}`
                +`)`;
            return newString;
        });
        const goalsAddon = goalsArr.join(` , `)

        const sqlStatement=`INSERT INTO goals (user_id, list_id, goal, order_number) 
        VALUES`+goalsAddon+`;`;


        await pool.query(sqlStatement,queryCallback);
    } catch(e) {
        return res.status(500).send("Server error")
    }
});


// @route   GET api/goals/me
// @desc    get all goals I have created
// @access  public
/*
    The middleware, verifyToken, will look at the token provided in the header. If valid, it will set req.userId = user_id (ie the id number in the db).    

    req.header['x-access-token'] = token
    req.body={ listId }
*/
router.get('/me', verifyToken, async (req, res) => {
    //making sure the body has the correct shape
    if (!req.body.listId) return res.status(400).send({ auth: true, message: 'Bad request' });

    const sqlStatement=`SELECT * FROM goals WHERE user_id = ? AND list_id = ? ;`;
    const queryCallback = (err, results,fields) => {
        if (err) return res.status(400).send({ auth: true, message:'Bad request', error: err });
        return res.send({
            auth: true,
            message: "These are all goals from that list.",
            results: results
        });
    }
    
    try {
        const pool = await poolPromise;
        await pool.query(sqlStatement,[req.userId, req.body.listId],queryCallback) //escaping values is handled by the array 
    } catch(e) {
        return res.status(500).send({message:'Server error', error: e})
    }
});



// @route   PUT api/goals/
// @desc    update goals
// @access  public
/*

    The middleware, verifyToken, will look at the token provided in the header. If valid, it will set req.userId = user_id (ie the id number in the db).    

    req.header['x-access-token'] = token
    req.body = {
        goalId: int,
        goal,
        orderNumber: ,  
        deadline: , 
        status: , 
        note: , 
        color: 
    }

*/

router.put('/', verifyToken, async (req, res) => {
    
    //here all of the values we will grab from the request body
    const sqlValues = [ req.body.goal, req.body.orderNumber, req.body.deadline, req.body.status, 
        req.body.note, req.body.color, req.body.goalId, req.userId]
    
    
    // To verify that all values are defined, we are going to first check if they are undefined, and if at least one of them are, we will send a 400 response
    // this is an array of booleans which should be true unless some sqlValue in sqlValues was undefined
    const valuesAreDefined = sqlValues.map(element => typeof element !== 'undefined')
    // we reduce the array so that it only returns true if every element of valuesAreDefined are true
    const bodyHasCorrectShape = valuesAreDefined.reduce( (accumulator, currentValue) => accumulator && currentValue, true)

    // bodyHasCorrectShape is truthy only when every value in sqlValues is defined (i.e not undefined).
    if (!bodyHasCorrectShape) {
        return res.status(400).send({
            auth: true,
            message: "Bad request."
        });
    }
        
    const sqlStatement=`UPDATE goals 
        SET 
            goal = ?,
            order_number = ?,
            deadline = ?,
            status = ?,
            note = ?,
            color = ?
        WHERE
            goal_id = ?
            AND
            user_id = ?`;
    


    const queryCallback = (err, results,fields) => {
        if (err) return res.status(500).send({message:'Server error', error: err});

        //if not rows were found
        if (!results.affectedRows) return res.status(400).send({
            auth: true,
            message: "Bad request.",
            results: results
        });

        // no rows were changed
        if (!results.changedRows) return res.status(400).send({
            auth: true,
            message: "Bad request.",
            results: results
        });

        //case: rows were found and rows were updated
        return res.status(200).send({
            auth: true,
            message: "Data was successfully updated.",
            results: results
        });
    }

    try {
        const pool = await poolPromise;
        await pool.query(sqlStatement,[...sqlValues],queryCallback) //escaping values is handled by the array 
    } catch(e) {
        return res.status(500).send({message:'Server error', error: e})
    }
});


// @route   DELETE api/goals/
// @desc    delete goals
// @access  public
/*
    The middleware, verifyToken, will look at the token provided in the header. If valid, it will set req.userId = user_id (ie the id number in the db).    

    req.header['x-access-token'] = token
    req.body = {
        goal_ids: [
            (id1),(id2),(id3), ... , (idn)
        ]
    }

*/

router.delete('/', verifyToken, async (req,res) => {

    const goals = req.body.goal_ids;

    if (!goals) return res.status(400).send({message: 'Bad request', auth: true})
    
    //making sure the user sends an (1)array and (2)array with positive length
    if (!goals.length || !Array.isArray(goals)) return res.status(400).send({
        auth: true,
        message: 'Bad request'
    })
    
    const queryCallback = (err, results,fields) => {
        if (err) return res.status(500).send({message:'Server error', error: err});
        //if the submitted rows weren't found
        if (!results.affectedRows) return res.status(400).send({
            auth:true,
            message: 'Bad request.'
        });
        //if the rows are found, then they are deleted
        return res.status(200).send({
            auth: true,
            message: `${results.affectedRows} goals were deleted.`,
            results: results
        });
    }
    
    try {
        const pool = await poolPromise;
        
        //we are dynamically generating a string to add on to our sqlStatement specifying which elements to delete
        const goalsArr = goals.map( element => `goal_id = '${pool.escape(element)}'`) //escaping is important to prevent sql injections
        const sqlAddon = goalsArr.join(` OR `)
        const sqlStatement=`DELETE FROM goals WHERE ` + sqlAddon + `;`;
        
        await pool.query(sqlStatement,queryCallback)
    } catch(e) {
        return res.status(500).send({message:'Server error', error: e})
    }
})















/*
router.post('/new2', (req, res) => {
    
    const sqlStatement="";
    const queryCallback = (err, results,fields) => {

    }
    
    try {
        const pool = await poolPromise;
        await pool.query(sqlStatement,[],queryCallback)
    } catch(e) {

    }
})
*/



export default router;
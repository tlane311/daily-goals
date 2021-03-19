import express from "express";

import {poolPromise} from '../../db.js'; //this is a promise that resolves to a connection


import verifyToken from '../auth/VerifyToken.js';   // middleware for authenticating tokens

// note we are not using verifyLogin here because we don't want to double check auth for goal CRUD



const router = express.Router();
// Routes in this file in order top to btm: POST /new, GET /me, PUT /update, DELETE /delete

// For each of our routes, we first verify (explicitly or in middleware) that the req.body req.headers actually have data and that is in the correct shape.
// If there is a problem with data, the db is never queried.






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// @route   POST api/goals/new
// @desc    add new goals to db
// @access  public
/*

    req.header contains token
    req.body = {
        goals: req.body.goal,
    }

    each goal: {
        list_id,
        goal,
        order_number,
    }

verifyToken -> "INSERT INTO goals(...) VALUES (...), (...), ... , (...);" -> return status
*/

router.post('/new', verifyToken, async (req, res, next) => {
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
                message: "Server error",
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
// verifyToken -> req.userId = user_id
/*
    req.header['x-access-token'] = token
*/
router.get('/me', verifyToken, async (req, res) => {
    const sqlStatement=`SELECT * FROM goals WHERE user_id = ? ;`;
    const queryCallback = (err, results,fields) => {
        if (err) return res.status(500).send({message:'Server error', error: err})
        return res.send({
            results: results
        });
    }
    
    try {
        const pool = await poolPromise;
        await pool.query(sqlStatement,[req.userId],queryCallback) //escaping values is handled by the array 
    } catch(e) {
        return res.status(500).send({message:'Server error', error: e})
    }
});



// @route   PUT api/goals/update
// @desc    update goals
// @access  public
// verifyToken -> req.userId = user_id
/*
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

router.put('/update', verifyToken, async (req, res) => {
    
    //here all of the values we will grab from the request body
    const sqlValues = [ req.body.goal, req.body.orderNumber, req.body.deadline, req.body.status, 
        req.body.note, req.body.color, req.body.goalId, req.userId]
    // we're going to make sure each value is defined
    if (!sqlValues.reduce( (accumulator, currentValue) => accumulator || currentValue, false)) {
        return res.status(400).send({
            message: "Missing data to update goals."
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
            message: "Problem with selected goal id or user credentials.",
            results: results
        });

        // no rows were changed
        if (!results.changedRows) return res.status(400).send({
            message: "Server received request, but data was not updated.",
            results: results
        });

        //case: rows were found and rows were updated
        return res.status(200).send({
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


// @route   DELETE api/goals/delete
// @desc    delete goals
// @access  public
// verifyToken -> req.userId = user_id
/*
    req.header['x-access-token'] = token
    req.body = {
        goal_ids: [
            (id1),(id2),(id3), ... , (idn)
        ]
    }

*/


router.delete('/', verifyToken, async (req,res) => {
    const goals = req.body.goal_ids;
    //making sure the user sends an (1)array and (2)array with positive length
    if (!goals.length || !Array.isArray(goals)) return res.status(400).send({
        message: 'No goals were submitted for deletion.'
    })
    
    const queryCallback = (err, results,fields) => {
        if (err) return res.status(500).send({message:'Server error', error: err});
        //if the submitted rows weren't found
        if (!results.affectedRows) return res.status(400).send({
            message: 'No goals were found with the info given.'
        });
        //if the rows are found, then they are deleted
        return res.status(200).send({
            message: `${results.changedRows} goals were deleted.`
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

import app from '../../backend/server.js';

import request from 'supertest';

import { CreateUser, LoginUser, DeleteUser } from './apiHelpers.js';
import { CreateList, DeleteList, GetLists } from './apiHelpers.js';
import { CreateGoals, DeleteGoals, GetGoals } from './apiHelpers.js';


//routes
//POST /goals/new
//GET /goals/me
//PUT /goals/
//DELETE /goals/


describe( 'POST /api/goals/new', () => {
    
    // S E T U P

    //dummy user
    const userData = {
        username: 'New_Goals',
        password: 'some_password',
        email: 'new@goals.com'
    }
    //dummy list
    const listData = {
        listName: 'new-goals-list',
        orderNumber: 1,
    }
    //dummy goal
    const goalData = {
        goal: 'creating a new goal',
        orderNumber: 1,
    }

    //create variables to hold listId, token and goalId
    let listId, token, goalId;

    // create user & grab token
    // create list & grab id
    beforeAll( async () => {
        //create user
        const newUser = await CreateUser(userData); //expect response.body = { auth, message, token }
        token = newUser.body.token; //grab token
        console.log(token)

        const newList = await CreateList({token, data: listData}); //expect response.body = { auth, message, results = {..., insertId, ...} }
        listId = newList.body.results.insertId; //grab listId

        return newUser;
    });
    
    // T E A R D O W N

    //delete a goal if one is leftover
    afterEach(async () => {

        //during each test, if a goal is created, we will update the variable goalId.
        //If goalId is truthy, we will delete that goal and set goalId back to undefined.
        //Otherwise do nothing.

        if (goalId) {
            const deleteGoal = await DeleteGoals({ token, data: { 'goal_ids': [goalId] } })
            goalId = undefined;
            return deleteGoal;
        }
        return ;
    });

    //delete list, user after all tests have run
    afterAll( async () => {
        //delete list
        await DeleteList({token, data: {listId: listId}});

        //delete user
        return await DeleteUser(userData);

        // Note: order matters.
        // We must delete list before we can delete the user.
        // Otherwise, the db will throw an exception.
    });

    // T E S T S
    
    it('fails when no goals are submitted', async()=>{
        //attempt to create a new goal
        const response = await request(app)
            .post('/api/goals/new')
            .set('x-access-token', token);

        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Bad request");
        // status code
        expect(response.statusCode).toBe(400);
    }); //done

    it('fails when an array is not submitted', async()=>{
        //attempt to create a new goal
        const response = await request(app)
            .post('/api/goals/new')
            .set('x-access-token', token)
            .send({ 'goals': 'value' });

        // expecting: response.body = { auth: true, message: ...}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("No goals were submitted.");
        // status code
        expect(response.statusCode).toBe(400);
    }); //done

    it('fails when an empty array is submitted', async()=>{
        //attempt to create a new goal
        const response = await request(app)
            .post('/api/goals/new')
            .set('x-access-token', token)
            .send({ 'goals': [] });

        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("No goals were submitted.");
        // status code
        expect(response.statusCode).toBe(400);
    }); //done

    it('fails when goals have wrong shape', async()=>{
        // attempt to create a new goal
        const response = await request(app)
            .post('/api/goals/new')
            .set('x-access-token', token)
            .send({ 'goals': [ {listId} ] }); 
        // there are potentially other ways that this data could have wrong shape

        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Issue with submitted goal.");
        // status code
        expect(response.statusCode).toBe(400);
    });//done


    it('fails when goal data has bad types', async()=>{
        //attempt to create a new goal
        const response = await request(app)
            .post('/api/goals/new')
            .set('x-access-token', token)
            .send({ 'goals': [ {orderNumber: 1, goal: [],  listId} ] });

        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Server error.");
        // status code
        expect(response.statusCode).toBe(500);
    });//done

    it('creates new goals', async()=>{
        console.log({...goalData, listId});
        //attempt to create a new goal
        const response = await request(app)
            .post('/api/goals/new')
            .set('x-access-token', token)
            .send({ 'goals': [ {...goalData, listId} ] });

        // expecting: response.body = { auth: true, message: ..., results: {..., insertId, ...}}

        goalId = response.body.results.insertId;

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results');
        expect(response.body.results).toHaveProperty('insertId');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Goals added.");
        // status code
        expect(response.statusCode).toBe(200);
    });//done
}) //done

    /*
describe( 'GET /api/goals/me', () => {
    
    // S E T U P

    //dummy user
    const userData = {
        username: 'Get_Goals',
        password: 'some_password',
        email: 'get@goals.com'
    }
    //dummy list
    const listData = {
        orderNumber: 1,
        listName: 'get-goals-list'
    }

    //create variables to hold listId, token
    let listId, token;

    const goalsData = [
        {
            listId,
            orderNumber: 1,
            goal: 'first-get-goal'
        },
        {
            listId,
            orderNumber: 2,
            goal: 'second-get-goal'
        },
        {
            listId,
            orderNumber: 3,
            goal: 'third-get-goal'
        },
    ]

    let goalsIds = [];

    // create user, list and new goals before all
    beforeAll( async () => {
        //create user
        const newUser = await CreateUser(userData); //expect response.body = { auth, message, token }
        token = newUser.body.token; //grab token

        const newList = await CreateList({token, data: listData}); //expect response.body = { auth, message, results = {..., insertId, ...} }
        listId = newList.body.results.insertId; //grab listId

        const newGoals = await CreateGoals({ token, data: { goals: goalsData } });
        //expect response.body = { auth, message, results: [ {..., insertId, ... }, {..., insertId, ... }, ... ] }

        goalsIds.push(newGoals.body.results[0].insertId); //grabbing the insertIds
        goalsIds.push(newGoals.body.results[1].insertId);
        goalsIds.push(newGoals.body.results[2].insertId);

        return newUser;
    });
    
    // T E A R D O W N
    
    //delete list, user after all tests have run
    afterAll( async () => {
        //delete goals
        await DeleteGoals({ token, data: { goal_ids: goalsIds}});

        //delete list
        await DeleteList({token, data: {listId: listId}});

        //delete user
        return await DeleteUser(userData);

        // Note: order matters.
        // We must delete goals before list before the user.
        // Otherwise, the db will throw an exception.
    })

    // T E S T S

    it('gets users goals', async () => {
        //create a user
        const response = await request(app)
            .get('/api/goals')
            .send(registerData);
        
        // expecting: response.body = { auth: true, message: ..., token: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results');

        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("User account was successfully created.");
        
        //checking the results
        const results = response.body.results;
        expect(Array.isArray(results)).toBe(true); //make sure results are an array
        for (let i = 0; i < 3; i++){
            expect(results[i]).toHaveProperty('list_id');
            expect(results[i]).toHaveProperty('goal');
            expect(results[i]).toHaveProperty('order_number');
            expect(results[i]['list_id']).toBe(goalData[i].listId);
            expect(results[i]['goal']).toBe(goalData[i].goal);
            expect(results[i]['order_number']).toBe(goalData[i].orderNumber);
        }
        // status code
        expect(response.statusCode).toBe(200);
    });
});
*/

describe( 'PUT /api/goals', () =>{

})

describe( 'DELETE /api/goals', () =>{

})


/* test suite format
describe( 'reqeust', () => {
    
    // S E T U P
    
    // T E A R D O W N
    
    // T E S T S

        //test successful registration
    it('registers new users', async()=>{
        //create a user
        const response = await request(app)
            .post('/api/register')
            .send(registerData);
        
        // expecting: response.body = { auth: true, message: ..., token: ... }


        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('token');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("User account was successfully created.");
        // status code
        expect(response.statusCode).toBe(200);
    });
});
*/

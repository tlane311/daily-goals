
import app from '../../backend/server.js';

import request from 'supertest';

import { CreateUser, LoginUser, DeleteUser } from './apiHelpers.js';
import { CreateList, DeleteList, GetLists } from './apiHelpers.js';
import { CreateGoal, DeleteGoal, GetGoals } from './apiHelpers.js';


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

    //listId, token and goalId
    let listId, token, goalId;

    // create user & grab token
    // create list & grab id
    beforeAll( async () => {
        //create user
        const newUser = await CreateUser(userData); //expect response.body = { auth, message, token }
        token = newUser.body.token; //grab token

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
            const deleteGoal = await DeleteGoal({ token, data: { 'goals_ids': [goalId] } })
            goalId = undefined;
            return deleteGoal;
        }
        return ;
    });

    //delete list, user
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
        expect(response.body.message).toBe("Bad request.");
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
        expect(response.body.message).toBe("User account was successfully created.");
        // status code
        expect(response.statusCode).toBe(200);
    });//done
}) //done



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

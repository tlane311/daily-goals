
import app from '../../backend/server.js';

import request from 'supertest';

import { CreateUser, DeleteUser } from './apiHelpers.js';
import { CreateList, DeleteList } from './apiHelpers.js';
import { CreateGoals, DeleteGoals } from './apiHelpers.js';


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

    let goalsData

    let goalsIds = [];

    // create user, list and new goals before all
    beforeAll( async () => {
        //create user
        const newUser = await CreateUser(userData); //expect response.body = { auth, message, token }
        token = newUser.body.token; //grab token

        const newList = await CreateList({token, data: listData}); //expect response.body = { auth, message, results = {..., insertId, ...} }
        listId = newList.body.results.insertId; //grab listId

        goalsData = [
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
        const newGoals = await CreateGoals({ token, data: { goals: goalsData } });
        //expect response.body = { auth, message, results: [ {..., insertId, ... }, {..., insertId, ... }, ... ] }

        goalsIds.push(newGoals.body.results.insertId); //grabbing the insertIds
        goalsIds.push(newGoals.body.results.insertId+10);
        goalsIds.push(newGoals.body.results.insertId+20);

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

    //no listId provided


    //bad listId provided

    it('fails when listId is not provided', async () => {
        //attempting to get a user/list goals
        const response = await request(app)
            .get('/api/goals/me')
            .set('x-access-token',token)
            .send({listId: undefined});

        // expecting response.body = {auth : true, message: 'Bad request'}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe('Bad request');
        // status
        expect(response.status).toBe(400);
    });

    it('returns nothing when given a bad listId', async () => {
        //attempting to get a user/list goals

        const response = await request(app)
            .get('/api/goals/me')
            .set('x-access-token',token)
            .send({listId: listId-10});

        // expecting response.body = {auth : true, message: 'Bad request'}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe('These are all goals from that list.');
        expect(response.body.results.length).toBe(0);
        // status
        expect(response.status).toBe(200);
    });

    it('gets users goals', async () => {
        //attempting to get a user/list goals
        const response = await request(app)
            .get('/api/goals/me')
            .set('x-access-token', token)
            .send({ listId });
        
        // expecting: response.body = { auth: true, message: ..., token: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results');

        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("These are all goals from that list.");
        
        //checking the results
        const results = response.body.results;
        expect(Array.isArray(results)).toBe(true); //make sure results are an array
        for (let i = 0; i < 3; i++){
            expect(results[i]).toHaveProperty('list_id');
            expect(results[i]).toHaveProperty('goal');
            expect(results[i]).toHaveProperty('order_number');
            expect(results[i]['list_id']).toBe(goalsData[i].listId);
            expect(results[i]['goal']).toBe(goalsData[i].goal);
            expect(results[i]['order_number']).toBe(goalsData[i].orderNumber);
        }
        // status code
        expect(response.statusCode).toBe(200);
    });
}); //done

describe( 'PUT /api/goals', () =>{
    // S E T U P
    
    //dummy user
    const userData = {
        username: 'Update_Goal',
        password: "some_password",
        email: 'update@goal.com'
    }
    //dummy list
    const listData = {
        listName: 'update-goals-list',
        orderNumber: 1
    }

    const updatedGoal = {
        goal: 'updated-goal',
        orderNumber: 2,
        deadline: '2021-3-19 19:00:00',
        status: false,
        note: "Don't forget to do this.",
        color: '#333'
    }

    // dummy goals
    // We will need the listId to define this. We will assign goalsData during beforeEach
    let goalData;
    
    // We will need to access the goal ids later during tests. We will assign these in beforeAll
    let goalId;

    // We will need to access the listId and token during tests. We will define these in beforeAll
    let listId, token;

    // create user and list before all tests
    beforeAll( async () => {
        //create user
        const newUser = await CreateUser(userData); //expect response.body = { auth, message, token }
        token = newUser.body.token; //grab token

        const newList = await CreateList({token, data: listData}); //expect response.body = { auth, message, results = {..., insertId, ...} }
        listId = newList.body.results.insertId; //grab listId

        return newUser;
    });

    // create goals before each test
    beforeEach( async () => {
        //assigning the goalsData
        //note, we don't want this to be reassigned each time, so we condition
        if (!goalData){
            goalData = [
                {
                    listId,
                    orderNumber: 1,
                    goal: 'update-goal'
                },
            ]
        }

        const newGoals = await CreateGoals({ token, data: { goals: goalData } });
        //expect response.body = { auth, message, results: [ {..., insertId, ... }, {..., insertId, ... }, ... ] }
        goalId = newGoals.body.results.insertId;   //grabbing the insertIds
    });

    // T E A R D O W N

    // delete goals after each test
    afterEach( async () => {
        //delete goals
        await DeleteGoals({ token, data: { goal_ids: [goalId]}});
        goalId = undefined; //reset goalId
        return goalId;
    });

    // delete list and then user after all tests
    afterAll( async () => {
        //delete list
        await DeleteList({token, data: {listId: listId}});

        //delete user
        return await DeleteUser(userData);

        // Note: order matters.
        // We must delete the list before the user.
        // Otherwise, the db will throw an exception.
    });

    // T E S T S

    it('fails when body has wrong shape', async () => {
        const response = await request(app)
            .put('/api/goals/')
            .set('x-access-token', token)
            .send({...updatedGoal, goalId: undefined});
    
        // expecting: response.body = { auth: true, message: ...}
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Bad request.");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it('fails when given bad goal id', async () => {
        const response = await request(app)
            .put('/api/goals/')
            .set('x-access-token', token)
            .send({...updatedGoal, goalId: 2*goalId});

        // expecting: response.body = { auth: true, message: ...}
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Bad request.");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it('updates goal', async () => {
        const response = await request(app)
            .put('/api/goals/')
            .set('x-access-token', token)
            .send({...updatedGoal, goalId});
        
        // expecting: response.body = { auth: true, message: ...}
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Data was successfully updated.");
        // status code
        expect(response.statusCode).toBe(200);
    });
}); //done

describe( 'DELETE /api/goals', () =>{
    // S E T U P

    // dummy user
    const userData = {
        username: 'Delete_Goals',
        password: 'some_password',
        email: 'delete@goals.com'
    }
    // dummy list
    const listData = {
        listName: 'delete-goals-list',
        orderNumber: 1
    }
    
    // dummy goals
    // We will need the listId to define this. We will assign goalsData during beforeEach
    let goalsData;
    
    // We will need to access the goal ids later during tests. We will assign these in beforeAll
    let goalIds = [];

    // We will need to access the listId and token during tests. We will define these in beforeAll
    let listId, token;

    // create user and list before all tests
    beforeAll( async () => {
        //create user
        const newUser = await CreateUser(userData); //expect response.body = { auth, message, token }
        token = newUser.body.token; //grab token

        const newList = await CreateList({token, data: listData}); //expect response.body = { auth, message, results = {..., insertId, ...} }
        listId = newList.body.results.insertId; //grab listId

        return newUser;
    });

    // create goals before each test
    beforeEach( async () => {
        //assigning the goalsData
        //note, we don't want this to be reassigned each time, so we condition
        if (!goalsData){
            goalsData = [
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
        }

        const newGoals = await CreateGoals({ token, data: { goals: goalsData } });
        //expect response.body = { auth, message, results: [ {..., insertId, ... }, {..., insertId, ... }, ... ] }
        goalIds.push(newGoals.body.results.insertId);   //grabbing the insertIds
        goalIds.push(newGoals.body.results.insertId+10); //note: our db increments ids by 10
        goalIds.push(newGoals.body.results.insertId+20);
    });


    // T E A R D O W N

    // delete goals after each test (if they haven't already been deleted)
    afterEach( async () => {
        //delete goals
        await DeleteGoals({ token, data: { goal_ids: goalIds}});
    });


    // delete list and then user after all tests
    afterAll( async () => {
        //delete list
        await DeleteList({token, data: {listId: listId}});

        //delete user
        return await DeleteUser(userData);

        // Note: order matters.
        // We must delete the list before the user.
        // Otherwise, the db will throw an exception.
    });
    
    // T E S T S

    it( "fails when body doesn't have correct shape", async () => {
        //attempting to deleteGoals
        const response = await DeleteGoals( {
            token,
            data: {'goal_ids': undefined}
        });

        // expecting: response.body = { auth: true, message: ... }
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Bad request");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it( 'fails when goal_ids has empty array', async () => {
        //attempting to deleteGoals
        const response = await DeleteGoals( {
            token,
            data: {'goal_ids': []}
        });

        // expecting: response.body = { auth: true, message: ...}
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Bad request");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it( 'fails when goal_ids is not an array', async () => {
        //attempting to deleteGoals
        const response = await DeleteGoals( {
            token,
            data: {'goal_ids': 'value'}
        });

        // expecting: response.body = { auth: true, message: ... }
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Bad request");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it( 'fails when goals_ids are bad', async () => {
        //attempting to deleteGoals
        const response = await DeleteGoals( {
            token,
            data: {'goal_ids': goalIds.map( id => 2*id)}
        });

        // expecting: response.body = { auth: true, message: ... }
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Bad request.");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it('deletes goals', async () => {  
        //attempting to deleteGoals      
        const response = await DeleteGoals( {
            token,
            data: {'goal_ids': goalIds}
        });
        
        // expecting: response.body = { auth: true, message: ...}
        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("3 goals were deleted.");
        // status code
        expect(response.statusCode).toBe(200);

    });
}); //done


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


import app from '../../backend/server.js';

import request from 'supertest';

import {CreateUser, LoginUser, GetUser, DeleteUser} from './apiHelpers.js';
import {CreateList, DeleteList} from './apiHelpers.js';

//routes
//POST /lists/new
//GET /lists/me
//PUT /lists
//DELETE /lists


describe("POST /api/lists/new", () => {

    // S E T U P
    //dummy user
    const userData = {
        username: "List_User",
        password: "some_password",
        email: "list@user.com"
    }
    //dummy data
    const listData = {
        listName: "new-list",
        orderNumber: "1"
    }

    //create user before any tests run
    beforeAll(async () => {
        return await CreateUser(userData);
    });

    // T E A R D O W N

    //delete our user after all tests are done
    afterAll(async () => {
        return await DeleteUser(userData);
    });

    // T E S T S

    //we do not test the middleware verifyToken
    //verifyToken is tested in unit test for users api 'GET /api/me'

    it('fails when missing listName', async () => {
        //we need a token, so we log in
        const login = await LoginUser(userData);
        const token = login.body.token;

        //create a user
        const response = await request(app)
            .post('/api/lists/new')
            .set('x-access-token', token)
            .send({
                listName: undefined,
                orderNumber: listData.orderNumber
            });
        
        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("No listName or orderNumber provided.");
        // status code
        expect(response.statusCode).toBe(400);
    });
    
    it('fails when missing orderNumber', async () => {
        //we need a token, so we log in
        const login = await LoginUser(userData);
        const token = login.body.token;

        //create a user
        const response = await request(app)
            .post('/api/lists/new')
            .set('x-access-token', token)
            .send({
                listName: listData.listName,
                orderNumber: undefined
            });
        
        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("No listName or orderNumber provided.");
        // status code
        expect(response.statusCode).toBe(400);
    });

    //test successful registration
    it('creates new list', async () => {
        //we need a token, so we log in
        const login = await LoginUser(userData);
        const token = login.body.token;

        //create a user
        const response = await request(app)
            .post('/api/lists/new')
            .set('x-access-token', token)
            .send(listData);
        
        // expecting: response.body = { auth: true, message: ..., results: { insertId, ... } }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results')
        expect(response.body.results).toHaveProperty('insertId')
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("List added.");
        // status code
        expect(response.statusCode).toBe(200);

        //cleaning up
        //note, the api doesn't provide a good way to grab an individual listId
        //so, we do our clean up inside of this test instead of in afterEach, etc. 
        const deleteData = {
            listId: response.body.results.insertId
        }
        await DeleteList({token: token, data: deleteData});
    });
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
})
*/


import app from '../../backend/server.js';

import request from 'supertest';

import {CreateUser, LoginUser, DeleteUser} from './apiHelpers.js';
import {CreateList, DeleteList, GetLists} from './apiHelpers.js';

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

        //attempt to create a list
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

        //attempt to create a list
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

    it('creates new list', async () => {
        //we need a token, so we log in
        const login = await LoginUser(userData);
        const token = login.body.token;

        //attempt to create a list
        const response = await request(app)
            .post('/api/lists/new')
            .set('x-access-token', token)
            .send(listData);
        
        // expecting: response.body = { auth: true, message: ..., results: { insertId, ... } }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results');
        expect(response.body.results).toHaveProperty('insertId');
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
}); //done

describe( 'GET /api/lists/me', () => {
    
    // S E T U P

    //dummy list data
    const listData = [
        {
            orderNumber: 1,
            listName: 'first-list'
        },
        {
            orderNumber: 2,
            listName: 'second-list'
        },
        {
            orderNumber: 3,
            listName: 'third-list'
        }];

    //we are going to add the list ids when actually create our list
    let listIds = [];
    
    //dummy user data
    const userData = {
        username: 'Get_Lists',
        password: 'some_password',
        email: 'get@lists.com'
    };

    //we are going to grab an authentication token when we create out user
    let token;

    //create user and their list data
    beforeAll( async () => {
        const user = await CreateUser(userData);
        token = user.body.token; //here is our token

        // this is where we get the listIds
        listData.map( async data => {
            const list = await CreateList({token: token, data: data});
            listIds.push(list.body.results.insertId);
            return list;       
        });

        return user;
    });

    // T E A R D O W N

    //delete user and their list data
    afterAll( async() => {
        await DeleteList({token, data: { listId: listIds[0]}});
        await DeleteList({token, data: { listId: listIds[1]}});
        await DeleteList({token, data: { listId: listIds[2]}});
        return await DeleteUser(userData);
        // The order matters here.
        // If we try to delete the user before we delete all of the lists, the db will throw an error since lists have a reference to the user_id.
    });
    
    // T E S T S

    // This all that we need to test here.

    it('gets all the lists', async()=>{
        const response = await request(app)
            .get('/api/lists/me')
            .set('x-access-token', token)
        
        // expecting: response.body = { auth: true, message: ..., results: [ ... ]}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results');

        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("All lists associated with given credentials.");
        const results = response.body.results;
        expect(Array.isArray(results)).toBe(true); //make sure results are an array

        // status code
        expect(response.statusCode).toBe(200);   
    });
}); //done

describe( 'PUT /api/lists/', () => {
    
    // S E T U P

    //dummy user data
    const userData = {
        username: 'Update_Lists',
        password: 'some_password',
        email: 'update@lists.com'
    }
    //dummy list data
    const listData = {
        listName: 'update-list',
        orderNumber: 5
    }
    //update data for listName
    const updateListName = {
        field: 'list_name',
        fieldData: 'updated-list'
    }
    //update data for orderNumber
    const updateOrderNumber = {
        field: 'order_number',
        fieldData: 1
    }

    // We need to grab a listId when we create a list in beforeEach so we can delete it in afterEach.
    // Same with the token from the user.
    let listId, token;

    //create user before tests begin
    beforeAll( async () => {
        //create user
        const newUser = await CreateUser(userData);
        //define token
        token = newUser.body.token;

        return newUser;
    });
    //create list before each test
    beforeEach( async () => {
        //create list
        const newList = await CreateList({token, data: listData})
        //define listId
        listId = newList.body.results.insertId;

        return newList;
    });
    
    // T E A R D O W N
    
    //delete list after each test
    afterEach( async () => {
        //delete list using listId
        return await DeleteList( { token, data: { listId: listId } });
    });

    //delete user after all tests
    afterAll( async () => {
        //delete user
        return await DeleteUser(userData);
    })

    // T E S T S

    it('fails when missing field', async () => {
        //attempting to update
        const response = await request(app)
            .put('/api/lists/')
            .set('x-access-token', token)
            .send({field: undefined, fieldData: 2, listId: listId});

        //expecting: response.body = { auth, message }

        //shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        //accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe('Missing updated field data.');
        //status code
        expect(response.statusCode).toBe(400);
    });
    it('fails when missing fieldData', async () => {
        //attempting to update
        const response = await request(app)
            .put('/api/lists/')
            .set('x-access-token', token)
            .send({fieldData: undefined, field: 'list_name', listId: listId});

        //expecting: response.body = { auth, message }

        //shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        //accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe('Missing updated field data.');
        //status code
        expect(response.statusCode).toBe(400);
    });

    it('updates listsNames', async()=>{
        //attempting to update db
        const response = await request(app)
            .put('/api/lists/')
            .set('x-access-token', token)
            .send({...updateListName, listId: listId}) //need to send { field, fieldData, listId}
        
        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("List data was updated successfully.");
        // status code
        expect(response.statusCode).toBe(200);

        //we are going to verify that the updates are correct
        const verifyUpdates = await GetLists({ token }); //expecting res.body = {auth, message, results = [ {...}, ...]}
        const theList = verifyUpdates.body.results[0];
        expect(theList).toHaveProperty('list_name');
        expect(theList).toHaveProperty('order_number');
        expect(theList['list_name']).toBe(updateListName.fieldData);
        expect(theList['order_number']).toBe(listData.orderNumber);

    });

    it('updates orderNumber', async()=>{
        //attempting to update db
        const response = await request(app)
            .put('/api/lists/')
            .set('x-access-token', token)
            .send({...updateOrderNumber, listId: listId}); //need to send { field, fieldData, listId}
        
        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("List data was updated successfully.");
        // status code
        expect(response.statusCode).toBe(200);   

        //we are going to verify that the updates are correct
        const verifyUpdates = await GetLists({ token }); //expecting res.body = {auth, message, results = [ {...}, ...]}
        const theList = verifyUpdates.body.results[0];
        expect(theList).toHaveProperty('list_name');
        expect(theList).toHaveProperty('order_number');
        expect(theList['list_name']).toBe(listData.listName);
        expect(theList['order_number']).toBe(updateOrderNumber.fieldData);
    });
}); //done

describe( 'DELETE api/lists/', () => {
    
    // S E T U P

    //dummy user
    const userData = {
        username: "Delete_List",
        password: "some_password",
        email: "delete@list.com"
    }
    //dummy list
    const listData = {
        orderNumber: 1,
        listName: "delete this list"
    }

    //we need to pass data from beforeEach to each test and to afterEach
    //specifically, we need to pass the listId from when we create list
    //so that we can use that id to delete the aformentioned list.
    //the api doesn't provide a way to grab an individual list id

    //we initiliaze and then mutate each time beforeEach is called
    let listId;

    //we do the same with the login token
    let token;

    //create a user before all tests
    beforeAll( async () => {
        const createUser = await CreateUser(userData)

        //token is initialized outside of this callback
        //mutating token so that it can be passed to the tests
        token = createUser.body.token;

        return createUser;
    })

    //create a list before each test
    beforeEach( async () => {
        const createList = await CreateList({token: token, data: listData});
        
        //listId is initialized outside of this callback
        //mutating listId so that is can be passed to the tests and to afterEach
        listId = createList.body.results.insertId;

        return createList;
    })

    // T E A R D O W N

    //delete list if one is left over after each test
    afterEach( async () => {
        return await DeleteList({
            token: token, 
            data: { listId: listId }
        });
    })

    //delete the user after all tests
    afterAll( async () => {
        return await DeleteUser(userData);
    })

    // T E S T S

    //we do not test the middleware verifyToken
    //verifyToken is tested in unit test for users api 'GET /api/me'

    it('fails when missing listId', async()=>{
        //attempt to delete the list
        const response = await request(app)
            .delete('/api/lists/')
            .set('x-access-token',token)
            .send({
                listId: undefined //listId is missing in this test
            });
        
        // expecting: response.body = { auth: false, message: ...}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("No list provided.");
        // status code
        expect(response.statusCode).toBe(400);   
    });

    it('deletes lists', async()=>{
        // attempt to delete the list
        const response = await request(app)
            .delete('/api/lists/')
            .set('x-access-token',token)
            .send({
                listId: listId //listId is defined in the beforEach
            });
        
        // expecting: response.body = { auth: true, message: ...}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("List was deleted.");
        // status code
        expect(response.statusCode).toBe(200);   
    });
}); //done

/* test suite format
describe( 'reqeust', () => {
    
    // S E T U P
    
    // T E A R D O W N
    
    // T E S T S

    it('registers new users', async()=>{
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

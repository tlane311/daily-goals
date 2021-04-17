import app from '../../backend/server.js';
import request from 'supertest';

// a function used to create a new user in the database with given credentials (credentials is an object with shape {username,password,email})
import {CreateUser, LoginUser, GetUser, DeleteUser} from './apiHelpers.js';

// T E S T S

describe('REGISTER /api/register', () => {

    // S E T U P
    
    //creating some dummy data to feed to the db
      const registerData = {
        username: 'Register_User',
        password: "some_password",
        email: "email@register.com"
    }

    // T E A R D O W N

    //after every test, we will delete the user we registered in the test: 'registers new users'
    afterAll(async ()=>{
        return await DeleteUser(registerData);
    });


    // T E S T S

    //test successful registration
    it('registers new users', async()=>{
        //create a user
        const response = await request(app)
            .post('/api/register')
            .send(registerData);
        
        /* 
        expecting:
            response.body = {
                auth: true,
                message: ...,
                token: ...
            }
        */

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('token');
        
        //accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("User account was successfully created.");

        //status code
        expect(response.statusCode).toBe(200);        
    });
    //missing input data test
    it('fails to register when missing username', async() => {
        
        //create missing credentials object
        const missingUsername = {
            password: registerData.password,
            email: registerData.email
        }

        //missing username tests
        const response = await request(app)
            .post('/api/register')
            .send(missingUsername);

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        // accuracy        
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("Missing User Input Data.");

        // status code
        expect(response.statusCode).toBe(400);    
    });

    it('fails to register when missing password', async() => {
        
        //create missing credentials object
        const missingPassword = {
            username: registerData.username,
            email: registerData.email
        }


        //missing username tests
        const response = await request(app)
            .post('/api/register')
            .send(missingPassword);

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("Missing User Input Data.");

        // status code
        expect(response.statusCode).toBe(400);
    });

    it('fails to register when missing email', async() => {
        
        //create missing credentials object

        const missingEmail = {
            username: registerData.username,
            password: registerData.password,
        }


        //missing username tests
        const response = await request(app)
            .post('/api/register')
            .send(missingEmail);

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("Missing User Input Data.");

        // status code
        expect(response.statusCode).toBe(400);
    });
}); //done

describe('GET /api/me', () => {
    
    // S E T U P

    //creating some dummy data to feed to the db
    const myData = {
        username: 'myName',
        password: 'some_password',
        email: 'me@email.com'
    }

    //before the tests start, we add a new user to db
    beforeAll( async () => {
        return await CreateUser(myData); //create user
    })

    // T E A R D O W N

    //after all tests have completed, we delete that user
    afterAll( async () => {
        return await DeleteUser(myData); //delete user
    })

    // T E S T S
    it('fails when no token is provided', async () => {
        const response = await request(app)
            .get('/api/me');

        // expecting
        //    response = {
        //        auth: false,
        //        message: ...
        //    }
    

        //checking shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        //checking data accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe('No token provided.');

        //checking status code  
        expect(response.statusCode).toBe(400);
    });

    it('fails when given bad token', async () => {
        const response = await request(app)
            .get('/api/me')
            .set( 'x-access-token', '12345');

        // expecting
        //    response = {
        //       auth: false,
        //        message: ...
        //    }
        

        //checking shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        //checking data accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe('Failed to authenticate token.');
        
        //checking status code   
        expect(response.statusCode).toBe(400);
    });

    it('returns user info when given valid token', async ()=>{
        const loginRes = await request(app)
            .post('/api/login')
            .send(myData);
        // This should return: loginRes.body = {auth: true, token: ...}

        const token = loginRes.body.token
        
        const response = await request(app)
            .get('/api/me')
            .set('x-access-token',token);
        
        // expecting
        //    response = {
        //        auth: true,
        //        message: ... ,
        //        results: {
        //            username: ... ,
        //            email: ...
        //        }
        //    }

        //checking shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('results');
        expect(response.body.results).toHaveProperty('username');
        expect(response.body.results).toHaveProperty('email');

        //note, expectation.toBe() uses Object.is() which really only checks equality for primitives (i.e. not objects).
        //hence, we split respones.body.results into two cases.

        //checking data accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe('Authentication successful.'); 
        expect(response.body.results.username).toBe(myData.username);
        expect(response.body.results.email).toBe(myData.email);

        //checking status code
        expect(response.statusCode).toBe(200);
    });

}); //done

describe('POST /api/login', ()=>{
    // S E T U P

    //some dummy login credentials, we manually register this user with setup&teardown
    const loginData = {
        username: 'Login_User',
        password: "some_password",
        email: "email@login.com"
    }

    //before all tests, we will add a user to the db
    beforeAll( async () => {
        return await CreateUser(loginData);
    })

    // T E A R D O W N
    
    //after every test, we will delete the user we created for these tests
    afterAll( async () => {
        return await DeleteUser(loginData);
    });

    // T E S T S
    
    it('fails when missing username', async()=>{
        //attempt login with no info
        const response = await request(app)
            .post('/api/login')
            .send({password: loginData.password});
        
        // expecting: response.body = { auth: false, message: ...}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe('Missing login data.');
        // status code
        expect(response.statusCode).toBe(400);
    });

    it('fails when missing password', async()=>{
        //attempt login with no info
        const response = await request(app)
            .post('/api/login')
            .send({username: loginData.username});
        
        // expecting: response.body = { auth: false, message: ...}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe('Missing login data.');
        // status code
        expect(response.statusCode).toBe(400);
    });

    it('fails when given no credentials', async()=>{
        //attempt login with no info
        const response = await request(app)
            .post('/api/login');
        
        // expecting: response.body = { auth: false, message: ...}

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe('Missing login data.');
        // status code
        expect(response.statusCode).toBe(400);
    });

    
    it('fails when given bad username', async()=>{
        //create a user
        const response = await request(app)
            .post('/api/login')
            .send({username: loginData+"nope", password: loginData.password});
        
        // expecting: response.body = { auth: false, message: ..., token: ... }


        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("Bad credentials.");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it("fails when password doesn't match username", async()=>{
        //create a user
        const response = await request(app)
            .post('/api/login')
            .send({username: loginData.username, password: loginData.password+'nope'});
        
        // expecting: response.body = { auth: false, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("Bad credentials.");
        // status code
        expect(response.statusCode).toBe(400);
    });

    it('logs a user who provides valid credentials', async () => {
        //send the http req and get the response
        const response = await request(app)
            .post('/api/login')
            .send({
                username: "Login_User",
                password: "some_password"
            });

        
        //expected:
        //    response.body = {
        //        auth: true,
        //        message: ...
        //        token: ...
        //    }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('token');
        
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("Login was successful.");

        // status code
        expect(response.statusCode).toBe(200);
    });
}); //done

describe('PUT /api/update', () => {
    
    // S E T U P

    //dummy data for user credentials
    const userData = {
        username: "Update_User",
        password: "some_password",
        email: "update@email.com"
    }
    //dummy data for updating
    const updateUsername = {
        field: "username",
        fieldData: "Updated_User"
    }
    const updatePassword = {
        field: "password",
        fieldData: "updated_password"
    }
    const updateEmail = {
        field: "email",
        fieldData: "updated@email.com"
    }

    //before each test, create a new user

    beforeEach( async () => {
        return await CreateUser(userData);
    })
    
    // T E A R D O W N
    
    //after each test, delete the user

    afterEach( async () => {
        return await DeleteUser(userData);
        //note, sometimes we update data so this doesn't remove the user from the database.
        //we manually delete those users in the test itself
    });

    // T E S T S

    //no token provided
    it('fails because no token was provided', async()=>{
        
        //attempting to update
        const response = await request(app)
            .put('/api/update')
            .send(updateUsername);
        //note, this should give an error before it even parses the request body.

        // expecting: response.body = { auth: false, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("No token provided.");
        // status code
        expect(response.statusCode).toBe(400);
    }); 

    
    //no field provided
    it('fails because no field was provided', async()=>{
        const login = await LoginUser(userData)
        const token = login.body.token;
        //attempting to update
        const response = await request(app)
            .put('/api/update')
            .set('x-access-token', token)
            .send({field: undefined});
        

        // expecting: response.body = { auth: false, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("Missing updated field data.");
        // status code
        expect(response.statusCode).toBe(400);
    }); 

    
    //no fieldData provided
    it('fails because no fieldData was provided', async()=>{
        const login = await LoginUser(userData)
        const token = login.body.token;

        //attempting to update
        const response = await request(app)
            .put('/api/update')
            .set('x-access-token', token)
            .send({fieldData: undefined});
        

        // expecting: response.body = { auth: false, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("Missing updated field data.");
        // status code
        expect(response.statusCode).toBe(400);
    });

    //update username success
    it('successfully updates username', async()=>{
        //getting token
        const login = await LoginUser(userData);

        const token = login.body.token;

        //attempting to update
        const response = await request(app)
            .put('/api/update')
            .set('x-access-token', token)
            .send(updateUsername);
        

        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("User data was updated successfully.");
        // status code
        expect(response.statusCode).toBe(200);

        await DeleteUser({
            username: updateUsername.fieldData,
            password: userData.password,
            email: userData.email
        })
    });
    
    //update password success
    it('successfully updates password', async()=>{
        //getting token
        const login = await LoginUser(userData);

        const token = login.body.token;      

        
        //attempting to update
        const response = await request(app)
            .put('/api/update')
            .set('x-access-token', token)
            .send(updatePassword);
        

        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("User data was updated successfully.");
        // status code
        expect(response.statusCode).toBe(200);

        await DeleteUser({
            username: userData.username,
            password: updatePassword.fieldData,
            email: userData.email
        })
    });
    //update email success
    it('successfully updates email', async()=>{
        //getting token
        const login = await LoginUser(userData);

        const token = login.body.token;

        
        //attempting to update
        const response = await request(app)
            .put('/api/update')
            .set('x-access-token', token)
            .send(updateEmail);
        

        // expecting: response.body = { auth: true, message: ... }

        // shape
        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');
        // accuracy
        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe("User data was updated successfully.");
        // status code
        expect(response.statusCode).toBe(200);

        //making sure database info updated correctly
        //verifying we can still login
        const verify = await LoginUser(userData)
        
        expect(verify.body.token).toBeDefined();
        
        // verifying update info matches
        const getResponse = await GetUser({token: token})

        expect(getResponse.body.results.username).toBe(userData.username); 
        expect(getResponse.body.results.email).toBe(updateEmail.fieldData); 

        await DeleteUser({
            username: userData.username,
            password: userData.password,
            email: updateEmail.fieldData,
        })
    });
}); //done

describe('DELETE /api/delete', ()=>{
    const deleteData = {
        username: 'Delete_User',
        password: "some_password",
        email: "email@delete.com"
    }

    // S E T U P
    //before all tests, we will add a user to the db
    beforeAll(async () => {
        return await CreateUser(deleteData);
    });
    // T E A R D O W N

    afterAll( async () => {
        return;
    });
    
    
    // T E S T S

    //note, we are not going to test the middleware since that has been tested above
    //see 'POST /api/login' for verifyLogin middleware
    //see 'GET /api/me' for verifyToken middleware
    //note for future refactor, it might make more sense to have unit tests for middleware

    //this leaves the success case, server error case or possibly one special case
    //If two different threads from the connection pool attempt to delete the same user at the same time
    //in such a way that the middleware for the second request finishes just before the user is deleted
    //by the first request, then the response is {message: 'User was not deleted', auth: true}.
    //I personally don't know the inner workings of the mysql db or driver well enough to know if this is
    //actually possible. As well, it's not clear to me if one could write a test for this.

    //testing deleting a user
    it('deletes a user', async ()=>{
        //login so we can get an access token
        const loginRes  = await request(app)
            .post('/api/login')
            .send(deleteData)
        //the access token
        const token = loginRes.body.token;
        
        //we are testing this response
        const response = await request(app)
            .delete('/api/delete')
            .set('x-access-token', token)
            .send(deleteData);

        // expecting:
        //    response.body = {
        //        auth: true,
        //        message: ...
        //    }
        

        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        expect(response.body.auth).toBe(true);
        expect(response.body.message).toBe('User data was deleted.');
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
})
*/


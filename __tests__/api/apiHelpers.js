import app from '../../backend/server.js';

import request from 'supertest';

// a function used to create a new user in the database with given credentials (credentials is an object with shape {username,password,email})
export async function CreateUser(credentials) {
    try{
        return await request(app)
        .post('/api/register')
        .send(credentials);
    } catch(e){
        console.log('create user failed', e)
    }

}

export async function LoginUser({username, password}){
    //returns the response from our request
    //if success, shape is {auth, message, token}
    return await request(app)
    .post('/api/login')
    .send({
        username: username,
        password: password
    });
}

export async function GetUser( { token } ){
    //returns the response from our request
    //if success, shape is { auth, message, results: {username, email} }

    return await request(app)
        .get('/api/me')
        .set('x-access-token', token);
}

export async function DeleteUser(credentials) {
    try{
        const loginResponse = await request(app)
            .post('/api/login')
            .send(credentials);

        const token = loginResponse.body.token;
        //if login is (not) valid, a token is (not) sent back
        //if we receive token, we return the delete request
        if (token) return await request(app)
            .delete('/api/delete')
            .set('x-access-token', token)
            .send(credentials)
        //if we don't receive a token, we return the login request
        return loginResponse
    } catch(e){
        console.log('delete user failed', e)
    }
}

export async function CreateList( { token, data } ){
    return await request(app)
        .post('/api/lists/new')
        .set('x-access-token', token)
        .send(data);
}

export async function GetLists( {token} ){
    return await request(app)
        .get('/api/lists/me')
        .set('x-access-token', token);
}

export async function DeleteList( { token, data } ){
    return await request(app)
        .delete('/api/lists/')
        .set('x-access-token', token)
        .send(data);
}

export async function CreateGoals( {token, data}){
    return await request(app)
        .post('/api/goals/new')
        .set('x-access-token', token)
        .send(data);
}

export async function GetGoals( {token, listId} ) {
    return await request(app)
        .get(`/api/goals/me?listId=${listId}`)
        .set('x-access-token', token)
        .send({ listId });
}

export async function DeleteGoals({ token, data }){
    return await request(app)
        .delete('/api/goals/')
        .set('x-access-token', token)
        .send(data);
}
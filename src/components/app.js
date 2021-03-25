import React, {useState} from 'react';

import MainPage from './pages/MainPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import axios from 'axios';

const getUserRoute = '/api/me';
const getListsRoute = '/api/lists/me';
const getGoalsRoute = '/api/goals/me';


export default function App(){
    /*
        When one logs in, the token will be stored in this component
        Then, main page can use the token to get user data
    */
   // Note, use local storage for token
    const [token, setToken] = useState("");

    const updateToken = (token) => {
        setToken(token);
    }
    const [dataRetrieved, setDataRetrieved] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [lists, setLists] = useState([]); // An array of objects each of which represents a list. Shape: {listId, listName, orderNumber}
    const [selectedList, setSelectedList] = useState(0); // This should be the list id number
    const [goals, setGoals] = useState([]); // An array of object each of which represents a goal. Shape: {goalId, listId, goal, orderNumber, deadline, status, note, color}

    // Whenever the token updates, we want to do a get request to grab user data
    if(token && !dataRetrieved){
        grabUserData({
            token, 
            setUsername, 
            setEmail,
            setSelectedList, 
            setLists,
            setGoals
        });
        setDataRetrieved(true);
    }

    return(
        <>
            <Router>
                <div>{token ? 'token stored' : 'no token'}</div>
                <Switch>
                    <Route exact path="/">
                        <MainPage 
                            loginToken={token}
                            getRoute={'/api/me'}
                            lists={lists}
                            selectedList={selectedList}
                            goals={goals}/>
                    </Route>
                    <Route exact path="/login">
                        <LoginPage updateToken={updateToken}/>
                    </Route>
                    <Route exact path="/register">
                        <RegisterPage updateToken={updateToken}/>
                    </Route>
                </Switch>
            </Router>



        </>

    )
}


/*
    This function takes in a token and returns the user's data.
    The expected shape is:
        [
            userData = {username, email},
            listData = [{list_id, list_name, order_number}, {...}, ..., {...}],
            goalsData = [[goalData1, goalData2, ....], [...], ..., [...]]
        ]
    Note, listData.length === goalsData.length and the order is the same.
*/

async function grabUserData({token, setUsername, setEmail, setSelectedList, setLists, setGoals}){
    let userData;
    let listData;
    let goalsData=[];
    
    const getUserConfig = {
        method: 'get',
        url: getUserRoute,
        headers: {
            'x-access-token': token,
        }
    }
    const getListsConfig = {
        method: 'get',
        url: getListsRoute,
        headers: {
            'x-access-token': token
        }
    }
    
    await axios(getUserConfig)
        .then( res => {
            return userData = res.data.results;
        });
    setUsername(userData.username);   
    setEmail(userData.email);
    setSelectedList( userData['selected_list'] ); 
    await axios(getListsConfig)
        .then( res => {
            return listData = res.data.results;
        });
    setLists(listData);

    // We are going to iterate through listsData to get the users goals
    // Note, since we want to do some async stuff, we will use an actual for loop instead of Array.prototype.map
    
    for (let i =0; i < listData.length; i++){
        const config={
            method: 'get',
            url: getGoalsRoute,
            params: { listId: listData[i]['list_id']},
            headers: {
                'x-access-token': token,
            }
        }
    
        await axios(config)
            .then( res => {
                goalsData.push(res.data.results);
            });
    }

    setGoals(goalsData);
}
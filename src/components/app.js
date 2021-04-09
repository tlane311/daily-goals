import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import defaultData from './default-data.js';

import MainPage from './pages/MainPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';

import userManagement from '../services/userManagement.js';


import axios from 'axios';



const getUserRoute = '/api/me';
const getListsRoute = '/api/lists/me';
const getGoalsRoute = '/api/goals/me';






// This component will perform all the of the db queries and route to all of the pages to our site.

 
// When one logs in, the token will be stored in this component

// Note, use local storage for token


export default function App() {
    const [token, setToken] = useState("");

    // We will pass setter functions here to children components so that they can request for the db to be queried.
    const [initialFetchDone, setInitialFetchDone] = useState(false);
    const [retrievedLists,setRetrievedLists] = useState(false);
    const [retrievedGoals,setRetrievedGoals] = useState(false);


    // This is our state for storing db query results
    const [username, setUsername] = useState(defaultData.username);
    const [email, setEmail] = useState(defaultData.email);

    const [lists, setLists] = useState(defaultData.lists); // An array of objects each of which represents a list. Shape: {listId, listName, orderNumber}
    const [selectedList, setSelectedList] = useState(defaultData.selectedList); // This should be the list id number
    const [goals, setGoals] = useState(defaultData.goals); // An object with key-value pairs for each list. 
        // the shape: goals[list_id] = { fetchedOnce, data=[goal0, goal1, ...] }
        // each goal has shape: {goalId, listId, goal, orderNumber, deadline, status, note, color}

    // This handles the first fetch. We will do a first fetch whenever the token changes.
    useEffect( () => {
        if (token) {
            const retrieveData = async () => {

                let goalsData = {}
                const [userData, listData] = await efficientFetch({token});

                setUsername(userData.username);

                setEmail(userData.email);

                setLists(listData);
                const selectedListExists = listData.find( list => list['list_id'] === userData['selected_list']);

                // If the selectedList doesn't exist, we will need to manually update selectedList.
                if (!selectedListExists){
                    // If listData = [], ...
                    if (!listData.length){
                        userManagement.update(token, 'selected_list', 0);
                    } else {
                        // Otherwise ...
                        userManagement.update(token, 'selected_list', listData[0]['selected_list']);
                        setSelectedList(listData[0]['list_id']);
                    }
                    
                } else {
                    setSelectedList( selectedListExists['list_id'] ); 
                }

                listData.map( list => {
                    let listId = list['list_id'];
                    return goalsData[listId] = { 
                        fetchedOnce: false,
                        data: []
                    };
                });
            
                setGoals(goalsData);

                setRetrievedLists(true);
                setInitialFetchDone(true);
            }
            retrieveData();
        }
    }, [token])
    
    // handle calls for goals updates
    useEffect( () => {
        // We only want the code to execute in a few scenarios:
        // If retrievedGoals has been set to false
        // OR
        // If selectedList changes and the goal data has not been fetched, then this will execute 
        const goalsNeedRetrieval = !retrievedGoals || !goals[selectedList] || !goals[selectedList].fetchedOnce;

        if (initialFetchDone && token && goalsNeedRetrieval ){
            grabGoalsData({token, selectedList, goals, setGoals});
            setRetrievedGoals(true);
        }

    }, [initialFetchDone, selectedList, retrievedGoals]);

    // handle calls for lists updates
    useEffect( () => {
        if (token && !retrievedLists){
            grabListsData({token, setLists})
            setRetrievedLists(true);
        }
    }, [retrievedLists]);

    const updateGoals = () => {
        setRetrievedGoals(false);
    }

    const updateLists = () => {
        setRetrievedLists(false);
    }

    return(
        <>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <MainPage
                            token={token}
                            username={username}
                            email={email} 
                            lists={lists}
                            selectedList={selectedList}
                            setSelectedList={setSelectedList}
                            goals={goals}
                            updateGoals={updateGoals}
                            updateLists={updateLists}
                        />
                    </Route>
                    <Route exact path="/login">
                        <LoginPage updateToken={setToken}/>
                    </Route>
                    <Route exact path="/register">
                        <RegisterPage updateToken={setToken}/>
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



async function grabListsData({token, setLists}){

    let listData;

    const getListsConfig = {
        method: 'get',
        url: getListsRoute,
        headers: {
            'x-access-token': token
        }
    }

    await axios(getListsConfig)
        .then( res => {
            // We are just capturing the results and storing them in listData
            return listData = res.data.results;
        });
    setLists(listData);
}

async function grabGoalsData({token, selectedList, goals, setGoals}){

    // if selectedList is zero, then we will not update goals at all
    if (!selectedList){
        return;
    }

    // Otherwise, ...
    // Note, if selectedList has not be verified yet, then this will not throw an error. And, that's good!
    let goalsData = {...goals}
    const config= {
        method: 'get',
        url: getGoalsRoute,
        params: { listId: selectedList},
        headers: {
            'x-access-token': token,
        }
    }

    await axios(config)
        .then( res => {
            // If selectedList is not already a key in goals, then we need to add it
            if (!goalsData[selectedList]){
                goalsData[selectedList]={
                    fetchedOnce: false, data: []
                }
            }

            // Reading this key-value pair everytime and writing sometimes should be faster than just writing every time 
            if (!goalsData[selectedList].fetchedOnce) {goalsData[selectedList].fetchedOnce = true;}
            goalsData[selectedList].data= res.data.results;
        });
    setGoals(goalsData);
}

async function firstFetch({token, setUsername, setEmail, setSelectedList, setLists, setGoals}){

    // on first fetch: grab user data, grab list data, handle selectedList, make goals obj,

    let userData;
    let listData;
    let goalsData={};

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
            // We are just capturing the results and storing them in userData
            return userData = res.data.results;
        });
    setUsername(userData.username);   
    setEmail(userData.email);

    const selectedList= userData['selected_list'];

    await axios(getListsConfig)
        .then( res => {
            // We are just capturing the results and storing them in listData
            return listData = res.data.results;
        });
    setLists(listData);

    // We need to manually check that the selectedList exists because we can't have a circular reference in our db.

    const selectedListExists = listData.find( list => list['list_id'] === selectedList);

    // If the selectedList doesn't exist, we will need to manually update selectedList.
    if (!selectedListExists){
        // If listData = [], ...
        if (!listData.length){
            await userManagement.update(token, 'selected_list', 0);
        }
        // Otherwise ...
        await userManagement.update(token, 'selected_list', listData[0]['selected_list']);
        setSelectedList(listData[0]['list_id']);
    } else {
        setSelectedList( selectedList ); 
    }

    // For each list, we are going to add key-value pair to goalsData.
    // When we actually fetch the goalsData, we will fill in this data.
    listData.map( list => {
        let listId = list['list_id'];
        return goalsData[listId] = { 
            fetchedOnce: false,
            data: []
        };
    });

    setGoals(goalsData);
}


async function GrabData(config){
    return axios(config).then(res => res.data.results);
}

async function efficientFetch({token}){

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

    return Promise.all([GrabData(getUserConfig), GrabData(getListsConfig)])
}
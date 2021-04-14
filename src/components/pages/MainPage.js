import React, {useState, useEffect} from 'react';


import Sticky from '../sticky/Sticky.js';
import StickiesBar from '../stickies-bar/StickiesBar.js';
import DetailsBar from '../details-bar/DetailsBar.js';
import goalManagement from '../../services/goalManagement.js';
import listManagement from '../../services/listManagement.js';
import userManagement from '../../services/userManagement.js';

import useWindowDimensions from '../../hooks/useWindowDimensions.js';




// I need to update selectedList to be a local storage thing


// This component is a child of MainPage that displays all of the list names.

// NOTES ON PROPS PASSED TO THIS COMPONENT

// token is set in App and used as credentials to make db queries

// goals is defined in App and has shape { [list_id]: { fetchedOnce, data: [goal1,goal2,...] } }.
// goals can be an empty object ie. goals = {}
// goal data has shape: { list_id, goal_id, goal, note, status color }

// lists is set in App and has shape [ {list_id, list_name, order_number}, {list_id, list_name, order_number}, ...]
// list data has shape { list_id, list_name, order_number }

// selectedList is a list_id (i.e. positive number) which is defined in Main Page
// setSelectedList is the setter for selectedList

// updateLists is a synchronous function defined in App. This function forces App to query the db for all list info. Note, this fn is not async.
// updateGoals is a synchronous function defined in App. This function forces App to query the db for all goals info. Note, this fn is not async.

/* 
 * setData is an object which holds all of the data setters (great explanation, I know). It's shape:
 * setData = { username, email, lists, selectedList, goals } where each value is the setter for that data.
 * In other words, setData.username = setUsername;
 * If users want to use the site without logging in, we can't make a db queries to update state in app. Hence, we need to pass the setters.
 */
const blankList = { 'list_name': 'Create a New List', 'order_number': undefined}

export default function MainPage({token, goals, lists, selectedList, setSelectedList,  updateLists, updateGoals, setToken}){

    const [allGoals, setAllGoals] = useState( goals ? {...goals} : {});

    useEffect( () => {
        setAllGoals(goals ? {...goals} : {});
    }, [goals,lists])
 

    // the current list might be undefined
    const [currentList, setCurrentList] = useState(lists.find(list => list['list_id'] === selectedList) || blankList );

    // whenever props update, update currentList
    useEffect( () => {
        setCurrentList( lists.find( list => list['list_id'] === selectedList )|| blankList);
    }, [selectedList, lists]);

    const [currentGoals, setCurrentGoals] = useState(allGoals[selectedList]);
 
    // whenever props update, update currentGoals
    useEffect( () => {
        let updatedGoals = {}
        // allGoals has shape: { listId: {goalData}, ... }
        Object.keys(allGoals).map(
            listId => {
                updatedGoals[listId] = {};

                return Object.keys(allGoals[listId]).map( (key) => {
                    let newData = allGoals[listId][key];
                    updatedGoals[listId][key] = Array.isArray(newData) ? [...newData] : newData;
                    return newData;
                });
            }
        )
        setCurrentGoals(updatedGoals[selectedList]);
    }, [selectedList, allGoals])


    // goalSelected will be either null or a goal id.
    const [goalSelected, setGoalSelected] = useState(null);
    
    const [getListDetails, setGetListDetails] = useState(false);

    const [detailsBarIsVisible, setDetailsBarIsVisible] = useState(false);


    const windowDimensions = useWindowDimensions(); //this hook grabs the viewport width and height and returns { width, height }
    const [stickiesBarIsVisible, setStickiesBarIsVisible] = useState(windowDimensions.width <= windowDimensions.height);
    
    useEffect(()=>{
        setStickiesBarIsVisible(windowDimensions.width <= windowDimensions.height);
    }, [windowDimensions])

    const signOut = () => {
        setToken(false);
    }

    const handleListDeletion = async e => {
        if (token && currentList['list_id']) {
            if (currentGoals.data.length) {
                const idsArray = currentGoals.data.map(goal => goal['goal_id']);
                await goalManagement.deleteMany(token, idsArray);
            }

            await listManagement.delete(token, currentList['list_id']);
            const nextListId = lists.map(list => list['list_id']).find( id => id !== selectedList); // Note, this either returns a new list id or undefined
            await userManagement.update(token, 'selected_list', nextListId); //
            setSelectedList(nextListId);
            updateLists();
        }
    }

    return(
        <>
            <StickiesBar
                token={token}
                lists={lists}
                selectedList={selectedList}
                setSelectedList={setSelectedList}
                visibility={stickiesBarIsVisible}
                setGetListDetails={setGetListDetails}
                setDetailsBarIsVisible={setDetailsBarIsVisible}
                updateLists={updateLists}
                signOut = {signOut}
            />
                   
            <Sticky
                token={token}
                theList={currentList}
                theGoals={currentGoals}
                goalSelected={goalSelected}
                setGoalSelected={(goalId) => {
                    setGetListDetails(false);
                    setGoalSelected(goalId);
                }}
                getListDetails={getListDetails}
                setGetListDetails={setGetListDetails}
                handleListDeletion={handleListDeletion}
                updateGoals={updateGoals}
                updateLists={updateLists}
                detailsBarIsVisible={detailsBarIsVisible}
                setDetailsBarIsVisible={setDetailsBarIsVisible}
            />
 
            <DetailsBar 
                token={token}
                goals={goals}
                lists={lists}
                selectedList={selectedList}
                goalSelected={goalSelected}
                setGoalSelected={setGoalSelected}
                getListDetails={getListDetails}
                handleDeleteList={handleListDeletion}
                visibility={detailsBarIsVisible}
                setVisibility={setDetailsBarIsVisible}
                updateLists={updateLists}
                updateGoals={updateGoals}
            />   
        </>
    )
}



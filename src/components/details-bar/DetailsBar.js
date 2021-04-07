import "../../component-styles/details-bar.css";
import {useEffect, useState} from 'react';

import GoalDetails from './GoalDetails.js';
import ListDetails from './ListDetails.js';



// This component is a child of MainPage that is shown whenever the user wants to update either list or goal data.

// NOTES ON PROPS PASSED TO THIS COMPONENT

// token is set in App and used as credentials to make db queries
// goals is defined in App and has shape { [list_id]: { fetchedOnce, data: [goal1,goal2,...] } }.
// goals can be an empty object ie. goals = {}
// goal data has shape: { list_id, goal_id, goal, note, status color }
// lists is set in App and has shape [ {list_id, list_name, order_number}, {list_id, list_name, order_number}, ...]
// list data has shape { list_id, list_name, order_number }
// selectedList is a list_id (i.e. positive number) which is defined in Main Page
// goalSelected is a goal_id which is defined in Main Page and updated by Sticky
// setGoalSelected is the setter for goalSelected
// getListDetails is a boolean that represents whether use wants to update a list or not.
// deleteList is defined in MainPage and handles deleting a list. Because we are using a relational db, we must delete all goals associated to a list before we delete the list itself.
// updateLists is a synchronous function defined in App. This function forces App to query the db for all list info. Note, this fn is not async.
// updateGoals is a synchronous function defined in App. This function forces App to query the db for all goals info. Note, this fn is not async.


// Note, we are not implementing deadlines for the moment because not all browsers support that input type. We will implement this in the future.


export default function DetailsBar({token, goals, lists, selectedList, goalSelected, setGoalSelected, getListDetails, deleteList, updateGoals, updateLists, visibility, setVisibility}){
    
    return (
        <div
            id="details-bar" 
            className={
                visibility
                    ? "component-shown"
                    : "component-hidden"
            }
        >
            {getListDetails 
                ? <ListDetails
                    token={token}
                    lists={lists}
                    selectedList={selectedList}
                    updateLists={updateLists}
                    setVisibility={setVisibility}
                    deleteList={deleteList}
                />
                : <GoalDetails 
                    token={token}
                    goals={goals}
                    selectedList={selectedList}
                    goalSelected={goalSelected}
                    setGoalSelected={setGoalSelected}
                    updateGoals={updateGoals}
                    setVisibility={setVisibility}
                />
            }
        </div>
    )
}


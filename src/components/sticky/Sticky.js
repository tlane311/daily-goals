import {useState, useEffect} from 'react';
import '../../component-styles/sticky.css';

import Task from '../task/task.js';

import React from 'react';

import goalManagement from '../../services/goalManagement.js';
import listManagement from '../../services/listManagement.js';
import userManagement from '../../services/userManagement.js';

import useKeyDown from '../../hooks/useKeyDown.js';


export default function Sticky({ token, theList, theGoals, goalSelected, setGoalSelected, getListDetails, setGetListDetails, updateGoals, updateLists, detailsBarIsVisible, setDetailsBarIsVisible }){
    const enterKeyIsDown = useKeyDown('Enter'); // We would like for the user to be able create a new goal using "Enter" key

    // Shape of theGoals: { fetchedOnce, data }

    const [goals, setGoals] = useState(theGoals ? theGoals.data : []);

    useEffect( () => {
        const newGoals = theGoals ? {...theGoals} : {fetchedOnce: false, data: []}
        setGoals(newGoals.data)
    }, [theGoals]);


    // if the goals aren't sorted, handle sorting
    useEffect( () => {
        // Note, we define an async function and then call it to make sure our db updates happen in a given order
        // If we modify this in the future, take this note into consideration.

        const asyncEffect = async () => {

            // If order numbers are inconsistent, we will update db and the rerender app.
            // If order numbers are consistent, we will sort theGoals and store as state.

            // This const is just so that we always have a well-defined theGoals-like obj. Hence: 'reliable'.
            const reliableGoals = theGoals ? {...theGoals} : {fetchedOnce: false, data: []}

            // containsRepeats returns a boolean representing if the arr contains repeats
            const repeatsExist = containsRepeats(reliableGoals.data.map(goal => goal['order_number']));
            const gapsExist = reliableGoals.data.filter( goal => goal['order_number'] >= reliableGoals.data.length).length;

            // If no gaps exist, then every element has order number less than the length.
            // If there are no repeats and no gaps, then theGoals.data.map(goal => goal['order_number']) = [0,1,2,3, ..., theGoals.length - 1];
            const sortingNeeded = gapsExist || repeatsExist;
            
            if (sortingNeeded) {
                // We order the given reliableGoals by the order-numbers presented.
                // Then, we will change the order-numbers so that no repeats or gaps exist
                // If we do not first order reliableGoals, then really chaotic reorderings can happen if the user spams the order-buttons.
                const orderedGoals = [...reliableGoals.data];
                orderedGoals.sort( (first, second) => first['order_number'] - second['order_number']);
                // Note, for a compare fn, positive difference means reverse order, nonpositive difference means preserve order
                for (let i=0; i < orderedGoals.length; i++){                
                    await goalManagement.update( token,
                        orderedGoals[i]['goal_id'], //goalId
                        orderedGoals[i]['goal'], //goal
                        i, //orderNumber.
                        orderedGoals[i]['deadline'], //deadline
                        orderedGoals[i]['status'], //status
                        orderedGoals[i]['note'], //note
                        orderedGoals[i]['color'], //color
                    )
                }

                return updateGoals();
            }

            // If sorting not needed ...
            const sorted = [...reliableGoals.data].sort( (a,b) => a['order_number'] - b['order_number']);
            // Note, for a compare fn, positive difference means reverse order, nonpositive difference means preserve order
            setGoals(sorted);
        }
        if (token){  
            asyncEffect();
        }

    }, [theGoals])

    const [newTask, setNewTask] = useState("");

    const handleNewGoalCreation = async e => {
        // if user is logged in, update the db and the tell App to fetch the updated data
        if (token){
            await goalManagement.create(token, theList['list_id'], newTask, theGoals.data.length+1);
            setNewTask("");
            updateGoals();
        }
    }
    // C O M E   B A C K   T O   T H I S   O N E
    // This needs to be moved up to MainPage
    const handleListDeletion = async e => {
        // if user is logged in, update the db and the tell App to fetch the updated data
        if (token){
            if (theGoals.data.length){
                const idsArray = theGoals.data.map(goal => goal['goal_id']);
                await goalManagement.deleteMany(token, idsArray);
            }
            await listManagement.delete(token, theList['list_id']);
            await userManagement.update(token, 'selected_list', null);
            updateLists();
        }
    }

    useEffect( () => { // Note, we had some trouble using onKeyDown, so we make use of useEffect to handle the keydown "event".
        if (enterKeyIsDown && newTask)
        {
            handleNewGoalCreation();
        }
    }, [enterKeyIsDown])

    const handleIncreasePriority = (id) => {

        // We will return an event handler that depends upon the id input

        return e => {
            // Here, we will update the priority in the db and then update the app

            const targetIndex = goals.findIndex( goal => goal['goal_id'] === id);

            // If target is the first element of the array OR for some reason the id is not found
            if (targetIndex<=0) return;

            // Otherwise,
            
            const targetGoal = goals[targetIndex];
            const previousGoal = goals[targetIndex - 1]; // Note, if the function reaches here, targetIndex - 1 >= 0

            goalManagement.update(token,
                targetGoal['goal_id'],
                targetGoal['goal'],
                targetIndex - 1,
                targetGoal['deadline'],
                targetGoal['status'],
                targetGoal['note'],
                targetGoal['color'])
                .then(res => {
                    return goalManagement.update(token,
                        previousGoal['goal_id'],
                        previousGoal['goal'],
                        targetIndex,
                        previousGoal['deadline'],
                        previousGoal['status'],
                        previousGoal['note'],
                        previousGoal['color']
                    );
                })
                .then( res => {
                    return updateGoals();
                });
        }

    }

    const handleDecreasePriority = (id) => {
        // We will return an event handler that depends upon the id input

        return e => {
            // Here, we will update the priority in the db and then update the app

            const targetIndex = goals.findIndex( goal => goal['goal_id'] === id); 

            // If target is the last element of the array OR for some reason the id is not found
            
            if (targetIndex<0 || targetIndex===goals.length - 1) return;

            // Otherwise,
            
            const targetGoal = goals[targetIndex];
            const nextGoal = goals[targetIndex + 1]; // Note, if the function reaches here, targetIndex - 1 >= 0

            goalManagement.update(token,
                targetGoal['goal_id'],
                targetGoal['goal'],
                targetIndex + 1,
                targetGoal['deadline'],
                targetGoal['status'],
                targetGoal['note'],
                targetGoal['color'])
                .then( res => {
                    return goalManagement.update(token,
                        nextGoal['goal_id'],
                        nextGoal['goal'],
                        targetIndex,
                        nextGoal['deadline'],
                        nextGoal['status'],
                        nextGoal['note'],
                        nextGoal['color']
                    );
                })
                .then( res => {
                    updateGoals();
                });
        }



    }

    const handleListDetails = e => {
        // getListDetails is false and detailsBarIsVisibile is false
        // getListDetails is false and detailsBarIsVisible is true
        // getListDetails is true
        
        if (getListDetails){
            
            setDetailsBarIsVisible(!detailsBarIsVisible)
            // This timeout is because of a visual bug.
            setTimeout(() => {setGetListDetails(false);}, 500)
        }
        if (!getListDetails && !detailsBarIsVisible){
            setDetailsBarIsVisible(true);
            setGetListDetails(true);        
        }

        if (!getListDetails && detailsBarIsVisible){
            setGetListDetails(true)
        }
    }

    return (
        <div className="sticky" id="sticky"> {/* why do I have redundant class and id*/}
            <h3
                onClick={ handleListDetails}
            > 
                {theList['list_name']}
            </h3>
            <button onClick={handleListDeletion}> Delete This List </button>
            <ul>
                {goals.map(
                    (goal,index) => 
                        <Task 
                            token={token}
                            goal={goal}
                            goalSelected={goalSelected}
                            setGoalSelected={setGoalSelected}
                            handleIncreasePriority={handleIncreasePriority}
                            handleDecreasePriority={handleDecreasePriority}
                            updateGoals={updateGoals}
                            getListDetails={getListDetails}
                            setGetListDetails={setGetListDetails}
                            detailsBarIsVisible={detailsBarIsVisible}
                            setDetailsBarIsVisible={setDetailsBarIsVisible}
                        />)}
            </ul>
            <span className="new-task">
                <button onClick={handleNewGoalCreation}>
                    +
                </button> 

                <input type="text" value={newTask} onChange={ e => setNewTask( e.target.value)}/>
            </span>

           
        </div>
    )
}

function RenameListInput({setNewListName, updateList}){
    return (
        <>
            <input type="text" placeholder="New List Name" onChange={ e => { setNewListName(e.target.value); }}/>
            <button onClick={updateList}> Update </button>
        </>
    );
}

// Helper function for ordering goals/lists
function containsRepeats(arr){
    if (!Array.isArray(arr)) return undefined;
    
    let newArr = [];

    for (let index =0; index < arr.length; index++){
        if ( newArr.includes(arr[index]) ) return true;
        newArr.push(arr[index]);
    }

    return false;
}
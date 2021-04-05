import {useState, useEffect} from 'react';
import '../../component-styles/sticky.css';

import Task from '../task/task.js';

import React from 'react';

import goalManagement from '../../services/goalManagement.js';
import listManagement from '../../services/listManagement.js';
import userManagement from '../../services/userManagement.js';

import useKeyDown from '../../hooks/useKeyDown.js';


export default function Sticky({theList, theGoals, token, setGoalSelected, updateGoals, updateLists}){


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

            const reliableGoals = theGoals ? {...theGoals} : {fetchedOnce: false, data: []}

            // containsRepeats returns a boolean representing if the arr contains repeats
            const repeatsExist = containsRepeats(reliableGoals.data.map(goal => goal['order_number']));
            const gapsExist = reliableGoals.data.filter( goal => goal['order_number'] >= reliableGoals.data.length).length;

            // If no gaps exist, then every element has order number less than the length.
            // If there are no repeats and no gaps, then theGoals.data.map(goal => goal['order_number']) = [0,1,2,3, ..., theGoals.length - 1];
            const sortingNeeded = gapsExist || repeatsExist;
            
            if (sortingNeeded) {
                for (let i=0; i < reliableGoals.data.length; i++){                
                    await goalManagement.update( token,
                        reliableGoals.data[i]['goal_id'], //goalId
                        reliableGoals.data[i]['goal'], //goal
                        i, //orderNumber.
                        reliableGoals.data[i]['deadline'], //deadline
                        reliableGoals.data[i]['status'], //status
                        reliableGoals.data[i]['note'], //note
                        reliableGoals.data[i]['color'], //color
                    )
                }

                return updateGoals();
            }

            // If sorting not needed ...
            const sorted = [...reliableGoals.data].sort( (a,b) => a['order_number'] - b['order_number']);
            setGoals(sorted);
        }

        asyncEffect();

    }, [theGoals])

    const [newTask, setNewTask] = useState("");
    const [renameList, setRenameList] = useState(false)
    const [newListName, setNewListName] = useState("");

    const handleNewGoalCreation = async e => {
        await goalManagement.create(token, theList['list_id'], newTask, theGoals.data.length+1);
        setNewTask("");
        updateGoals();
    }

    const handleListUpdate = async e => {
        setRenameList(false);
        await listManagement.update(token, 'list_name', newListName, theList['list_id']);
        setNewListName("");
        updateLists();
    }

    const handleListDeletion = async e => {
        if (theGoals.data.length){
            const idsArray = theGoals.data.map(goal => goal['goal_id']);
            await goalManagement.deleteMany(token, idsArray);
        }
        await listManagement.delete(token, theList['list_id']);
        await userManagement.update(token, 'selected_list', null);
        updateLists();
    }

    useEffect( () => { // Note, we had some trouble using onKeyDown, so we make use of useEffect to handle the keydown "event".
        if (enterKeyIsDown && newTask)
        {
            handleNewGoalCreation();
        }
    }, [enterKeyIsDown])

    const handleIncreasePriority = (id) => {
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
            targetGoal['color']
        ).then(res => {
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
        })
    }

    const handleDecreasePriority = (id) => {
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
            targetGoal['color']
        ).then( res => {
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

    return (
        <div className="sticky" id="sticky"> {/* why do I have redundant class and id*/}
            <h3 onClick={()=>{ setRenameList(!renameList); }}> {theList['list_name']} </h3>
            { renameList ? <RenameListInput setNewListName={setNewListName} updateList = {handleListUpdate} />: <></>}
            <button onClick={handleListDeletion}> Delete This List </button>
            <ul>
                {goals.map(
                    (goal,index) => 
                        <Task 
                            token={token}
                            goal={goal}
                            setGoalSelected={setGoalSelected}
                            handleIncreasePriority={handleIncreasePriority}
                            handleDecreasePriority={handleDecreasePriority}
                            updateGoals={updateGoals}
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
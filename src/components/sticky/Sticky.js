import {useState, useEffect} from 'react';
import '../../component-styles/sticky.css';

import Task from '../task/task.js';

import goalManagement from '../../services/goalManagement.js';
import listManagement from '../../services/listManagement.js';
import userManagement from '../../services/userManagement.js';

import useKeyDown from '../../hooks/useKeyDown.js';


export default function Sticky({theList, theGoals, token, setGoalSelected, updateApp}){
    
    const enterKeyIsDown = useKeyDown('Enter'); // We would like for the user to be able create a new goal using "Enter" key

    const [goals, setGoals] = useState(theGoals);

    // if the goals aren't sorted, handle sorting
    useEffect( () => {
        // Note, we define an async function and then call it to make sure our db updates happen in a given order
        // If we modify this in the future, take this note into consideration.

        const asyncEffect = async () => {
            // If order numbers are inconsistent, we will update db and the rerender app.
            // If order numbers are consistent, we will sort theGoals and store as state.

            
            // containsRepeats returns a boolean representing if the arr contains repeats
            const sortingNeeded = containsRepeats(theGoals.map(goal => goal['order_number']));

            if (sortingNeeded) {
                for (let i=0; i < theGoals.length; i++){                
                    await goalManagement.update( token,
                        theGoals[i]['goal_id'], //goalId
                        theGoals[i]['goal'], //goal
                        i, //orderNumber.
                        theGoals[i]['deadline'], //deadline
                        theGoals[i]['status'], //status
                        theGoals[i]['note'], //note
                        theGoals[i]['color'], //color
                    )
                }
                return await updateApp();
            }

            const sorted = [...theGoals].sort( (a,b) => a['order_number'] - b['order_number']);
            setGoals(sorted);
        }

        asyncEffect();

    }, [theGoals])

    const [newTask, setNewTask] = useState("");
    const [renameList, setRenameList] = useState(false)
    const [newListName, setNewListName] = useState("");

    const handleNewGoalCreation = async e => {
        await goalManagement.create(token, theList['list_id'], newTask, theGoals.length+1);
        setNewTask("");
        return await updateApp();
    }

    const handleListUpdate = async e => {
        setRenameList(false);
        await listManagement.update(token, 'list_name', newListName, theList['list_id']);
        setNewListName("");
        return await updateApp();
    }

    const handleListDeletion = async e => {
        if (theGoals.length){
            const idsArray = theGoals.map(goal => goal['goal_id']);
            await goalManagement.deleteMany(token, idsArray);
        }
        await listManagement.delete(token, theList['list_id']);
        await userManagement.update(token, 'selected_list', null);
        return await updateApp();
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
        );
        goalManagement.update(token,
            previousGoal['goal_id'],
            previousGoal['goal'],
            targetIndex,
            previousGoal['deadline'],
            previousGoal['status'],
            previousGoal['note'],
            previousGoal['color']
        );

        updateApp();

    }

    const handleDecreasePriority = (id) => {
        console.log('down')
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
        );
        goalManagement.update(token,
            nextGoal['goal_id'],
            nextGoal['goal'],
            targetIndex,
            nextGoal['deadline'],
            nextGoal['status'],
            nextGoal['note'],
            nextGoal['color']
        );

        updateApp();
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
                            updateApp={updateApp}
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
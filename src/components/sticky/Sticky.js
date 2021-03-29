import {useState, useEffect} from 'react';
import '../../component-styles/sticky.css';

import Task from '../task/task.js';

import goalManagement from '../../services/goalManagement.js';

import useKeyDown from '../../hooks/useKeyDown.js';
export default function Sticky({theList, theGoals, token, setGoalSelected, updateApp}){
    
    const enterKeyIsDown = useKeyDown('Enter'); // We would like for the user to be able create a new goal using "Enter" key

    const [newTask, setNewTask] = useState("");

    const handleNewGoalCreation = e => {
        goalManagement.create(token, theList['list_id'], newTask, theGoals.length+1);
        updateApp();
    }

    const handleListDeletion = e => {
        deleteTheList();
    }

    useEffect( () => { // Note, we had some trouble using onKeyDown, so we make use of useEffect to handle the keydown "event".
        if (enterKeyIsDown && newTask)
        {
            handleNewGoalCreation();
        }
    }, [enterKeyIsDown])

    return (
        <div className="sticky" id="sticky">
            <h3> {theList['list_name']} </h3>
            <ul>
                {theGoals.map(
                    (goal,index) => 
                        <Task 
                            token={token}
                            goal={goal}
                            setGoalSelected={setGoalSelected}
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


async function deleteTheList(){
 // swap which list you are looking at
 // delete all goals in a list
 // delete the list   
}

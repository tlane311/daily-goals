import {useState} from 'react';
import '../../component-styles/sticky.css';

import Task from '../task/task.js';

import goalManagement from '../../services/goalManagement.js';

export default function Sticky({theList, theGoals, token, updateApp}){
    const [newTask, setNewTask] = useState("");

    const handleNewGoalCreation = e => {
        goalManagement.create(token, theList['list_id'], newTask, theGoals.length+1);
        updateApp();
    }

    return (
        <div className="sticky" id="sticky">
            <h3> {theList['list_name']} </h3>
            <ul>
                {theGoals.map(
                    (goal,index) => 
                        <Task 
                            name={goal.goal} 
                            columnID={goal['list_id']}
                            taskID={goal['goal_id']}
                            completed={goal.status} 
                            updateTask={()=>{}} 
                            deleteTask={()=>{}}
                        />)}
            </ul>
            <span className="new-task">
                <button 
                    onClick={handleNewGoalCreation}>
                    +
                </button> 

                <input type="text" value={newTask} onChange={ e => setNewTask( e.target.value)}/>
            </span>

           
        </div>
    )
}
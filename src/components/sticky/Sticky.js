import {useState} from 'react';
import '../../component-styles/sticky.css';

import Task from '../task/task.js';

//The Column component holds Tasks. Columns are held in the Column-View component which displays only a few columns at a time.
//Entries are passed from the Column-View
//Column must contain new task btn


export default function Sticky({theList, theGoals, updateEntries, updateTask, deleteTask, deleteColumn}){
    const [newTask, setNewTask] = useState("");

    return (
        <div className="sticky" id="sticky">
            <h3> {theList['list_name']} </h3>
            {/*<button onClick={() => {deleteColumn(id)}}>x</button>*/}
            <ul>
                {theGoals.map(
                    (entry,index) => 
                        <Task 
                            name={entry.goal} 
                            columnID={entry['list_id']}
                            taskID={entry['goal_id']}
                            completed={entry.status} 
                            updateTask={updateTask} 
                            deleteTask={deleteTask}
                        />)}
            </ul>
            <span className="new-task">
                <button 
                    onClick={() => {
                        updateEntries(newTask); //this will throw an error
                        setNewTask(""); 
                    }}>
                    +
                </button> 

                <input type="text" value={newTask} onChange={ e => setNewTask( e.target.value)}/>
            </span>

           
        </div>
    )
}
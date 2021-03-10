import {useState} from 'react';

import Task from '../../components/task/task.js';

//The Column component holds Tasks. Columns are held in the Column-View component which displays only a few columns at a time.
//Entries are passed from the Column-View
//Column must contain new task btn


export default function Column({name, id, entries, updateEntries, updateTask, deleteTask, deleteColumn}){
    const [newTask, setNewTask] = useState("");

    return (
        <div className="column">
            <h3> {name} </h3>
            <button onClick={() => {deleteColumn(id)}}>x</button>
            <ul>
                {entries.map(
                    (entry,index) => 
                        <Task 
                            name={entry.name} 
                            columnID={id}
                            taskID={index}
                            completed={entry.completed} 
                            updateTask={updateTask} 
                            deleteTask={deleteTask}
                        />)}
            </ul>
            <input type="text" value={newTask} onChange={ e => setNewTask( e.target.value)}/>
            <button 
                onClick={() => {
                    updateEntries(id,newTask);
                    setNewTask(""); 
                }}>
                New Task
            </button>            
        </div>
    )
}
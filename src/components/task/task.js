import '../../component-styles/task.css';
import {useState} from "react"

//Task components are stateless. Data about completion and name are passed from the column component.

export default function Task({name, completed, updateTask, columnID, taskID, deleteTask}){
    const [completion, updateCompletion] = useState(completed);
    return (
        <>
            <li className="task">
                <span 
                    className={completion ? "strikethrough" : ""}
                    onClick={() => {
                    updateTask(columnID, taskID, !completed);
                    updateCompletion(!completion)
                }}>
                    {name}
                </span>
                {completion ? <button onClick={()=>deleteTask(columnID,taskID)}> x </button> : <></>}
            </li>
        </>
    )
}
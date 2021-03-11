import '../../component-styles/task.css';
import {useState} from "react"

//Task components are stateless. Data about completion and name are passed from the column component.

export default function Task({name, completed, updateTask, columnID, taskID, deleteTask}){
    const [completion, updateCompletion] = useState(completed);
    return (
        <>
            <li className="task">

                <label>
                    <input type="checkbox" checked={completion}/>
                    <span 
                        className="status-box" 
                        onClick={(e)=> updateCompletion(!completion)}    
                    />

                    <span 
                        className={(completion ? "strikethrough" : "")+" goal-text"}
                        onClick={() => {
                        updateTask(columnID, taskID, !completed);
                        updateCompletion(!completion)
                    }}>
                        {name}
                    </span>
                    {completion ? <button onClick={()=>deleteTask(columnID,taskID)}> x </button> : <></>}



                </label>


            </li>
        </>
    )
}
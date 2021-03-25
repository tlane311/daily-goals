import '../../component-styles/task.css';
import {useState} from "react"
import goalManagement from '../../services/goalManagement.js';

export default function Task({ token, goal, updateApp }){
    const [completion, updateCompletion] = useState(goal.status);

    const handleGoalDeletion = e => {
        goalManagement.delete(token, goal['goal_id']);
        updateApp();
    }

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
                            
                            updateCompletion(!completion)
                    }}>
                        {goal.goal}
                    </span>
                    {completion ? <button onClick={handleGoalDeletion}> x </button> : <></>}



                </label>


            </li>
        </>
    )
}
import '../../component-styles/task.css';

import OrderButtons from './OrderButtons.js';
import {useEffect, useState} from "react";
import goalManagement from '../../services/goalManagement.js';

export default function Task({ token, goal, setGoalSelected, updateGoals, handleIncreasePriority, handleDecreasePriority}){
    const [completion, updateCompletion] = useState(goal.status);

    useEffect( () => {
        updateCompletion(goal.status);
    }, [token, goal])

    const handleGoalDeletion = e => {
        goalManagement.delete(token, goal['goal_id'])
            .then( res => {updateGoals() });
    }

    const handleGoalStatusChange = e => {
        updateCompletion(!completion);
        goalManagement.update(
            token,
            goal['goal_id'],
            goal['goal'],
            goal['order_number'],
            goal['deadline'],
            !completion ? 1 : 0,
            goal['note'],
            goal['color']
        ).then( res => {
            updateGoals();
        });
    }
   
    return (
        <>
            <li className="task">
                {/* Note, the label here groups together the spans with the checkbox input. */}
                <label>
                    <input data-testid="task-checkbox" type="checkbox" checked={completion} readOnly/>
                    <span 
                        className="status-box" 
                        onClick={handleGoalStatusChange}
                        data-testid="task-status-span"    
                    />

                    <span 
                        className={(completion ? "strikethrough" : "")+" goal-text"}
                        onClick={() => { setGoalSelected(goal['goal_id']); }}
                        data-testid="task-goal-span"
                    >
                        {goal.goal}
                    </span>
                </label>

                {completion ? <button onClick={handleGoalDeletion} className="delete-goal-btn"> {X()} </button> : <></>}
                    <OrderButtons 
                        handleIncreasePriority={ () => { handleIncreasePriority(goal['goal_id']) } }
                        handleDecreasePriority={ () => { handleDecreasePriority(goal['goal_id']) } }
                    />


            </li>
        </>
    )
}

const X = () => {
    return(
        <>
            <div className="slant-up"/>
            <div className="slant-down"/>
        </>
    )
}
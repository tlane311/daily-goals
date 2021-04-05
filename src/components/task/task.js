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
            updateCompletion(!completion);
            updateGoals();
        });
    }
   
    return (
        <>
            <li className="task">

                <label>
                    
                    <input type="checkbox" checked={completion}/>
                    <span 
                        className="status-box" 
                        onClick={handleGoalStatusChange}    
                    />

                    <span 
                        className={(completion ? "strikethrough" : "")+" goal-text"}
                        onClick={() => {
                            setGoalSelected(goal['goal_id']);
                        }
                    }>
                        {goal.goal}
                    </span>
                    {completion ? <button onClick={handleGoalDeletion}> x </button> : <></>}
                    <OrderButtons 
                        handleIncreasePriority={ () => { handleIncreasePriority(goal['goal_id']) } }
                        handleDecreasePriority={ () => { handleDecreasePriority(goal['goal_id']) } }
                    />

                </label>


            </li>
        </>
    )
}
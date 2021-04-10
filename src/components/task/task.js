import '../../component-styles/task.css';

import OrderButtons from './OrderButtons.js';
import {useEffect, useState} from "react";
import goalManagement from '../../services/goalManagement.js';

export default function Task({ token, goal, goalSelected, setGoalSelected, updateGoals, handleIncreasePriority, handleDecreasePriority, getListDetails, setGetListDetails, detailsBarIsVisible, setDetailsBarIsVisible}){
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
    

    const handleDetailsClick = e => {
        if (goalSelected === goal['goal_id']){
            if (getListDetails) { // If user was looking at a list, don't hide the DetailsBar
                setDetailsBarIsVisible(true)
            } else { // If user hasn't been looking at lists, toggle the DetailsBar on click
                setDetailsBarIsVisible(!detailsBarIsVisible)
            }
            
        } else {
            setDetailsBarIsVisible(true);
            setGoalSelected(goal['goal_id']);
        }
        setGetListDetails(false);
    }

    /*
        booleans
            getListDetails
            visibility
            goalSelected

        actions:
            clickList
            clickSameTask
            clickDifferentTask

        t t

        t f
        
        
    */

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
                        onClick={handleDetailsClick}
                        data-testid="task-goal-span"
                    >
                        {goal.goal}
                    </span>
                </label>

                {completion ? <button onClick={handleGoalDeletion} data-testid="delete-goal-btn" className="delete-goal-btn"> {X()} </button> : <></>}
                    <OrderButtons 
                        handleIncreasePriority={ handleIncreasePriority( goal['goal_id'] ) }
                        handleDecreasePriority={ handleDecreasePriority( goal['goal_id'] ) }
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
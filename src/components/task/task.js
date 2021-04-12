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
                        <HighlightedText text={goal.goal} color={goal.color}/>
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

const HighlightedText = ({text,color}) => {
    const rgbValues = {
        pink: {r: 244, g:62, b:223},
        blue: {r:62, g: 223, b:244},
        orange: {r:244, g:129, b:62},
        green: {r:86, g:244, b:62}

    }

    const randomNumberBetween = (min,max) => {
        const difference = max - min;
        return difference*Math.random()+min;
    }
    
    // This function takes in a rgb color and returns a background with two linear gradients
    const background = ({r,g,b}) => {
        const firstAngle = randomNumberBetween(99,103); // returns a random number between 103 and 99
        const firstSpread = [randomNumberBetween(.7,1.5),2.4,5.8,93, randomNumberBetween(94,97), 98]
        const firstDensity = [0,1.25,0.5,0.3,0.7,0]


        const secondAngle = randomNumberBetween(273,277);
        const secondSpread = [0,7.9,randomNumberBetween(13,20)];
        const secondDensity = [0,0.3,0]

        return `linear-gradient(${firstAngle}deg, rgba(${r},${g},${b},${firstDensity[0]}) ${firstSpread[0]}%,rgba(${r},${g},${b},${firstDensity[1]}) ${firstSpread[1]}%,rgba(${r},${g},${b},${firstDensity[2]}) ${firstSpread[2]}%,rgba(${r},${g},${b},${firstDensity[3]}) ${firstSpread[3]}%,rgba(${r},${g},${b},${firstDensity[4]}) ${firstSpread[4]}%,rgba(${r},${g},${b},${firstDensity[5]}) ${firstSpread[5]}%), linear-gradient(${secondAngle}deg, rgba(${r},${g},${b},${secondDensity[0]}) ${secondSpread[0]}%,rgba(${r},${g},${b},${secondDensity[1]}) ${secondSpread[1]}%,rgba(${r},${g},${b},${secondDensity[2]}) ${secondSpread[2]}%)`;
    }

    // If one of the colors if from a predetermined list make a marked element

    if (color==="orange"){
        return <mark style={ { background: background(rgbValues.orange) } }> {text} </mark>
    }
    if (color==="green"){
        return <mark style={ { background: background(rgbValues.green) } }> {text} </mark>
    }
    if (color==="blue"){
        return <mark style={ { background: background(rgbValues.blue) } }> {text} </mark>
    }
    if (color==="pink"){
        return <mark style={ { background: background(rgbValues.pink) } }> {text} </mark>
    }
    
    return text
}
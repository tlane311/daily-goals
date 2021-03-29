import "../../component-styles/details-bar.css";
import {useEffect, useState} from 'react';
import goalManagement from '../../services/goalManagement.js';



// The shape of goals is [ [goal0, goal1, goal2, ... , goaln], [...], ... [...]]
// where each subarray corresponds to a given list
// Note, we are not implementing deadlines here because not all browsers support that input type.
// We will implement that when we find a work around.


export default function DetailsBar({token, goals, goalSelected, setGoalSelected, updateApp}){
    // have to set up routine for when to handleUpdate
    const [visibility, setVisibility] = useState(false);

    const blankGoal = { //blank goal in case no goal is selected
        'goal_id': "",
        'status': false,
        'goal': "",
        'deadline': '',
        'note': '',
        'color': ''
    }
    const [theGoal, setTheGoal] = useState(goals.flat().find( goal => goal['goal_id']===goalSelected) || blankGoal);

    const [updateStatus, setUpdateStatus] = useState(theGoal.status ? 1 : 0)
    const [updateGoal, setUpdateGoal] = useState(theGoal.goal)
    const [updateNote, setUpdateNote] = useState(theGoal.note)
    const [updateColor, setUpdateColor] = useState(theGoal.color)


    useEffect( () => {
        setTheGoal(goals.flat().find( goal => goal['goal_id']===goalSelected) || blankGoal);
        setVisibility(Boolean(goalSelected))
    }, [goalSelected])

    useEffect( () => {
        setUpdateStatus(theGoal.status ? 1 : 0)
        setUpdateGoal(theGoal.goal)
        setUpdateNote(theGoal.note)
    }, [theGoal])

    const handleSubmission = e => {
        if (goalSelected) {
            goalManagement.update(token, 
                theGoal['goal_id'], 
                updateGoal, 
                theGoal.orderNumber, 
                theGoal.deadline, 
                updateStatus, 
                updateNote, 
                updateColor);
            return updateApp();
        }
    }

    const handleHide = e => {
        setGoalSelected(false);
    }


    return (
        <div
            id="details-bar" 
            className={
                visibility
                    ? "component-shown"
                    : "component-hidden"
            }
        >
            <div className="detail" id="goal-box"> 
                <GoalBox
                    goal={updateGoal}
                    status={updateStatus}
                    updateGoal={setUpdateGoal}
                    updateStatus={setUpdateStatus}
                /> 
            </div>
            {/*<div className="detail"> <DeadlineBox deadline={theGoal.deadline.slice(1,theGoal.deadline.length-1)}/> </div>*/}
            <div className="detail" id="note-box"> <NoteBox note={theGoal.note} updateNote={setUpdateNote}/> </div>
            <div className="detail"> <HighlightBox highlight={theGoal.color}/> </div>
            <button onClick={handleSubmission}> Update </button>
            <button onClick={handleHide}> Hide </button>
        </div>
    )
}


function GoalBox({goal, status, updateGoal, updateStatus}){
    return (
        <>  
            <label>
                <input type="checkbox" checked={status} onChange={ e => {updateStatus(e.target.checked ? 1 : 0)}} />
                <span
                    className="status-box">
                </span>
                <input type="text" placeholder={goal} onChange={(e) => {updateGoal(e.target.value)}}/>
            </label>

        </>
    );
}

function DeadlineBox({deadline}){
    return (<>
        <label>Deadline</label>
        <input type="datetime-local" placeholder={deadline}/>
    </>)
}

function NoteBox({note, updateNote}){
    return(
        <>
            <label>Note</label>
        <textarea placeholder={note || "Leave a note for your task"} onChange={(e) => {updateNote(e.target.value)}}/>
        </>
    )
}

function HighlightBox({highlight}){
    return(
        <>  <label> Highlight Color</label>
            <select>
                <option> Red </option>  
                <option> Green </option>  
                <option> Orange </option>  
            </select>
        </>
    )
}
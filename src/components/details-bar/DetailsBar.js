import "../../component-styles/details-bar.css";
import {useEffect, useState} from 'react';
import goalManagement from '../../services/goalManagement.js';



// The shape of goals is { [list_id]: { fetchedOnce, data: [goal1,goal2,...] } }
// goals can be an empty object ie. goals = {}
// Note, we are not implementing deadlines for the moment because not all browsers support that input type.
// We will implement that when we find a work around.




export default function DetailsBar({token, goals, selectedList, goalSelected, setGoalSelected, updateGoals}){
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

    /* 
        goals = {} -> theGoal = blankGoal
        goals = (not empty) -> theGoal = selectedList ? goals[selectedList].data.find( goal => goal===goalSelected ): blankGoal 
    */

    const initialGoal = Object.keys(goals).length && selectedList && goals[selectedList] && Array.isArray(goals[selectedList].data)
        ? goals[selectedList].data.find( goal => goal['goal_id'] === goalSelected)
        : blankGoal;

    const [theGoal, setTheGoal] = useState(initialGoal);

    const [updateStatus, setUpdateStatus] = useState(theGoal.status ? 1 : 0)
    const [updateGoal, setUpdateGoal] = useState(theGoal.goal)
    const [updateNote, setUpdateNote] = useState(theGoal.note)
    const [updateColor, setUpdateColor] = useState(theGoal.color)


    useEffect( () => {
        const nextGoal = Object.keys(goals).length && selectedList && goals[selectedList] && Array.isArray(goals[selectedList].data)
            ? goals[selectedList].data.find( goal => goal['goal_id'] === goalSelected) || blankGoal
            : blankGoal
        setTheGoal(nextGoal);
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
                updateColor)
                .then( res => {updateGoals()});
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
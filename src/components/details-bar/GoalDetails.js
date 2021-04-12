import {useEffect, useState} from 'react';
import goalManagement from '../../services/goalManagement.js';

// This component is a child of DetailsBar that is shown whenever the user wants to update goal data.

// NOTES ON PROPS PASSED TO THIS COMPONENT

// token is set in App and used as credentials to make db queries
// goals is defined in App and has shape { [list_id]: { fetchedOnce, data: [goal1,goal2,...] } }.
// goals can be an empty object ie. goals = {}
// goal data has shape: { list_id, goal_id, goal, note, status color }
// selectedList is a list_id (i.e. positive number) which is defined in Main Page
// goalSelected is a goal_id which is defined in Main Page and updated by Sticky
// setGoalSelected is the setter for goalSelected
// updateGoals is a synchronous function defined in App. This function forces App to query the db for all goals info. Note, this fn is not async.
// setVisibility is a setter defined in DetailsBar. If visiblity is truthy, then detailsbar is shown and also the inverse of that statement. 



// Because DetailsBar is just moved off screen, we always need to have a goal selected for GoalDetails. We define a blank goal in case no goal is selected.
const blankGoal = { //blank goal in case no goal is selected
    'goal_id': "",
    'status': false,
    'goal': "",
    'deadline': '',
    'note': '',
    'color': ''
}

export default function GoalDetails({ token, goals, selectedList, goalSelected, setGoalSelected, updateGoals, setVisibility }){

    /*  
     *  Using goalSelected, we create state for the goal object: theGoal.

     *  If goals is an empty object or goalSelected is null or selectedList null, we will set theGoal = blankGoal.
     *  Otherwise, we set theGoal to be the goal object.
     * 
     *  We use the .find() method to define theGoal in the latter case. That method sometimes returns undefined.
     *  In this case, we set theGoal = blankGoal.
     * 
     *  Note, if goals = {}, then goals[selectedList].data.find( goal => goal===goalSelected ) will throw an error.
     *  Hence, we need to make sure everything is defined properly before we attempt to define theGoal.
     *  We check in this order:
     *      that goals is not an empty object,
     *      that selectedList is defined,
     *      that the selectedList is a key in goals, 
     *      and that goals[selectedList].data is actually an array.
     *  If all those are true, then we can safely call goals[selectedList].data.find( goal => goal===goalSelected )
     *  without fear of error.
     */



    const initialGoal = Object.keys(goals).length && selectedList && goals[selectedList] && Array.isArray(goals[selectedList].data)
        ? goals[selectedList].data.find( goal => goal['goal_id'] === goalSelected) || blankGoal
        : blankGoal;

    const [theGoal, setTheGoal] = useState(initialGoal);

    
    // This state is used to store onChange events for the input elements below.
    const [updatedStatus, setUpdatedStatus] = useState(theGoal.status ? 1 : 0)
    const [updatedGoal, setUpdatedGoal] = useState(theGoal.goal)
    const [updatedNote, setUpdatedNote] = useState(theGoal.note==="null" || theGoal.note==="undefined" ? null : theGoal.note);
    const [updatedColor, setUpdatedColor] = useState(theGoal.color)

    useEffect( () => {
        const nextGoal = Object.keys(goals).length && selectedList && goals[selectedList] && Array.isArray(goals[selectedList].data)
            ? goals[selectedList].data.find( goal => goal['goal_id'] === goalSelected) || blankGoal
            : blankGoal
        setTheGoal(nextGoal);
    }, [goalSelected])

    useEffect( () => {
        setUpdatedStatus(theGoal.status ? 1 : 0);
        setUpdatedGoal(theGoal.goal);
        setUpdatedNote(theGoal.note==="null" || theGoal.note==="undefined" ? "" : theGoal.note);
        setUpdatedColor(theGoal.color);
    }, [theGoal])


    const handleSubmission = e => {
        if (goalSelected) {
            goalManagement.update(token, 
                theGoal['goal_id'], 
                updatedGoal, 
                theGoal.order_number, 
                theGoal.deadline, 
                updatedStatus, 
                updatedNote, 
                updatedColor)
                .then( res => {
                    setVisibility(false);
                    updateGoals();
                });
        }
    }

    const handleHide = e => {
        setVisibility(false);
    }

    const handleDelete = e => {
        if (theGoal['goal_id']){
            goalManagement.delete(token, theGoal['goal_id'])
                .then(updateGoals)
                .then( () => {setVisibility(false);});
        }
    }


    return (
        <>
            {/* Note, GoalBox, NoteBox and HighlightBox are defined below. */}
            <div className="detail" id="goal-box"> 
                <GoalBox
                    goal={updatedGoal}
                    status={updatedStatus}
                    updateGoal={setUpdatedGoal}
                    updateStatus={setUpdatedStatus}
                /> 
            </div>

            <div className="detail" id="note-box">
                <NoteBox 
                    note={updatedNote}
                    updateNote={setUpdatedNote}/>
            </div>
            
            <div className="detail">
                <HighlightBox color={updatedColor} setColor={setUpdatedColor} />
            </div>
            <div id="details-bar-buttons-container">
                <button onClick={handleSubmission}> Update </button>
                <button onClick={handleHide}> Hide </button>
                <button onClick={handleDelete}> Delete </button>
            </div>

        </>
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
                <textarea type="text" value={goal} onChange={(e) => {updateGoal(e.target.value)}}/>
            </label>

        </>
    );
}

function NoteBox({note, updateNote}){
    return(
        <>
            <label>Note</label>
            <textarea
                placeholder = {note || "Leave a note for your task"}
                value = {note}
                onChange={(e) => {updateNote(e.target.value)}}
            />
        </>
    )
}


// This component still needs work.
function HighlightBox({color, setColor}){
    return(
        <>  <label> Highlight Color</label>
            <select value={color ? color : null} onChange={ e => { setColor(e.target.value) } }>
                <option value="null"> None </option>
                <option value="blue"> Blue </option>
                <option value="green"> Green </option>  
                <option value="orange"> Orange </option>   
                <option value="pink"> Pink </option>  
            </select>
        </>
    )
}
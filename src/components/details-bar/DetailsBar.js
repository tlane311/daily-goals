import "../../component-styles/details-bar.css";
import {useState} from 'react';

//all props passed from App
//goal is just the text for the goal
//deadline (usually not going to appear)
//note is extra text to go with the goal
//highlight is just the highlighter color
//handleUpdate will update the state in app which will update the db thru the API

export default function DetailsBar({goal, deadline, note, highlight, handleUpdate, visibility}){
    // have to create state for each of the four options
    // have to create state to show when each of the boxes is selected
    // have to set up routine for when to handleUpdate

    return (
        <div
            id="details-bar" 
            className={
                visibility
                    ? "component-shown"
                    : "component-hidden"
            }
        >
            <div className="detail" id="goal-box"> <GoalBox goal={goal}/> </div>
            <div className="detail"> <DeadlineBox deadline={deadline}/> </div>
            <div className="detail" id="note-box"> <NoteBox note={note}/> </div>
            <div className="detail"> <HighlightBox highlight={highlight}/> </div>
        </div>
    )
}


function GoalBox({goal}){
    return (
        <>  
            <label>
                <input type="checkbox" />
                <span
                    className="status-box">
                </span>
                <input type="text" placeholder={goal}/>
            </label>

        </>
    );
}

function DeadlineBox({deadline}){
    return (<>
        <label>Deadline</label>
        <input type="datetime-local" value={deadline}/>
    </>)
}

function NoteBox({note}){
    return(
        <>
            <label>Note</label>
            <textarea value={note} placeholder="Leave a note for your task"/>
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
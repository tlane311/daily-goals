
//all props passed from App
//goal is just the text for the goal
//deadline (usually not going to appear)
//note is extra text to go with the goal
//highlight is just the highlighter color
//handleUpdate will update the state in app which will update the db thru the API

export default function DetailsBar({goal, deadline, note, highlight, handleUpdate}){
    // have to create state for each of the four options
    // have to set up routine for 

    return (
        <div id="details-bar">
            <div className="detail"> {goal} </div>
            <div className="detail"> {deadline} </div>
            <div className="detail"> {note} </div>
            <div className="detail"> {highlight} </div>
        </div>
    )
}
import React, {useState} from 'react';

import Sticky from './sticky/Sticky.js';
import {homeworkColumn, choresColumn} from './dummy-data.js';
import StickiesBar from './stickies-bar/StickiesBar.js';
import DetailsBar from './details-bar/DetailsBar.js';


import useApi from '../hooks/useAPI.js';

//Column-View displays only a few Columns at a time. Columns hold Tasks.
//Individual Column data is help in a database and passed to the child components here.
//Column-View will allow for alternative views: 1.Carousel, 2.Drop Down
//In Column-View, we will be able to add new tasks and create new Columns

export default function App(){
    /*
    Our data will be stored in a db. Ideally, we would like to query the database as few times as possible. If we query once, we will pull an array of columns. When we update these columns, react doesn't rerender; react fails to rerender because of the deeper shape of the array of columns. We introduce an artificial forceUpdate function to force rerenders.
    
    An alternative to this is to have ColumnView pass an id number to each child Column. Then, each Column will query the database for the column data. The downside is we query the database multiple times.
    */
    
    

//
    const {data, response, error, isLoading, fetch} = useApi({
        "method":"GET",
        "url":"localhost:4000/api/me",
        "headers":{
        "content-type":"application/octet-stream",
        "x-rapidapi-host":"currency-exchange.p.rapidapi.com",
        "x-rapidapi-key":"08670f6036msh087f2b8073d8296p1956a9jsn2560793564ed",
        "useQueryString":true
        }
    });
    
    console.log('data',data);
    console.log('response', response);




    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);






    //the columns will come from a db query
    const [stickies, setStickies] = useState([homeworkColumn, choresColumn]);
     
    const [nextID, setNextID] = useState(stickies.length);
    const [newStickyName, setNewStickyName] = useState(""); //this state handles the new column input


    //this function creates a new column data object
    
    const createNewSticky = (name) =>{
        const oldID = nextID;
        setNextID(oldID+1);
        return {
            id:oldID,
            name: name,
            entries: []
        }

    }

    //this callback is for the onClick
    const handleCreateNewSticky = e => {
        if (!newStickyName) return;
        const newSticky = createNewSticky(newStickyName);
        const newStickyArray = stickies.concat(newSticky);
        setStickies(newStickyArray);
        setNewStickyName("");
    }


    //this method updates state whenever you add a new entry
    const updateEntries = (columnID,data)=>{
        if (!data) return;
        const newEntries = stickies[columnID].entries.concat({
            name:data,
            completed:false
        })
        const updatedSticky = stickies[columnID];
        updatedSticky.entries = newEntries;
        
        const newStickies = stickies;
        newStickies[columnID] = updatedSticky;
        setStickies(newStickies);
        forceUpdate(); //necessary for react to rerender
    }
    const updateTask = (columnID, taskID, newStatus)=>{
        const newStickies = stickies;
        newStickies[columnID].entries[taskID].completed=newStatus
        setStickies(newStickies);
        forceUpdate();
    }
    //asd
    const deleteTask = (columnID, taskID)=>{
        const newStickies = stickies
        newStickies[columnID].entries= newStickies[columnID].entries.filter( (element,index) => index!==taskID);
        setStickies(newStickies);
        forceUpdate();
    }

    const deleteSticky = (columnID) =>{
        const newStickies = stickies;
        setStickies(newStickies.filter( (ele, index) => index!==columnID))
    }

    return(
        <>
            <StickiesBar listOfStickies={["Today", "Important", "Goals", "Chores"]} visibility={1}/>
            
            {stickies.filter( (ele, index) => index===0).map((column,index) => 
                    <Sticky
                        name={column.name} 
                        id={index}
                        entries={column.entries} 
                        updateEntries={updateEntries}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                        deleteColumn={deleteSticky}
                    />)}
            {/* <input type="text" value={newStickyName} onChange={ e => {
                setNewStickyName(e.target.value);
            }}/>
            
            <button onClick={handleCreateNewSticky}> Create New Column </button>
            */}
            <DetailsBar goal={'test'} visibility={1}/>
        </>

    )
}
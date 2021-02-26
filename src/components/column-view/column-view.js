import React, {useState} from 'react';

import Column from '../column/column.js';
import {homeworkColumn, choresColumn} from '../dummy-data.js';

//Column-View displays only a few Columns at a time. Columns hold Tasks.
//Individual Column data is help in a database and passed to the child components here.
//Column-View will allow for alternative views: 1.Carousel, 2.Drop Down
//In Column-View, we will be able to add new tasks and create new Columns

export default function ColumnView(){
    /*
    Our data will be stored in a db. Ideally, we would like to query the database as few times as possible. If we query once, we will pull an array of columns. When we update these columns, react doesn't rerender; react fails to rerender because of the deeper shape of the array of columns. We introduce an artificial forceUpdate function to force rerenders.
    
    An alternative to this is to have ColumnView pass an id number to each child Column. Then, each Column will query the database for the column data. The downside is we query the database multiple times.
    */
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);


    //the columns will come from a db query
    const [columns, setColumns] = useState([homeworkColumn, choresColumn]);
     
    const [nextID, setNextID] = useState(columns.length);
    const [newColumnName, setNewColumnName] = useState(""); //this state handles the new column input


    //this function creates a new column data object
    
    const createNewColumn = (name) =>{
        const oldID = nextID;
        setNextID(oldID+1);
        return {
            id:oldID,
            name: name,
            entries: []
        }

    }

    //this callback is for the onClick
    const handleCreateNewColumn = e => {
        if (!newColumnName) return;
        const newColumn = createNewColumn(newColumnName);
        const newColumnsArray = columns.concat(newColumn);
        setColumns(newColumnsArray);
        setNewColumnName("");
    }


    //this method updates state whenever you add a new entry
    const updateEntries = (columnID,data)=>{
        if (!data) return;
        const newEntries = columns[columnID].entries.concat({
            name:data,
            completed:false
        })
        const updatedColumn = columns[columnID];
        updatedColumn.entries = newEntries;
        
        const newColumns = columns;
        newColumns[columnID] = updatedColumn;
        setColumns(newColumns);
        forceUpdate(); //necessary for react to rerender
    }
    const updateTask = (columnID, taskID, newStatus)=>{
        const newColumns = columns;
        newColumns[columnID].entries[taskID].completed=newStatus
        setColumns(newColumns);
        forceUpdate();
    }
    //asd
    const deleteTask = (columnID, taskID)=>{
        const newColumns = columns
        newColumns[columnID].entries= newColumns[columnID].entries.filter( (element,index) => index!==taskID);
        setColumns(newColumns);
        forceUpdate();
    }

    const deleteColumn = (columnID) =>{
        const newColumns = columns;
        setColumns(newColumns.filter( (ele, index) => index!==columnID))
    }

    return(
        <>
            <div id="view">
                {columns.map((column,index) => 
                    <Column
                        name={column.name} 
                        id={index}
                        entries={column.entries} 
                        updateEntries={updateEntries}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                        deleteColumn={deleteColumn}
                    />)}
            </div>
            <input type="text" value={newColumnName} onChange={ e => {
                setNewColumnName(e.target.value);
            }}/>
            <button onClick={handleCreateNewColumn}> Create New Column </button>
        </>

    )
}
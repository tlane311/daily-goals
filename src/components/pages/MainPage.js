import React, {useState} from 'react';


import Sticky from '../sticky/Sticky.js';
import StickiesBar from '../stickies-bar/StickiesBar.js';
import DetailsBar from '../details-bar/DetailsBar.js';




/*
    MainPage holds the current sticky, the details-bar and the stickies-bar.

    MainPage will receieve lists, selectedList and goals from App.

    MainPage serves to pass on the info to its children.

    updateApp will force the main app fetch data again. We call this when we make changes to db.
*/


export default function MainPage({token, lists, selectedList, goals, updateApp}){
    

    /*
    Our data will be stored in a db. Ideally, we would like to query the database as few times as possible. If we query once, we will pull an array of columns. When we update these columns, react doesn't rerender; react fails to rerender because of the deeper shape of the array of columns. We introduce an artificial forceUpdate function to force rerenders.
    */

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const currentSelection = lists.length  //currentSelection if defined is a listId
        ? selectedList || lists[0]['list_id']
        : selectedList;
    const currentList = lists.length
        ? lists.find( list => list['list_id'] === currentSelection )
        : { 'list_name': 'New List', 'order_number': 1}

    const [currentSticky, setCurrentSticky] = useState(currentList);

    const listIndex = lists.length 
        ? lists.findIndex(list => list['list_id'] === currentSelection )
        : 0;
    const goalsForCurrentSticky = currentSelection
    ? goals[listIndex]
    : [];

    const [currentGoals, setCurrentGoals] = useState(goalsForCurrentSticky);
    
    return(
        <>
            <StickiesBar
                token={token}
                lists={lists}
                selectedList={selectedList}
                visibility={1}
                updateApp={updateApp}
            />
                       
            <Sticky
                token={token}
                theList={currentSticky}
                theGoals={currentGoals}
                updateApp={updateApp}
            />
             {/*
             <input type="text" value={newStickyName} onChange={ e => {
                setNewStickyName(e.target.value);
            }}/>
            ["Today", "Important", "Goals", "Chores"]
            <button onClick={handleCreateNewSticky}> Create New Column </button>
            */}
            <DetailsBar goal={'test'} goals={goals} visibility={1}/>
        </>
    )
}



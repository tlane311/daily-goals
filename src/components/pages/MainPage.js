import React, {useState, useEffect} from 'react';


import Sticky from '../sticky/Sticky.js';
import StickiesBar from '../stickies-bar/StickiesBar.js';
import DetailsBar from '../details-bar/DetailsBar.js';




/*
    MainPage holds the current sticky, the details-bar and the stickies-bar.

    MainPage will receieve lists, selectedList and goals from App.

    MainPage serves to pass on the info to its children.

    updateApp will force the main app fetch data again. We call this when we make changes to db.

    I need to update selectedList to be a local storage thing
*/


const blankList = { 'list_name': undefined, 'order_number': undefined}

export default function MainPage({token, lists, selectedList, setSelectedList, goals, updateApp}){
    

    /*
    Our data will be stored in a db. Ideally, we would like to query the database as few times as possible. If we query once, we will pull an array of columns. When we update these columns, react doesn't rerender; react fails to rerender because of the deeper shape of the array of columns. We introduce an artificial forceUpdate function to force rerenders.
    */

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);


    // first we flatten
    const [allGoals, setAllGoals] = useState(goals.flat());

    useEffect( () => {
        setAllGoals(goals.flat());
    }, [goals,lists])
 

    // the current list might be undefined
    const [currentList, setCurrentList] = useState(lists.find(list => list['list_id'] === selectedList) || blankList );

    useEffect( () => {
        setCurrentList( lists.find(list => list['list_id'] === selectedList )|| blankList);
    }, [selectedList, lists]);

    const [currentGoals, setCurrentGoals] = useState(allGoals.filter( goal => goal['list_id']===selectedList));
 
    useEffect( () => {
        setCurrentGoals(allGoals.filter( goal => goal['list_id']===selectedList));
    }, [selectedList, allGoals, token])

    const [goalSelected, setGoalSelected] = useState(null);
    
    return(
        <>
            <StickiesBar
                token={token}
                lists={lists}
                selectedList={selectedList}
                setSelectedList={setSelectedList}
                visibility={true}
                updateApp={updateApp}
            />
                       
            <Sticky
                token={token}
                theList={currentList}
                theGoals={currentGoals}
                setGoalSelected={setGoalSelected}
                updateApp={updateApp}
            />

            <DetailsBar 
                token={token}
                goals={goals}
                goalSelected={goalSelected}
                setGoalSelected={setGoalSelected}
                visibility={true}
                updateApp={updateApp}
            />
        </>
    )
}



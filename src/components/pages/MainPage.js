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


const blankList = { 'list_name': 'Create a New List', 'order_number': undefined}

export default function MainPage({token, lists, selectedList, setSelectedList, goals, updateApp, updateGoals, updateLists}){

    
    /*
    Our data will be stored in a db. Ideally, we would like to query the database as few times as possible. If we query once, we will pull an array of columns. When we update these columns, react doesn't rerender; react fails to rerender because of the deeper shape of the array of columns. We introduce an artificial forceUpdate function to force rerenders.
    */

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);


    const [allGoals, setAllGoals] = useState( goals ? {...goals} : {});

    useEffect( () => {
        setAllGoals(goals ? {...goals} : {});
    }, [goals,lists])
 

    // the current list might be undefined
    const [currentList, setCurrentList] = useState(lists.find(list => list['list_id'] === selectedList) || blankList );

    // whenever props update, update currentList
    useEffect( () => {
        setCurrentList( lists.find(list => list['list_id'] === selectedList )|| blankList);
    }, [selectedList, lists]);

    const [currentGoals, setCurrentGoals] = useState(allGoals[selectedList]);
 
    // whenever props update, update currentGoals
    useEffect( () => {
        let updatedGoals = {}
        // allGoals has shape: { listId: {goalData}, ... }
        Object.keys(allGoals).map(
            listId => {
                updatedGoals[listId] = {};

                return Object.keys(allGoals[listId]).map( (key) => {
                    let newData = allGoals[listId][key];
                    updatedGoals[listId][key] = Array.isArray(newData) ? [...newData] : newData;
                    return newData;
                });
            }
        )
        setCurrentGoals(updatedGoals[selectedList]);
    }, [selectedList, allGoals])


    // goalSelected will be either null or a goal id.
    const [goalSelected, setGoalSelected] = useState(null);
    
    const [getListDetails, setGetListDetails] = useState(false);

    const [detailsBarIsVisible, setDetailsBarIsVisible] = useState(false);
    const [stickiesBarIsVisible, setStickiesBarIsVisible] = useState(false);

    return(
        <>
            <StickiesBar
                token={token}
                lists={lists}
                selectedList={selectedList}
                setSelectedList={setSelectedList}
                visibility={stickiesBarIsVisible}
                setGetListDetails={setGetListDetails}
                updateApp={updateApp}
                updateLists={updateLists}
            />
                   
            <Sticky
                token={token}
                theList={currentList}
                theGoals={currentGoals}
                goalSelected={goalSelected}
                setGoalSelected={(goalId) => {
                    setGetListDetails(false);
                    setGoalSelected(goalId);
                }}
                getListDetails={getListDetails}
                setGetListDetails={setGetListDetails}
                updateGoals={updateGoals}
                updateLists={updateLists}
                detailsBarIsVisible={detailsBarIsVisible}
                setDetailsBarIsVisible={setDetailsBarIsVisible}
            />
 
            <DetailsBar 
                token={token}
                goals={goals}
                lists={lists}
                selectedList={selectedList}
                goalSelected={goalSelected}
                setGoalSelected={setGoalSelected}
                getListDetails={getListDetails}
                deleteList={() => {console.log('deleteList has not been defined yet in MainPage')}}
                visibility={detailsBarIsVisible}
                setVisibility={setDetailsBarIsVisible}
                updateApp={updateApp}
                updateLists={updateLists}
                updateGoals={updateGoals}
            />   
        </>
    )
}



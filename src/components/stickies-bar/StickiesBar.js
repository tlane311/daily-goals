import '../../component-styles/sticky-nav.css'
import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import listManagement from '../../services/listManagement.js'; // for list services
import userManagement from '../../services/userManagement.js'; // for user services
import OrderButtons from '../task/OrderButtons.js';

// Token is an authentication token. This is necessary to query db.
// lists is an array with all list data: [ {list_id, list_name, order_number}, {...}, ..., {...}]
// selectedList is a list_id for the current selected list. Note, this is stored as a column in the user table in the db.
// We did not pass setSelectedList because userManagement.update will update the db which will get passed to the app on the next db query.
// visibility is a boolean
// updateApp is a callback to force the app to rerender.
// updateLists is a callback to force app to rerender.


export default function StickiesBar({ token, lists, selectedList, setSelectedList, visibility, setDetailsBarIsVisible, updateLists }) {
    const [sortedLists, setSortedLists] = useState(lists) // This will be sorted in an effect.
    // ordering lists
    useEffect( () => {
        const asyncEffect = async () => {

            const repeatsExist = containsRepeats(lists.map(list => list['order_number']));

            const gapsExist = lists.filter( list => list['order_number'] >= lists.length).length;
            // If no gaps exist, then every element has order number less than the length.
            // If there are no repeats and no gaps, then theGoals.data.map(goal => goal['order_number']) = [0,1,2,3, ..., theGoals.length - 1];

            const sortingNeeded = gapsExist || repeatsExist;

            if (sortingNeeded){
                // We order the given list by the order-numbers presented.
                // Then, we will change the order-numbers so that no repeats or gaps exist
                // If we do not first order reliableGoals, then really chaotic reorderings can happen if the user spams the order-buttons.

                const orderedLists = [...lists]; // We order in the next line.
                
                orderedLists.sort( (first,second) => first['order_number'] - second['order_number']);
                // Note, for a compare fn, positive difference means reverse order, nonpositive difference means preserve order
                
                for (let i=0; i < orderedLists.length; i++){
                    await listManagement.update(
                        token,
                        'order_number',
                        i,
                        orderedLists[i]['list_id']
                    )
                }
                return updateLists();
            }

            // If sorting not needed ...
            const sorted = [...lists].sort((first,second) => first['order_number'] - second['order_number']);
            // Note, for a compare fn, positive difference means reverse order, nonpositive difference means preserve order
            setSortedLists(sorted);

        }

        if (token && lists){
            asyncEffect();
        }
    }, [lists])
    
    
    
    const [newList, setNewList] = useState("");

    const [isHidden, setIsHidden] = useState(visibility);

    const handleNewListCreation = (e) => {
        if (!newList) return;
        return listManagement.create(token, newList, sortedLists.length+1).then(updateLists);
    }

    // This function returns an event handler.
    const swapToThisList = id => { // look here at async behavior
        return e => {
            // if user is logged in, update the db
            if (token && id!==selectedList){
                userManagement.update(token, 'selected_List', id)
                .then( (res) => {
                    setDetailsBarIsVisible(false);
                    setSelectedList(id);
                });
            }
        };
    }

    const handleHideBar = e => {
        setIsHidden(!isHidden);
    }

    const handleIncreasePriority = (id) => {
        // We will return an event handler that depends upon the id input

        return e => {
            // Here, we will update the priority in the db and then update the app

            const targetIndex = sortedLists.findIndex( list => list['list_id'] === id);



            // If target is the first element of the array OR for some reason the id is not found
            if (targetIndex<=0) return;

            // Otherwise,

            const previousList = sortedLists[targetIndex - 1] // This is the list that appears right before the target list.

            listManagement.update(token,
                'order_number',
            targetIndex - 1,
            id
            ).then(res => {
                    return listManagement.update(token,
                        'order_number',
                        targetIndex,
                        previousList['list_id']
                    );
                })
            .then( res => {
                return updateLists();
            })
        }


    }

    const handleDecreasePriority = (id) => {

        // We will return an event handler that depends upon the id input

        return e => {
            // Here, we will update the priority in the db and then update the app

            const targetIndex = sortedLists.findIndex( list => list['list_id'] === id);

            // If target is the last element of the array OR for some reason the id is not found
            if (targetIndex===sortedLists.length - 1 || targetIndex<0) return;

            // Otherwise,
            const nextList = sortedLists[targetIndex+1] // This is the list that appears right after the target list.

            listManagement.update(token,
                'order_number',
                targetIndex + 1,
                id
            ).then(res => {
                    return listManagement.update(token,
                        'order_number',
                        targetIndex,
                        nextList['list_id']
                    );
                })
            .then( res => {
                return updateLists();
            })
        }
        

    }

    return(
        <nav id="sticky-nav" className={!isHidden ? "": ' hide-left-bar'}>
            <ul>
                {sortedLists.map( list => {
                    const listName = list['list_name'];
                    return (
                        <li 
                            onClick={swapToThisList(list['list_id'])} 
                            className={list['list_id'] === selectedList ? ' selected-list' : ""}> 
                            <span className="list-name">{list['list_name']}</span>
                            <span className="list-icon">
                                { listName[0].toUpperCase()+listName[1] }
                            </span>
                            <OrderButtons
                                handleIncreasePriority={ handleIncreasePriority( list['list_id'] ) }
                                handleDecreasePriority={ handleDecreasePriority( list['list_id'] ) }
                            />
                        </li>
                    );
                })}

                <span className="new-list">
                    <button onClick={handleNewListCreation}> + </button>
                    <input type="text" placeholder={'New List'} onChange={ e => { return setNewList(e.target.value); }}/>
                </span>
            </ul>

            <div id="redirect-buttons">
                <Link to={token ? "/account":"/login"}> <button> {token ? "Manage Account" : "Login"} </button></Link>
                <Link to={token ? "/":"/register"}> <button> {token ? "Sign Out" : "Register"} </button></Link>
            </div>

            <button id="hide-left-bar-btn" onClick={handleHideBar}/>
        </nav>
    )
}


// Helper function for ordering goals/lists
function containsRepeats(arr){
    if (!Array.isArray(arr)) return undefined;
    
    let newArr = [];

    for (let index =0; index < arr.length; index++){
        if ( newArr.includes(arr[index]) ) { return true;};
        newArr.push(arr[index]);
    }

    return false;
}
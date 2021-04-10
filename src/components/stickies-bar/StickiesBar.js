import '../../component-styles/sticky-nav.css'
import {useState} from 'react';
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


export default function StickiesBar({ token, lists, selectedList, setSelectedList, visibility, updateLists }) {
    const [newList, setNewList] = useState("");

    const [isHidden, setIsHidden] = useState(visibility);

    const handleNewListCreation = (e) => {
        if (!newList) return;
        return listManagement.create(token, newList, lists.length+1).then(updateLists);
    }

    // This function returns an event handler.
    const swapToThisList = id => { // look here at async behavior
        return e => {
            // if user is logged in, update the db
            if (token && id!==selectedList){
                userManagement.update(token, 'selected_List', id)
                .then( (res) => {
                    setSelectedList(id);
                });
            }
        };
    }

    const handleHideBar = e => {
        setIsHidden(!isHidden);
    }

    const handleIncreasePriority = (id) => {
        // Here, we will update the priority in the db and then update the app

        const targetIndex = lists.findIndex( list => list['list_id'] === id);

        // If target is the first element of the array OR for some reason the id is not found
        if (targetIndex<=0) return;

        // Otherwise,

        listManagement.update(token,
            'order_number',
           targetIndex - 1,
           id
        ).then(res => {
                return listManagement.update(token,
                    'order_number',
                    targetIndex,
                    id
                );
            })
        .then( res => {
            return updateLists();
        })
    }

    const handleDecreasePriority = (id) => {
        // Here, we will update the priority in the db and then update the app

        const targetIndex = lists.findIndex( list => list['list_id'] === id);

        // If target is the last element of the array OR for some reason the id is not found
        if (targetIndex===lists.length - 1 || targetIndex<0) return;

        // Otherwise,

        listManagement.update(token,
            'order_number',
           targetIndex - 1,
           id
        ).then(res => {
                return listManagement.update(token,
                    'order_number',
                    targetIndex,
                    id
                );
            })
        .then( res => {
            return updateLists();
        })
    }

    return(
        <nav id="sticky-nav" className={!isHidden ? "": ' hide-left-bar'}>
            <ul>
                {lists.map( list => {
                    return (
                        <li 
                            onClick={swapToThisList(list['list_id'])} 
                            className={list['list_id'] === selectedList ? ' selected-list' : ""}> 
                            <span className="list-name">{list['list_name']}</span>
                            <span className="list-icon">{list['list_name'][0].toUpperCase()+list['list_name'][1]}</span>
                            <OrderButtons
                                handleIncreasePriority={e=>{handleIncreasePriority(list['list_id'])}}
                                handleDecreasePriority={e=>{handleDecreasePriority(list['list_id'])}}
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
                <Link to={token ? "/":"/login"}><button onClick={() => {}}> {token ? "Manage Account" : "Login"} </button></Link>
                <Link to={token ? "/":"/login"}><button onClick={() => {}}> {token ? "Sign Out" : "Register"} </button></Link>
            </div>

            <button id="hide-left-bar-btn" onClick={handleHideBar}/>
        </nav>
    )
}
import '../../component-styles/sticky-nav.css'
import {useState} from 'react';

import listManagement from '../../services/listManagement.js'; // for list services
import userManagement from '../../services/userManagement.js'; // for user services


// Token is an authentication token. This is necessary to query db.
// lists is an array with all list data: [ {list_id, list_name, order_number}, {...}, ..., {...}]
// selectedList is a list_id for the current selected list. Note, this is stored as a column in the user table in the db.
// We did not pass setSelectedList because userManagement.update will update the db which will get passed to the app on the next db query.
// visibility is a boolean
// updateApp is a callback to force the app to rerender.
// updateLists is a callback to force app to rerender.


export default function StickiesBar({ token, lists, selectedList, setSelectedList, visibility, updateApp, updateLists }) {
    const [newList, setNewList] = useState("");

    const [isHidden, setIsHidden] = useState(visibility);

    const handleNewListCreation = (e) => {
        if (!newList) return;
        return listManagement.create(token, newList, lists.length+1).then(res => {updateLists()});
    }

    const swapToThisList = id => { // look here at async behavior
        if (id !== selectedList) return (e) => {
            userManagement.update(token, 'selected_list', id);
            setSelectedList(id);
        }
        return e => {};
    }

    const handleHideBar = e => {
        setIsHidden(!isHidden);
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
                            <span className="list-icon">{list['list_name'][0].toUpperCase()}</span>
                        </li>
                    );
                })}

                <span className="new-list">
                    <button onClick={handleNewListCreation}> + </button>
                    <input type="text" placeholder={'New List'} onChange={ e => { return setNewList(e.target.value); }}/>
                </span>
            </ul>

            <div id="redirect-buttons">
                <button> Manage Account </button>
                <button> Sign Out </button>
            </div>

            <button id="hide-left-bar-btn" onClick={handleHideBar}/>
        </nav>
    )
}
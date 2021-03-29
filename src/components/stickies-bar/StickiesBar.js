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
// swapList is a callback that updates the Sticky component.


export default function StickiesBar({ token, lists, selectedList, visibility, updateApp, swapList }) {
    const [newList, setNewList] = useState("");

    const handleNewListCreation = (e) => {
        listManagement.create(token, newList, lists.length+1);
        updateApp();
    }

    const swapToThisList = id => {
        if (id !== selectedList) return (e) => {
            swapList(lists.find( list => list['list_id'] === id));
            userManagement.update(token, 'selected_list', id);
        }
        return e => {};
    }

    return(
        <nav id="sticky-nav">
            <ul>
                {lists.map( list => {
                    return (<li onClick={swapToThisList(list['list_id'])}> {list['list_name']} </li>)
                })}

                    <span className="new-list">
                        <button onClick={handleNewListCreation}> + </button>
                        <input type="text" placeholder={newList} onChange={ e => { return setNewList(e.target.value); }}/>
                    </span>

            </ul>
        </nav>
    )
}
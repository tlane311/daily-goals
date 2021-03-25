import '../../component-styles/sticky-nav.css'
import {useState} from 'react';

import listManagement from '../../services/listManagement.js';

export default function StickiesBar({ token, lists, selectedList, visibility, updateApp, swapList }) {
    const [newList, setNewList] = useState("");

    const handleNewListCreation = (e) => {
        listManagement.create(token, newList, lists.length+1);
        updateApp();
    }

    const swapToThisList = id => {
        return (e) => {
            swapList(lists.find( list => list['list_id'] === id));
        }
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
import '../../component-styles/sticky-nav.css'
import {useState} from 'react';

export default function StickiesBar({lists, selectedList, visibility, createNewList }) {
    const [newList, setNewList] = useState("");

    return(
        <nav id="sticky-nav">
            <ul>
                {lists.map( list => {
                    return (<li onClick={()=>{}}> {list['list_name']} </li>)
                })}

                    <span className="new-list">
                        <button onClick={() => {}}> + </button>
                        <input type="text" placeholder={newList} onChange={ e => { return setNewList(e.target.value); }}/>
                    </span>

            </ul>
        </nav>
    )
}
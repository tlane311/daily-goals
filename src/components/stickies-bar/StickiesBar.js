import '../../component-styles/sticky-nav.css'
import {useState} from 'react';
//  listOfStickies is an array: ['Sticky1', 'Sticky2', 'Sticky3',...]
//  handleStickySelect is a callback that will update state in App

export default function StickiesBar({listOfStickies, handleStickySelect}) {
    const [newList, setNewList] = useState("");

    return(
        <nav id="sticky-nav">
            <ul>
                {listOfStickies.map( sticky => {
                    return (<li onClick={handleStickySelect}> {sticky} </li>)
                })}

                    <span className="new-list">
                        <button onClick={() => {}}> + </button>
                        <input type="text" placeholder={newList} onChange={ e => { return setNewList(e.target.value); }}/>
                    </span>

            </ul>
        </nav>
    )
}
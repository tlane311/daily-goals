import {useState} from 'react';

import Column from '../column/column.js';
import {homeworkColumn, choresColumn} from '../dummy-data.js';

export default function ColumnView(){
    const [columns, setColumns] = useState([homeworkColumn, choresColumn]);
    const [view, setView] = useState(0);

    return(
        <div id="view">
            {columns.map(column => <Column name={column.name} entries={column.entries}/>)}
        </div>

    )
}
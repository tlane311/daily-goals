import Task from '../../components/task/task.js';

export default function Column({name, entries}){
    return (
        <div className="column">
            <h3> {name} </h3>
            <ul>
            {entries.map(entry => <Task name={entry.name} completed={entry.completed}/>)}
            </ul>            
        </div>
    )
}
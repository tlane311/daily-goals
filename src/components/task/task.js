import '../../styles/task.css';

export default function Task({name, completed}){
    return (
        <li className="task" onClick={() => {}}>
            <span className={completed ? "strikethrough" : ""}>{name}</span>
        </li>
    )
}
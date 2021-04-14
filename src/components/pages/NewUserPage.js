import '../../component-styles/new-user-page.css';

import {useState} from 'react';
import HighlightedText from '../task/HighlightedText.js';

import {Link} from 'react-router-dom';


export default function NewUserPage({setCreateTrialAccount}){
    const handleTrialAccount = e => {
        setCreateTrialAccount(true);
    }
    
    return(
        <div id="new-user-page">
            <div id="center-sticky" className='decoration-sticky'>
                <h1><emph>D</emph>aily <emph>G</emph>oals</h1>
                <PsuedoTask
                    goal={"the app that helps you keep up"}
                    status={false}
                    handleRedirect={e => {}}
                />
            </div>
            <div id="redirect-sticky" className='decoration-sticky'>
                <h1> To Do </h1>
                <div id="redirect-list">
                    <PsuedoTask
                        goal={<Link to="/main" onClick={handleTrialAccount}> Try the app </Link>}
                    /> 
                    
                    <PsuedoTask
                        goal={<Link to="/register">Register</Link>}
                    /> 
                    <PsuedoTask
                        goal={<Link to="/login">Login</Link>}
                    /> 
                </div>

            </div>

            <div id='deco-1' className="decoration-sticky"/>
            <div id='deco-2' className="decoration-sticky"/>
            <div id='deco-3' className="decoration-sticky"/>
            <div id='deco-4' className="decoration-sticky"/>
            <div id='deco-5' className="decoration-sticky"/>

        </div>
    )
}



function PsuedoTask({ goal, status=false, color=null }){
    const [completion, updateCompletion] = useState(status);

    return(
        <li className = "pseudo-task task">
            <label>
                <input data-testid="task-checkbox" type="checkbox" checked={completion} readOnly/>
                <span 
                    className="status-box" 
                    onClick={()=>{ updateCompletion(!completion)}}
                    data-testid="task-status-span"    
                />

                <span 
                    className={(completion ? "strikethrough" : "")+" goal-text"}
                    data-testid="task-goal-span"
                >
                    <HighlightedText text={goal} color={color}/>
                </span>
            </label>
        </li>
    )
}
import {Link} from 'react-router-dom';

export default function NewUserPage({setCreateTrialAccount}){
    
    const handleTrialAccount = e => {
        setCreateTrialAccount(true);
    }
    
    return(
        <>
            <h1>Daily Goals</h1>
            <h4>The app that helps you keep up</h4>
            <Link to="/main" onClick={handleTrialAccount}> Try the app </Link>
            <Link to="/register"> Register </Link>
            <Link to="/login"> Login </Link>
        </>
    )
}
import '../../component-styles/login-page.css';

import Login from '../login/login.js';

import {useHistory, Link} from 'react-router-dom';

export default function LoginPage({updateToken, setCreateTrialAccount}){
    let history = useHistory();
    
    //if auth, updateToken
    const handleResponse = (res) => {
        if (res.data.auth) {
            history.push('/main');
            localStorage.removeItem('trialAccount');
            localStorage.removeItem('trialEmail');
            localStorage.removeItem('trialPassword');
            localStorage.removeItem('trialUsername');
            return updateToken(res.data.token);
        }
    }

    const handleTryTheApp = e => {
        setCreateTrialAccount(true);
    }
    return(
        <div id="login-page">
            <h3> Login</h3>
            <Login 
                loginRoute={"/api/login"} 
                loginIdentifier="username" 
                next={handleResponse}
                handleError={err => {}}
            />
            <Link id="login-to-register" to="/register">New? Create an account.</Link>
            <Link id="login-to-try" to="/main" onClick={handleTryTheApp}>Try the app without making an account</Link>    
        </div>
    )
}
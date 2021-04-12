import '../../component-styles/register-page.css';

import Register from '../register/Register.js';

import {useHistory, Link} from 'react-router-dom';

export default function RegisterPage({updateToken, setCreateTrialAccount}){
    let history = useHistory();

    //if auth, updateToken
    const handleResponse = (res) => {
        if (res.data.auth) {
            history.push('/main');
            return updateToken(res.data.token);
        }
    }

    const handleTryTheApp = e => {
        setCreateTrialAccount(true);
    }

    return(
        <div id="register-page">
            <Register 
                registerRoute={"/api/register"} 
                next={handleResponse}
                handleError={err => {console.log(err)}}
            />
            <Link id="register-to-login" to="/login">Already have an account? Login.</Link>
            <Link id="register-to-try" to="/main" onClick={handleTryTheApp}>Try the app without making an account</Link>    
        </div>
    )
}
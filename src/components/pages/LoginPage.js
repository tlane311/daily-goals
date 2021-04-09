import Login from '../login/login.js';

import {useHistory, Link} from 'react-router-dom';

export default function LoginPage({updateToken}){
    let history = useHistory();
    
    //if auth, updateToken
    const handleResponse = (res) => {
        if (res.data.auth) {
            history.push('/main');
            return updateToken(res.data.token);
        }
    }


    return(
        <>
            <Login 
                loginRoute={"/api/login"} 
                loginIdentifier="username" 
                next={handleResponse}
                handleError={err => {}}
            />
            <Link to="/register">New? Create an account.</Link>
        </>
    )
}
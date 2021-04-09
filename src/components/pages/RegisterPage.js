import Register from '../register/Register.js';

import {useHistory, Link} from 'react-router-dom';

export default function RegisterPage({updateToken}){
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
            <Register 
                registerRoute={"/api/register"} 
                next={handleResponse}
                handleError={err => {console.log(err)}}
            />
            <Link to="/login">Already have an account? Login.</Link>        
        </>
    )
}
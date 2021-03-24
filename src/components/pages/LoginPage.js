import Login from '../login/login.js';

export default function LoginPage(){
    return(
        <Login 
            loginRoute={"/api/login"} 
            loginIdentifier="username" 
            next={req => {}}
            handleError={err => {}}
        />
    )
}
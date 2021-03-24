import {useState} from 'react';
import FormData from 'form-data';
import axios from 'axios';


// login route is the url for the post request
// loginIdentifier is a string e.g. email or username
// next is a callback that takes in the response object and tells axios what to do next
export default function Login({loginRoute, loginIdentifier, next, handleError}){
    
    // We need state for the login credentials so that we may pass that info into our custom form-submission handler.
    const [loginName, setLoginName] = useState("");
    const [loginPassword, setLoginPassword] = useState("")

    const handleSubmit = (e) => {

        e.preventDefault(); // This stops the browser from handling the form on its own.

        const form = new FormData();
        form.append(loginIdentifier, loginName);
        form.append('password', loginPassword);

        //reseting the password
        setLoginPassword("");
        const config = {
            method: 'post',
            url: loginRoute,
            data: form,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }

        try {
        axios(config)
            .then( next )
        } catch (e) {
            handleError(e);
        }
    }
  
  
  
    return (
        <form id="login" onSubmit={handleSubmit}>
            <label for={loginIdentifier}></label>
            <input type="text" required placeholder={loginIdentifier} name={loginIdentifier} onChange={ e => {return setLoginName(e.target.value)} }></input>

            <label for="password"></label>
            <input type="password" value={loginPassword} required placeholder="password" name="password" onChange={ e => {return setLoginPassword(e.target.value)} }></input>

            <label for="remember-me"> Remember Me </label>
            <input type="checkbox" name="remember-me" />

            <button type="submit"> Login </button>
        </form>
    );
}
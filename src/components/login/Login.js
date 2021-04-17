import {useEffect, useState} from 'react';
import useLocalStorage from '../../hooks/useLocalStorage.js'
import FormData from 'form-data';
import axios from 'axios';

import userManagement from '../../services/userManagement.js';


// login route is the url for the post request
// loginIdentifier is a string e.g. email or username. In this app, it is set to 'username'
// next is a callback that takes in the response object and tells axios what to do next
// handleError is a callback that tkes in the error object and tells axios what to do next
export default function Login({loginRoute, loginIdentifier, next, handleError}){

    // We use local storage for the "Remember Me" feature.
    const [store, addItem, removeItem, clearStore] = useLocalStorage();


    
    // We need state for the login credentials so that we may pass that info into our custom form-submission handler.
    const [loginName, setLoginName] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");


    // When this component first loads, it will check to see if localStorage has stored login info.
    // If so, this useEffect will automatically update the state.
    useEffect( ()=> {
        const storedId = localStorage[loginIdentifier]
        if (storedId){
            setRememberMe(true);
            setLoginName(storedId);
        }
    }, []);

    const handleRememberMe = e => {
        return setRememberMe(e.target.checked);
    }

    const handleSubmit = async e => {

        e.preventDefault(); // This stops the browser from handling the form on its own.

        // Add loginName to localStorage if "Remember Me" box is checked.
        if (rememberMe) {
            localStorage.setItem(loginIdentifier, loginName);
        }
        try{
            const response = await userManagement.login(loginName,loginPassword);
            //reseting the password
            setLoginPassword("");
            next(response);
        } catch(e) {
            if (!e.response.data.auth) {
                setError('Bad credentials');
            } else {
                setError('There was an error with login.');
            }
        }
    }

    
  
  
    return (
        <form id="login" onSubmit={handleSubmit}>
            <label for={loginIdentifier}></label>
            <input 
                type="text"
                value={loginName}
                required 
                placeholder={loginIdentifier} 
                name={loginIdentifier} 
                onChange={ e => {return setLoginName(e.target.value)} }
            />

            <label for="password"></label>
            <input 
                type="password" 
                value={loginPassword} 
                required 
                placeholder="password" 
                name="password" 
                onChange={ e => {return setLoginPassword(e.target.value)} }
            />
            <label className='remember-me' for="remember-me">
                Remember Me
                <input 
                    type="checkbox" 
                    name="remember-me" 
                    onChange={handleRememberMe}
                    checked={rememberMe}
                />
            </label>

            <button type="submit"> Login </button>
            {error ? <p id="login-error"> {error} </p> : null }
            
        </form>
    );
}
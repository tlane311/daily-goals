import {useEffect, useState} from 'react';
import useLocalStorage from '../../hooks/useLocalStorage.js'
import FormData from 'form-data';
import axios from 'axios';


// login route is the url for the post request
// loginIdentifier is a string e.g. email or username
// next is a callback that takes in the response object and tells axios what to do next
// handleError is a callback that tkes in the error object and tells axios what to do next
export default function Login({loginRoute, loginIdentifier, next, handleError}){

    // We use local storage for the "Remember Me" feature.
    const [store, addItem, removeItem, clearStore] = useLocalStorage();


    
    // We need state for the login credentials so that we may pass that info into our custom form-submission handler.
    const [loginName, setLoginName] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);


    // When this component first loads, it will check to see if localStorage has stored login info.
    // If so, useEffect will automatically update the state.
    useEffect( ()=> {
        if (store[loginIdentifier]){
            setRememberMe(true);
            setLoginName(store[loginIdentifier]);
        }
    }, []);

    const handleRememberMe = e => {
        return setRememberMe(e.target.checked);
    }

    const handleSubmit = (e) => {

        e.preventDefault(); // This stops the browser from handling the form on its own.

        // Add loginName to localStorage if "Remember Me" box is checked.
        if (rememberMe) {
            addItem(loginIdentifier, loginName);
        } else { // Otherwise, clear local storage.
            clearStore();
        }

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

            <label for="remember-me"> Remember Me </label>
            <input 
                type="checkbox" 
                name="remember-me" 
                onChange={handleRememberMe}
                checked={rememberMe}
            />

            <button type="submit"> Login </button>
        </form>
    );
}
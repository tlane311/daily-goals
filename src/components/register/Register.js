import {useState} from 'react';
import FormData from 'form-data';
import axios from 'axios';


// register route is the url for the post request
// registerIdentifier is a string e.g. email or username
// next is a callback that takes in the response object and tells axios what to do next
// handleError is a callback that tkes in the error object and tells axios what to do next
export default function Register({registerRoute, next, handleError}){
   
    // We need state for the register credentials so that we may pass that info into our custom form-submission handler.
    const [registerName, setRegisterName] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");

    const handleSubmit = (e) => {

        e.preventDefault(); // This stops the browser from handling the form on its own.

        const form = new FormData();
        form.append('username', registerName);
        form.append('password', registerPassword);
        form.append('email', registerEmail);

        //reseting the password
        setRegisterPassword("");
        const config = {
            method: 'post',
            url: registerRoute,
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
        <form id="register" onSubmit={handleSubmit}>

            <FormInput
                name={'username'}
                placeholder={'username'}
                type={'text'}
                isRequired={true}
                value={registerName}
                handleChange={e => {return setRegisterName(e.target.value)}}
            />

            <FormInput
                name={'email'}
                placeholder={'email'}
                type={'email'}
                isRequired={true}
                value={registerEmail}
                handleChange={e => {return setRegisterEmail(e.target.value)}}
            />

            <FormInput
                name={'password'}
                placeholder={'password'}
                type={'password'}
                isRequired={true}
                value={registerPassword}
                handleChange={e => {return setRegisterPassword(e.target.value)}}
            />

            <button type="submit"> Register </button>
        </form>
    );
}

function FormInput({name, placeholder, type, isRequired, handleChange, value}){

    return(
        <>
            <label for={name}/>
            <input
                name={name}
                placeholder={placeholder}
                type={type}
                required={isRequired}
                value={value}
                onChange={e => {
                        handleChange(e);
                        return; 
                    }
                }
            />
        </>
    )
}
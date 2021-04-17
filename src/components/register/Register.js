import {useState} from 'react';
import userManagement from '../../services/userManagement.js'
import listManagement from '../../services/listManagement.js'



// register route is the url for the post request
// registerIdentifier is a string e.g. email or username
// next is a callback that takes in the response object and tells axios what to do next
// handleError is a callback that tkes in the error object and tells axios what to do next
export default function Register({next}){
   
    // We need state for the register credentials so that we may pass that info into our custom form-submission handler.
    const [registerName, setRegisterName] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [error, setError] = useState("")

    const handleSubmit = async e => {

        e.preventDefault(); // This stops the browser from attempting to handle the form on its own.
        try{
            const response = await userManagement.create(registerName, registerPassword, registerEmail);
            const token = response.data.token;
            


            //cleaning up state
            setRegisterPassword("");

            await listManagement.create(token, 'Today', 1);
            await listManagement.create(token, 'Important', 2);
            await listManagement.create(token, 'Goals', 3);
            
            next(response);

        } catch(e) {
            if (e.response.data.error.errno === 1062) {
                setError('Username or email is already in use.')
            } else {
                setError('There was an error with registration.');
            }
        }
        
    }

    return (
        <>
            <h3> Create A New Account </h3>
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
                {error ? <p id="registration-error"> {error} </p> : null}
            </form>
        </>
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
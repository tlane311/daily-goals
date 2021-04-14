import '../../component-styles/account-page.css';

import {useState} from 'react';
import userManagement from '../../services/userManagement.js';

export default function AccountMgmtPage(){
    const [updatingEmail, setUpdatingEmail] = useState(false);
    const [updatingUsername, setUpdatingUsername] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleAccountDeletion = e => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        // add this later
    }

    const handleUpdatingEmail = async (updatedData, username, password) => {
        const res = await userManagement.login(username,password);
        const token = res.data.token;

        await userManagement.update(token, 'email', updatedData);
    }
    const handleUpdatingUsername = async (updatedData, username, password) => {
        const res = await userManagement.login(username,password);
        const token = res.data.token;

        await userManagement.update(token, 'username', updatedData);
    }
    const handleUpdatingPassword = async (updatedData, username, password) => {
        const res = await userManagement.login(username,password);
        const token = res.data.token;

        await userManagement.update(token, 'password', updatedData);
    }

    return(
        <div id="account-page">
            <h3> Manage your account </h3>
            <div id="account-actions-container">
                <button onClick={ () => { setUpdatingEmail(!updatingEmail) } }> 
                    {!updatingEmail ? 'Update Email' : 'Nevermind'} 
                </button>
                {
                    updatingEmail ? <Form placeholder='email' handleUpdate={handleUpdatingEmail} /> : null
                }
                <button onClick={ () => { setUpdatingUsername(!updatingUsername) } }> 
                    {!updatingUsername ? 'Update Username' : 'Nevermind'}
                </button>
                {
                    updatingUsername ? <Form placeholder='username' handleUpdate={handleUpdatingUsername}/> : null
                }
                <button onClick={ () => { setUpdatingPassword(!updatingPassword) } }>
                    {!updatingPassword ? 'Update Password' : 'Nevermind'}
                </button>
                {
                    updatingPassword ? <Form placeholder='password' handleUpdate={handleUpdatingPassword}/> : null
                }
                <button onClick={ handleAccountDeletion} >
                    Delete Account
                </button>
                { confirmDelete ? <p> Deleting your account is irreversible. Are you sure? </p> : null }
                { confirmDelete ? <button onClick={ handleAccountDeletion }> Confirm Delete </button> : null }
            </div>

        </div>
    )
}

function Form({placeholder, handleUpdate}){
    const [updatedData, setUpdatedData] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = e => {
        const config = { updatedData, username, password };
        return handleUpdate(config);
    }
    return(
        <form className='account-mgmt-form'>
            <label>
                <input type='text' placeholder={"new " + placeholder} onChange={e => {setUpdatedData(e.target.value)}}></input>
            </label>
            <label>
                <input type='text' placeholder="username" onChange={ e => {setUsername(e.target.value)} }></input>
            </label>
            <label>
                <input type='password' placeholder="password" onChange={e => {setPassword(e.target.value)}}></input>
            </label>
            <button onClick = {handleSubmit}> Update </button>
        </form>
    );
}
import React, {useState} from 'react';

import MainPage from './pages/MainPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';

import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';


export default function App(){
    /*
        When one logs in, the token will be stored in this component
        Then, main page can use the token to get user data
    */
   // Note, use local storage for token
    const [token, setToken] = useState(null);

    const updateToken = (token) => {
        return setToken(token);
    }

    return(
        <>
            <Router>
                <div>{token ? 'token stored' : 'no token'}</div>
                <Switch>
                    <Route exact path="/">
                        <MainPage loginToken={token}/>
                    </Route>
                    <Route exact path="/login">
                        <LoginPage updateToken={updateToken}/>
                    </Route>
                    <Route exact path="/register">
                        <RegisterPage updateToken={updateToken}/>
                    </Route>
                </Switch>
            </Router>



        </>

    )
}
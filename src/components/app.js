import React, {useState} from 'react';

import Register from './register/Register.js';

import MainPage from './pages/MainPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';

import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import axios from 'axios';


import useApi from '../hooks/useAPI.js';

//Column-View displays only a few Columns at a time. Columns hold Tasks.
//Individual Column data is help in a database and passed to the child components here.
//Column-View will allow for alternative views: 1.Carousel, 2.Drop Down
//In Column-View, we will be able to add new tasks and create new Columns

export default function App(){

    return(
        <>
            <Router>
                <Switch>
                    <Route exact path="/">
                        <MainPage/>
                    </Route>
                    <Route exact path="/login">
                        <LoginPage/>
                    </Route>
                    <Route exact path="/register">
                        <RegisterPage/>
                    </Route>
                </Switch>

            </Router>



        </>

    )
}
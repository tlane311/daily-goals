import express from "express";
import multer from 'multer';
import path from 'path';
//import bodyParser from "body-parser";
//importing our controllers
import GoalsController from './controllers/goals/GoalsController.js';
import AuthController from "./controllers/auth/AuthController.js";
import ListController from './controllers/lists/ListsController.js';
//dotenv helps us with environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const app = express(); //creates express server
const upload = multer();


//global middleware
app.use(express.json()); //tells express how to read json
app.use(express.urlencoded({ extended: false })); //restricts urlencoded so that the values can only be string or array
app.use(upload.none()); //this allows us to parse form data
app.use(express.static('../build'));

const port = process.env.PORT || process.env.SERVERPORT || 0; 

//if the server receives a get request at '/', it will send back a string
//if we were going to make a real website, we would instead serve something else
app.get("/", (req,res)=>{
    return res.sendFile('index.html',{root: path.join('../','/build')});
});





//tell express server which server to listen on


//this controller is for user CRUD
app.use('/api', AuthController);
//this controller is for goal CRUD
app.use('/api/goals', GoalsController);
//this controller is for list CRUD
app.use('/api/lists', ListController);

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    return res.sendFile('index.html',{root: path.join('../','/build')});
});

if(process.env.NODE_ENV !=='test'){
    app.listen(port, () => {
        console.log(`Express Server is up and running on port ${port}.`);
    });
}

export default app;
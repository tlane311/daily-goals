import express from "express";
//import bodyParser from "body-parser";
//importing our controllers
import GoalsController from './controllers/goals/GoalsController.js';
import AuthController from "./controllers/auth/AuthController.js";
import ListController from './controllers/lists/ListsController.js';
//dotenv helps us with environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express(); //creates express server

app.use(express.json()); //necessary to read req.body
app.use(express.urlencoded({ extended: false })); //restricts urlencoded so that the values can only be string or array

app.use(express.static('../build'));

const port = process.env.PORT || 0; 

//if the server receives a get request at '/', it will send back a string
//if we were going to make a real website, we would instead serve something else
app.get("/", (req,res)=>{
    return express.static('../build');
});

//this route is just for testing purposes
app.get('/test', (req, res)=> {
    return res.json({message: "tested"});
})


//tell express server which server to listen on
if(process.env.NODE_ENV !=='test'){
    app.listen(port, () => {
        console.log(`Express Server is up and running on port ${port}.`);
    });
}


//this controller is for user CRUD
app.use('/api', AuthController);
//this controller is for goal CRUD
app.use('/api/goals', GoalsController);
//this controller is for list CRUD
app.use('/api/lists', ListController);

export default app;
import mysql from 'mysql'; //mysql driver
import dotenv from 'dotenv'
dotenv.config()

//we are going to use a connection pool for better performance
//the connection pool allows to have X many connections sitting on standby
//this means we don't have to directly connect to the database as many times

const poolConfig = { //config data
    connectionLimit : 100,      //max number of connections
    host: 'localhost',          //address
    user: process.env.DBUSER,               //login data
    password: process.env.DBPW,    //login data
    database: 'daily_goals',    //database name
}



//we are creating a promise here to export and use all of ours routes
//Promises are eager so it is created the first time this code is run (not sure: either on server start or whenever the first route is called)
export const poolPromise = new Promise( (resolve, reject) => {
    const pool = mysql.createPool(poolConfig);
    
    pool.getConnection( (err, connection) => {
        if (err) reject(err);   // failure throws err
        resolve(connection);    // resolve returns connection object which can be then queried
                                // e.g.
                                // const pool = await poolPromise
                                // pool.query('SELECT * FROM table1', (err, results) => {//do stuff})
    })
})
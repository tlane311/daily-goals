import mysql from 'mysql'; //mysql driver
import dotenv from 'dotenv'
dotenv.config({path: '../.env'})

//we are going to use a connection pool for better performance
//the connection pool allows to have X many connections sitting on standby
//this means we don't have to directly connect to the database as many times

const poolConfig = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE,
    connectionLimit: 15, //this is set by our db
}



//we are creating a promise here to export and use in all of ours routes
//promises are eager so it is created the first time this code is run
export const poolPromise = new Promise( (resolve, reject) => {
    console.log('poolPromise tried', process.env.SECRET ? 'defined' : 'undefined')
    try{
        const pool = mysql.createPool(poolConfig);
        resolve(pool);
    } catch (e){
        console.log(e.message, e.error)
    }

});
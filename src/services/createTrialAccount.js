import userManagement from './userManagement.js';
import listManagement from './listManagement.js';

// This function will create a trial account with randomly generated (insecure) credentials.
// This function returns the authentication token from successful user creation.


export default async function createTrialAccount(){

    // We need to generate random usernames and emails
    // Date.now() returns the number of milliseconds since Jan 1, 1970
    // Math.random*(1 mil) gives us a 'random' number between 0 and 1 mil.
    // We concantenate these two numbers and convert to a string.
    // For two users to generate the same trial account, they would have to register at the exact same millisecond
    // and generate the same 'random' number between 1000000.
    // A rough estimate is that you would need over 1 mil users to make a trial account at the same millisecond to generate a duplicate.

    const username = `${Date.now()}${Math.random()*1000000}`
    const email = username+'@';
    const password = username;
    try{
        // create the user
        const response = await userManagement.create(username, password, email);
        // grab the authentication
        const token = response.data.token;

        // label this account as a trial account
        await userManagement.update(token, 'trial', 1);
    
        // creating some starter lists
        await listManagement.create(token, 'Today', 1);
        await listManagement.create(token, 'Important', 2);
        await listManagement.create(token, 'Goals', 3);
        
        localStorage.setItem('trialUsername', username);
        localStorage.setItem('trialEmail', email);
        localStorage.setItem('trialPassword', password);
        return token;
    } catch(err) {
        console.log(err);
        return false;
    }
}
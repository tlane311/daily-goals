import Register from '../register/Register.js';

export default function RegisterPage(){
    return(
        <Register 
            registerRoute={"/api/register"} 
            next={res => {console.log(res)}}
            handleError={err => {console.log(err)}}
        />        
    )
}
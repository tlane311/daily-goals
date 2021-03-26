import {useEffect, useState} from 'react';


export default function useKeyDown(targetKey){
    const [keyDown, setKeyDown] = useState(false);
 
    const callback = ({ key }) => {
        if (key === targetKey) {
            setKeyDown(true);
            setTimeout( () => {setKeyDown(false)}, 500); 
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', callback);
        return () => {window.removeEventListener('keydown', callback)}
    },[]);
    
    return keyDown
}
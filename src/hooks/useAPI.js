import {useEffect, useState} from 'react';
import axios from 'axios';
import hash from 'hash-object';
const CancelToken = axios.CancelToken;


//this hook will allow us so streamline interacting with a rest api

/*
returns
    result, response, error, isLoading, fetch
*/

export default function useRestAPI(config, initialFetch=true){
    console.log('useApi ran')
    const [state, updateState] = useState({
        response: undefined,
        error: undefined,
        isLoading: true
    })

    const configHash = hash(config);

    const source = CancelToken.source();

    function fetch(){
        axios({
            ...config, 
            cancelToken: source.token,
            })
        .then( res => {
            updateState({ error: undefined, response: res, isLoading: false});
        })
        .catch( err => {
            if (axios.isCancel(err)){
                console.log('Request canceled by cleanup: ', err.message);
            } else {
                updateState({error: err, response: undefined, isLoading: false});
            }
        });
    }

    useEffect( () => {
        updateState({...state, isLoading: true});

        if (initialFetch){
            fetch();
        }

        return () => {
            source.cancel('useEffect cleanup.');
        }

    }, [configHash]);

    const { response, error, isLoading} = state;

    const data = response ? response.data : undefined;
    return { data, response, error, isLoading, fetch };
}
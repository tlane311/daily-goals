import {useEffect, useState} from 'react';
import axios from 'axios';
import hash from 'hash-object';
const CancelToken = axios.CancelToken;


//this hook will allow us so streamline interacting with a rest api

/*
returns
    result, response, error, isLoading, fetch
*/

export default function useAPI(config, initialFetch=true){
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

/*

    const config = {
        "method":"post",
        "url":"api/login",
        "headers":{
        "Content-Type":"application/json",
        "useQueryString":true,
        'rejectUnauthorized': false,
        },
        data: {
            'username': 'tlane',
            'password': 'some_password'
        }
    }
    



    const getData = async () => {
        try{
            return await axios(config)
            .then( (res) => {
                console.log('response',res);
            })
        } catch (e) {
            console.log('error', e)
        }
    }

    getData();

*/
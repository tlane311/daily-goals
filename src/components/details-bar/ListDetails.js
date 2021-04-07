import {useEffect, useState} from 'react';
import listManagement from '../../services/listManagement.js';


// This component is a child of DetailsBar that is shown whenever the user wants to rename a list.

// NOTES ON PROPS PASSED TO THIS COMPONENT

// token is set in App and used as credentials to make db queries
// lists is set in App and has shape [ {list_id, list_name, order_number}, {list_id, list_name, order_number}, ...]
// list data has shape { list_id, list_name, order_number }
// selectedList is a list_id (i.e. positive number) which is defined in Main Page
// updateLists is a synchronous function defined in App. This function forces App to query the db for all list info. Note, this fn is not async.
// setVisibility is a setter defined in DetailsBar. If visiblity is truthy, then detailsbar is shown and also the inverse of that statement.
// deleteList is defined in MainPage and handles deleting a list. Because we are using a relational db, we must delete all goals associated to a list before we delete the list itself.

export default function ListDetails({token, lists, selectedList, updateLists, setVisibility, deleteList}){

    const blankList = { 'list_id': "", 'list_name': "", "order_number": 1 }

    // Note, lists is an array so lists.find() will always return an element of lists or undefined.
    const initialList = lists.find(list => list['list_id'] === selectedList ) || blankList;
    
    // theList is a list object i.e. theList = {list_id, list_name, order_number}
    const [theList, setTheList] = useState(initialList);

    useEffect( () => {
        const nextList = lists.find(list => list['list_id'] === selectedList ) || blankList;
        setTheList(nextList);
    }, [selectedList]);

    const [updatedListName, setUpdatedListName] = useState(theList['list_name'])

    const handleSubmission = async () => {
        if (theList['list_id'] && updatedListName){
            await listManagement.update(token, 'list_name', updatedListName, theList['list_id'])
            updateLists();
            setVisibility(false);
        }
        
    }

    const handleHide = () => {
        setVisibility(false);
    }

    return (
        <>
            <div className="detail" id="list-name-box">
                <input 
                    type="text" 
                    placeholder={theList['list_name']}
                    onChange={(e) => {setUpdatedListName(e.target.value)}}/>
            </div>
            <button onClick={handleSubmission}> Update </button>
            <button onClick={handleHide}> Hide </button>
        </>
    )

}
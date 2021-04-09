const defaultData = {
    username: "",
    email: "",
    selectedList: 'Goals',
    lists: [
        {
            list_id: 'Today',
            list_name: 'Today',
            order_number: '1'
        },
        {
            list_id: 'Important',
            list_name: 'Important',
            order_number: '2'
        },
        {
            list_id: 'Goals',
            list_name: 'Goals',
            order_number: '3'
        }
    ],
    goals:{
        Today: {fetchedOnce: true, data: []},
        Important: {fetchedOnce: true, data: []},
        Goals: {fetchedOnce: true, data: []},
    }
}

export default defaultData;
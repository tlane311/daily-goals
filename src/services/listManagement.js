import axios from 'axios';
import FormData from 'form-data';

const listManagement = {
    create: async (token, listName, orderNumber) => {
        const form = new FormData();
        form.append('listName', listName);
        form.append('orderNumber', orderNumber);
        const config = {
            method:"post",
            url:"/api/lists/new",
            headers: {
                'x-access-token': token,
            },
            data: form
        }
        return axios(config);
    },
    update: async (token, field, fieldData, listId) => {
        const form = new FormData();
        form.append('field',field);
        form.append('fieldData', fieldData);
        form.append('listId', listId);
        const config = {
            method:"put",
            url:"/api/lists/",
            headers: {
                'x-access-token': token,
            },
            data: form
        }
        return axios(config);
    },
    delete: async (token, listId) => {
        const form = new FormData();
        form.append('listId', listId);
        const config = {
            method:"delete",
            url:"/api/lists/",
            headers: {
                'x-access-token': token,
            },
            data: form
        }
        return axios(config);
    },
}

export default listManagement;
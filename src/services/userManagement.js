import axios from 'axios';
import FormData from 'form-data';


const userManagement = {
    create: async (token,username,password,email) => {
        const form = new FormData();
        form.append('username', username);
        form.append('password', password);
        form.append('email',email);

        const config = {
            method: 'post',
            url: '/api/register',
            headers: {
                'x-access-token': token,
            },
            data: form
        }

        return axios(config);
    },
    update: async (token, username, password, field, fieldData) => {
        const form = new FormData();
        form.append('username', username);
        form.append('password', password);
        form.append('field',field);
        form.append('fieldData', fieldData);

        const config = {
            method: 'put',
            url: '/api/update',
            headers: {
                'x-access-token': token,
            },
            data: form
        }

        return axios(config);
    },
    delete: async (token, username, password) => {
        const form = new FormData();
        form.append('username', username);
        form.append('password', password);
        
        const config = {
            method: 'delete',
            url: '/api/delete',
            headers: {
                'x-access-token': token,
            },
            data: form
        }

        return axios(config);
    }
}

export default userManagement;
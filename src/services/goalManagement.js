import axios from 'axios';
import FormData from 'form-data';

const goalManagement = {
    create: async (token, listId, goal, orderNumber) => {
        const form = new FormData();
        form.append('listId', listId)
        form.append('goal', goal);
        form.append('orderNumber', orderNumber);
        const config = {
            method:"post",
            url:"/api/goals/new",
            headers: {
                'x-access-token': token,
            },
            data: { goals: [{listId, goal, orderNumber}] }
        }
        return axios(config);
    },
    update: async (token, goalId, goal, orderNumber, deadline, status, note, color) => {
        const form = new FormData();
        form.append('goalId', goalId);
        form.append('goal', goal);
        form.append('orderNumber', orderNumber);
        form.append('deadline',deadline);
        form.append('status',status);
        form.append('note',note);
        form.append('color',color);

        const config = {
            method:"put",
            url:"/api/goals/",
            headers: {
                'x-access-token': token,
            },
            data: form
        }
        return axios(config);
    },
    delete: async (token, goalId) => {
        const config = {
            method:"delete",
            url:"/api/goals/",
            headers: {
                'x-access-token': token,
            },
            data: [goalId]
        }
        return axios(config);
    },
}

export default goalManagement;
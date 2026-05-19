import axios from 'axios';
//import { Cookies } from 'react-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
//const cookies = new Cookies();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

api.interceptors.request.use(
    (config) => {
        /*
        const token = cookies.get('token'); 

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        */
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
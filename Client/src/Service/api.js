import axios from 'axios';

const Api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    withCredentials: true,
    headers:{
        'Accept': 'application/json'
    }
    
});

export default Api;


import axios from "axios"
const url = import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_BACKEND_URL :  import.meta.env.VITE_LIVE_BACKEND_URL
console.log('ENVIRONMENT:', import.meta.env.MODE);
 const instance = axios.create({
    baseURL: import.meta.env.MODE ? url : import.meta.env.VITE_LIVE_BACKEND_URL ,
 })
 export default instance;
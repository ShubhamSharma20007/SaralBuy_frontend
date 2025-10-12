import axios from "axios"
const url = import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_BACKEND_URL :  import.meta.env.VITE_LIVE_BACKEND_URL
 const instance = axios.create({
    baseURL:url!,
 })
 export default instance;
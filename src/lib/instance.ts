import axios from "axios"
export let url:any;
// url = import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_BACKEND_URL :  import.meta.env.import.meta.env.VITE_LIVE_BACKEND_URL
 url = import.meta.env.VITE_LIVE_BACKEND_URL
console.log(import.meta.env.MODE)
console.log(import.meta.env.DEV)
 const instance = axios.create({
    baseURL: url! ,
 })
 export default instance;
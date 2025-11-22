import axios from "axios"
// const url = import.meta.env.MODE === 'development' ? import.meta.env.VITE_API_BACKEND_URL :  import.meta.env.VITE_LIVE_BACKEND_URL
console.log(import.meta.env.MODE)
console.log(import.meta.env.DEV)
 const instance = axios.create({
    baseURL: import.meta.env.VITE_LIVE_BACKEND_URL ,
 })
 export default instance;
import instance from "@/lib/instance";
export const getLocation =async (lon:number,lat:number)=>{
    try {
        const {data} = await instance.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
    return (data as any)?.address?.city || (data as any)?.address?.state_district || (data as any)?.address?.country
    } catch (error :any) {
        console.log('getting error to fetch location',error?.message || error)
        
    }
} 
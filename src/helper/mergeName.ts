// accept only userId Obj
export const mergeName =(userId:any)=>{
    return `${userId?.firstName} ${userId?.lastName}`
}
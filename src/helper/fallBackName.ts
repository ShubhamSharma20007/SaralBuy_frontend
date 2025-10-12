export const fallBackName = (name: string) => {
    let fallback =''
    if(name){
        name.split(" ").map((name:string)=>{
            fallback += name[0].toUpperCase()
        }
    )
    }else{
        return name // fallback
    }
    return fallback
   
    
}
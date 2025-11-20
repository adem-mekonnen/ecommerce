import { prisma } from "@/lib/prisma";

const authSellers = async(userId)=>{

     const user = await prisma.user.findUnique({
        where : { id : userId },
        include : { store : true }
     });
       if(user?.store){
        if(user.store.status === "approved"){

            return user.store.id
        }
        else{
            throw new Error("Store not approved");
        }
       }

}
export default authSellers;
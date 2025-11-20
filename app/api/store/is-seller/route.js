// authSeller middleware to check if user is already a seller
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import authSellers from "@/middlewares/authSellers";
import { err } from "inngest/types";
// auth seller function to check if user has a store
export async function GET(request){
    try {
        
        // Authenticate
        const { userId } = getAuth(request);
        const isSeller =  await authSellers (userId);
        if(isSeller){
            return NextResponse.json({ isSeller: true }, { status: 200 });
        }
        const stroreInfo = await prisma.store.findUnique({
            where : { userId }
        });
       return NextResponse.json({ isSeller : stroreInfo}, { status: 200 });
    } catch (error) {
        console.error("/api/store/is-seller error:", error);
        return NextResponse.json({ 
            error: error?.message || String(error) }, { status: 500

         });

        
    }


}
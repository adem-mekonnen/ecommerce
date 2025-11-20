// get store info and store products
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export async function GET(request){
    try{
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username").toLocaleLowerCase();
        if(!username){
            return NextResponse.json({ error: "Missing username" }, { status: 400 });
        }
        // get store info and instock products rate
        const store = await prisma.store.findUnique({
            where : { username, isActive : true },
            include : { product : { include : {rating : true}}
            }
        });
       
        if(!store){
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true, store }, { status: 200 });
       
    }
    catch(err){
        console.error("/api/store/data error:", err);
        return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
}
// app/api/store/create/route.js
// Create store API
// toggle stock of any product in the store
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import authSellers from "@/middlewares/authSellers";
export async function POST(request) {
    try {
        // Authenticate
        const { userId } = getAuth(request);
       const {ProductId} = await request.json();
      if(!ProductId){
        return NextResponse.json({ error: "Missing details : ProductId is required" }, { status: 400 });
      }
        const storeId =  await authSellers (userId);
        if(!storeId){
          return NextResponse.json({ error: "Unauthorized, store access denied" }, { status: 401 });
        }
        // fetch product
        const product = await prisma.product.findFirst({
            where: { id: ProductId, storeId },
        }); 
        if (!product) {
            return NextResponse.json({ error: "Product not found in your store" }, { status: 404 });
        }
        // toggle stock
        const updatedProduct = await prisma.product.update({
            where: { id: ProductId },
            data: { inStock: !product.inStock },
        });
        return NextResponse.json({ ok: true, product: updatedProduct }, { status: 200 }); 
       
    } catch (err) {
        console.error("/api/store/toggle-stock error:", err);
        return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
    }
}
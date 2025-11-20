import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";
import path from "path";
import { getAuth } from "@clerk/nextjs/dist/types/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import imagekit from "@/configs/ImageKit";
import authSellers from "@/middlewares/authSellers";

export async function POST(request){

     try {

      // Authenticate
      const { userId } = getAuth(request);
      const storeId =  await authSellers (userId);

      if(!storeId){
        return NextResponse.json({ error: "Unauthorized, store access denied" }, { status: 401 });
      }
    
        // form data to create product in the store

        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = parseFloat(formData.get("price"));
        const image = formData.getAll("images");
        const category = formData.get("category");
        // const stock = parseInt(formData.get("stock"), 10);
        // const sku = formData.get("sku");
        if (!name || !description || !mrp|| isNaN(price) || !image || !category ) {
          return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 });
        }
       // upload image to imagekit
        const imagesUrl = await Promise.all(image.map(async(imgFile) =>
             {

            const buffer = Buffer.from(await imgFile.arrayBuffer());
            const  response = await imagekit.upload({
                file : buffer,
                fileName : imgFile.name,
                folder : "products"

            }
        
        )

        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: [
              {  Quality: "auto"},
                { format: "webp" },
                { width: "1024" },
               
            ]
        })
        return optimizedImage;

    }
    ));
            //optimized image url;
      
             
           

        const newProduct = await prisma.product.create({
          data: {
            storeId,
            name,
            description,
            mrp,
            price,
            image: imagesUrl,
            category,
            
          },
        });
        return NextResponse.json({ ok: true, product: newProduct }, { status: 201 });   
     
    
    
    }catch(err){
    return NextResponse.json({  });
    }
}
// get all products in the for sellers
export async function GET(request){
  try {
    // Authenticate
    const { userId } = getAuth(request);
    const storeId =  await authSellers (userId);
    if(!storeId){
      return NextResponse.json({ error: "Unauthorized, store access denied" }, { status: 401 });
    }
    const products = await prisma.product.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ ok: true, products }, { status: 200 });
  }
    catch (err) {
    return NextResponse.json({  });
  }
}

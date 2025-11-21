import imagekit from "@/configs/ImageKit";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // FIX 1: Import Prisma is required!

// Validate username: letters, numbers, dashes/underscores, 3-30 chars
const USERNAME_REGEX = /^[a-zA-Z0-9-_]{3,30}$/;

async function usernameTaken(username) {
  if (!username) return false;
  const s = await prisma.store.findUnique({ where: { username } });
  return !!s;
}

async function userHasStore(userId) {
  if (!userId) return false;
  // Changed findUnique to findFirst just in case, or findUnique if userId is unique in Store model
  const s = await prisma.store.findFirst({ where: { userId } });
  return !!s;
}

export async function POST(request) {
  try {
    // Authenticate
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Read form data
    const formData = await request.formData();

    const getString = (key) => {
      const v = formData.get(key);
      if (!v || (typeof v === "object" && (v.name || v.size))) return ""; 
      return String(v).trim();
    };

    const name = getString("name");
    const username = getString("username").toLowerCase();
    const description = getString("description");
    const email = getString("email");
    const contact = getString("contact");
    const address = getString("address");
    
    // FIX 2: Get the raw file object properly
    const imageFile = formData.get("image");

    // Basic validation
    if (!name || !username) {
      return NextResponse.json({ error: "Missing required fields: name, username" }, { status: 400 });
    }

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Ensure username is available
    if (await usernameTaken(username)) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Prevent user from creating more than one store
    if (await userHasStore(userId)) {
      return NextResponse.json({ error: "User already owns a store" }, { status: 409 });
    }

    // FIX 3: Image Upload Logic
    let optimizedImage = "";
    
    // Only attempt upload if it is a valid file with size
    if (imageFile && typeof imageFile === 'object' && imageFile.size > 0) {
        try {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            
            const response = await imagekit.upload({
                file : buffer, 
                fileName : `logo-${username}`, // FIX: Use username variable, not image.username
                folder : "logos"
            });
            
            // optimized image url
            optimizedImage = imagekit.url({
               path: response.filePath,
               transformation: [
                 { quality: "80"}, // FIX: Lowercase 'q'
                 { format: "webp" },
                 { width: "512" },
                 { crop: "maintain_ratio" }
               ] 
            });
        } catch (imgErr) {
            console.error("Image upload failed", imgErr);
            // You can decide to throw error here or proceed without image
        }
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        userId, // This creates the relation automatically
        name,
        username,
        description,
        address,
        email,
        contact,
        logo: optimizedImage,
      },
    });

    // FIX 4: Removed the broken prisma.user.update block. 
    // It referenced 'newStore.id' (which didn't exist) and is redundant because 
    // putting 'userId' in the create above already links them.

    return NextResponse.json({ ok: true, store }, { status: 201 });

  } catch (err) {
    console.error("/api/store/create error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// check if the user already has a store
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const store = await prisma.store.findFirst({ where: { userId : userId } });
    
    return NextResponse.json({ hasStore: !!store, store }, { status: 200 });

  } catch (err) {
    console.error("/api/store/create GET error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
import imagekit from "@/configs/ImageKit";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import path from "path";

// Validate username: letters, numbers, dashes/underscores, 3-30 chars
const USERNAME_REGEX = /^[a-zA-Z0-9-_]{3,30}$/;

async function usernameTaken(username) {
  if (!username) return false;
  const s = await prisma.store.findUnique({ where: { username } });
  return !!s;
}

async function userHasStore(userId) {
  if (!userId) return false;
  const s = await prisma.store.findUnique({ where: { userId } });
  return !!s;
}

export async function POST(request) {
  try {
    // Authenticate
    const { userId } = getAuth(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Read form data (preferred) — this works for multipart/form-data and urlencoded
    const formData = await request.formData();

    const getString = (key) => {
      const v = formData.get(key);
      if (v == null) return "";
      // If it's a File/Blob, return empty string — file handling is separate
      if (typeof v === "object" && (v.name || v.size || v.type)) return "";
      return String(v).trim();
    };

    const name = getString("name");
    const username = getString("username").toLowerCase();
    const description = getString("description");
    const email = getString("email");
    const contact = getString("contact");
    const address = getString("address");
    const imageField = formData.get("image");
    const image = typeof imageField === "string" ? imageField : "";

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

    // Prevent user from creating more than one store (schema has userId unique)
    if (await userHasStore(userId)) {
      return NextResponse.json({ error: "User already owns a store" }, { status: 409 });
    }
    // write upload imagekit
    const buffer = Buffer.from(await image.arrayBuffer());
    const  response = await imagekit.upload({
      file : buffer, //required
      fileName : image.username, //required
      folder : "logos"
  });
  // optimized image url
    const optimizedImage = imagekit.url({
       path: response.filePath,
       transformation: [
         {  Quality: "80"},
         { format: "webp" },
         { width: "512" },
         { crop: "maintain_ratio" }

           
         ] 
    })
    // Create store
    const store = await prisma.store.create({
      data: {
        userId,
        name,
        username,
        description,
        address,
        email,
        contact,
        logo: optimizedImage,
      },
    });
    // link user to store
    await prisma.user.update({
      where: { id: userId },
      data: { store : { id : newStore.id} },
    });

    return NextResponse.json({ ok: true, store }, { status: 201 });
  } catch (err) {
    console.error("/api/store/create error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// check if the user already has a store
export async function GET(request) {
  try {
    // Authenticate
    const { userId } = getAuth(request);

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Check if user has a already regisered store
    const store = await prisma.store.findFirst({ where: { userId : userId } });
    if (store) {
      return NextResponse.json({ hasStore: true }, { status: 200 });
    }
    const hasStore = await userHasStore(userId);
    return NextResponse.json({ hasStore }, { status: 200 });
  } catch (err) {
    console.error("/api/store/create GET error:", err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
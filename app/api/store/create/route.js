import imagekit from "@/configs/ImageKit";
import { currentUser } from "@clerk/nextjs/server"; // CHANGED: Use currentUser to get details
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const USERNAME_REGEX = /^[a-zA-Z0-9-_]{3,30}$/;

export async function POST(request) {
  try {
    // 1. Get full user details from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = user.id;

    // ------------------------------------------------------------------
    // FIX: Ensure User exists in Postgres before creating Store
    // ------------------------------------------------------------------
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      console.log("User not found in DB, syncing from Clerk...");
      dbUser = await prisma.user.create({
        data: {
          id: userId,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
          image: user.imageUrl || "",
        },
      });
    }
    // ------------------------------------------------------------------

    const formData = await request.formData();

    const getString = (key) => {
      const v = formData.get(key);
      if (!v || (typeof v === "object" && ("name" in v || "size" in v))) return "";
      return String(v).trim();
    };

    const imageFile = formData.get("image");

    const name = getString("name");
    const username = getString("username").toLowerCase();
    const description = getString("description");
    const email = getString("email");
    const contact = getString("contact");
    const address = getString("address");

    if (!name || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    const existingUsername = await prisma.store.findUnique({ where: { username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const existingUserStore = await prisma.store.findFirst({ where: { userId } });
    if (existingUserStore) {
      return NextResponse.json({ error: "User already owns a store" }, { status: 409 });
    }

    // Image upload
    let optimizedImage = "";
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const response = await imagekit.upload({
          file: buffer,
          fileName: `logo-${username}`,
          folder: "logos",
        });
        optimizedImage = imagekit.url({
          path: response.filePath,
          transformation: [{ quality: "80" }, { format: "webp" }, { width: "500" }],
        });
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
        optimizedImage = ""; // fallback
      }
    }

    // Now safe to create store because dbUser is guaranteed to exist
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

    return NextResponse.json({ ok: true, store }, { status: 201 });
  } catch (err) {
    console.error("/api/store/create error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findFirst({ where: { userId: user.id } });
    return NextResponse.json({ hasStore: !!store, store }, { status: 200 });
  } catch (err) {
    console.error("/api/store GET error:", err);
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
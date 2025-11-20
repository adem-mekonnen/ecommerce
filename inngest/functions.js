import { inngest } from "./client";
import prisma from "@/lib/prisma";

// ---------------------------
// Sync User Created
// ---------------------------
export const syncUserCreation = inngest.createFunction(
  { id: "sync/user-creation", name: "Sync User Creation" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email_addresses?.[0]?.email_address || "",
        name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        image: user.image_url,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
      },
    });
  }
);

// ---------------------------
// Sync User Updated
// ---------------------------
export const syncUserUpdate = inngest.createFunction(
  { id: "sync/user-update", name: "Sync User Update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email_addresses?.[0]?.email_address || "",
        name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        image: user.image_url,
        updatedAt: new Date(user.updated_at),
      },
    });
  }
);

// ---------------------------
// Sync User Deleted
// ---------------------------
export const syncUserDeletion = inngest.createFunction(
  { id: "sync/user-deletion", name: "Sync User Deletion" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const user = event.data;

    await prisma.user.delete({
      where: { id: user.id },
    });
  }
);

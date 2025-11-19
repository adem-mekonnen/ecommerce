import { inngest } from "./client";
import { Clerk } from "@clerk/clerk-sdk-node";
import prisma from "@/lib/prisma";

// write inngest functions to save user data
export const syncUserCreation = inngest.createFunction(
  {id : "sync/user-creation", name: "Sync User Creation" },
  { event: "clerk/user.created" },
  async ({ event }) => {

    const {data} = event;
     await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0]?.email_address || "",
        name : `{data.first_name} ${data.last_name}`,
        image : data.image_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      },
    });
   
  }
  

);
// write inngest functions to update user data 
export const syncUserUpdate = inngest.createFunction(
  {id : "sync/user-update", name: "Sync User Update" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const {data} = event;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0]?.email_address || "",
        name : `${data.first_name} ${data.last_name}`,
        image : data.image_url,
        updatedAt: new Date(data.updated_at),
      },
    });
  }
  );

// write inngest functions to delete user data
export const syncUserDeletion = inngest.createFunction(
  {id : "sync/user-deletion", name: "Sync User Deletion" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const {data} = event;
    await prisma.user.delete({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0]?.email_address || "",
        name : `${data.first_name} ${data.last_name}`,
        image : data.image_url,
        updatedAt: new Date(data.updated_at),
      },

    });
  }
  );
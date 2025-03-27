"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import driveService from "../services/drive_service";
import folderService from "../services/folder_service";

export const getAllFolders = async () => {
  try {
    const folders = await folderService.findMany();
    return folders;
  } catch (error) {
    console.error(error);
  }
};

export const createRootFolder = async () => {
  const user = await currentUser();

  try {
    if (!user) throw new Error("Not autorized");
    const root = await driveService.getRootFolder();
    if (!root.id) throw new Error("Root folder not found");
    const folderExists = await folderService.findByGoogleId(root.id);
    if (folderExists) return folderExists;

    const folder = await folderService.upsert({
      description: "Main folder of the project.",
      userClerkId: user.id,
      googleId: root.id,
      title: "Root",
      isRoot: true,
    });

    return folder;
  } catch (error) {
    console.error(error);
  }
};

export const createNewFolder = async (payload: {
  title: string;
  description?: string;
  parentId?: number;
}) => {
  let driveId = "";
  const schema = z.object({
    title: z.string().trim(),
    parentId: z.coerce.number().optional(),
    description: z.string().optional(),
  });
  const user = await currentUser();

  try {
    if (!user) throw new Error("Not authorized");
    const valid = schema.parse(payload);

    const folderId = valid?.parentId
      ? (await folderService.findById(valid?.parentId))?.googleId
      : (await driveService.getRootFolder()).id;

    if (!folderId) throw new Error("Failed to retrieve FolderID");

    const driveFolder = await driveService.createFolder({
      description: valid.description,
      title: valid.title,
      folderId,
    });
    if (!driveFolder.id) throw new Error("Folder GoogleId not found");
    driveId = driveFolder.id;

    await folderService.upsert({
      description: valid.description,
      title: valid.title,
      googleId: driveFolder.id,
      userClerkId: user.id,
      parent: { connect: { googleId: folderId } },
    });

    revalidatePath("/");
    revalidatePath("/folder/:id", "page");
  } catch (error) {
    await driveService.deleteItem(driveId);
    console.error(error);
  }
};

export const editFolder = async (payload: {
  id: number;
  title: string;
  description?: string;
}) => {
  const schema = z.object({
    id: z.coerce.number().min(1),
    title: z.string().trim(),
    description: z.string().optional(),
  });
  const user = await currentUser();

  try {
    if (!user) throw new Error("Not authorized");
    const valid = schema.parse(payload);

    const newFolder = await folderService.update(valid.id, {
      description: valid.description,
      title: valid.title,
    });

    await driveService.renameItem(newFolder.googleId, payload.title);

    revalidatePath("/");
    revalidatePath("/folder/:id", "page");
  } catch (error) {
    console.error(error);
  }
};

export const deleteFolder = async (id: number) => {
  const user = await currentUser();

  try {
    if (!user) throw new Error("Not authorized");
    const deletedFolder = await folderService.delete(id);
    await driveService.deleteItem(deletedFolder.googleId);

    revalidatePath("/");
    revalidatePath("/folder/:id", "page");
  } catch (error) {
    console.error(error);
  }
};

export const searchFolder = async (query: string) => {
  try {
    const results = await folderService.search(query);
    return results;
  } catch (error) {
    console.error(error);
  }
};

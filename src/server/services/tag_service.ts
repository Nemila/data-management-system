"server only";

import type { Prisma } from "@prisma/client";
import { db } from "../db";

class TagService {
  /**
   * Get all tags
   * @param where Fields to find the tags by
   * @returns List of tags
   */
  findMany = async (where?: Prisma.TagWhereInput) => {
    try {
      const tags = await db.tag.findMany({
        orderBy: { createdAt: "desc" },
        where,
      });
      return tags;
    } catch (error) {
      console.error(error);
      throw Error((error as Error).message);
    }
  };

  /**
   * Upsert data
   * @param insertData Data to upsert a new tag
   * @returns Upserted Tag
   */
  upsert = async (insertData: Prisma.TagCreateInput) => {
    try {
      const tag = await db.tag.upsert({
        where: { name: insertData.name },
        create: insertData,
        update: insertData,
      });
      return tag;
    } catch (error) {
      console.error(error);
      throw Error((error as Error).message);
    }
  };
}

const tagService = new TagService();
export default tagService;

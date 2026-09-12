"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { media } from "@/db/schema";
import { deleteBlob } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth/session";

async function assertAuthenticated() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

export async function deleteMedia(id: string) {
  await assertAuthenticated();
  const db = getDb();

  const [record] = await db.select().from(media).where(eq(media.id, id));
  if (!record) return;

  await deleteBlob(record.pathname);
  await db.delete(media).where(eq(media.id, id));

  revalidatePath("/admin/media");
}

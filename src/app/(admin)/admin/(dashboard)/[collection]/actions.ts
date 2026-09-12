"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCollection } from "@/collections";
import { getDb } from "@/db";
import { items } from "@/db/schema";
import { buildItemFormSchema, type ItemFormValues } from "@/lib/validation";
import { isAuthenticated } from "@/lib/auth/session";

async function assertAuthenticated() {
  if (!(await isAuthenticated())) {
    throw new Error("Unauthorized");
  }
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

export async function createItem(collectionSlug: string, values: ItemFormValues) {
  await assertAuthenticated();
  const collection = requireCollection(collectionSlug);
  const parsed = buildItemFormSchema(collection).parse(values);
  const db = getDb();

  try {
    await db.insert(items).values({
      collectionSlug,
      slug: parsed.slug,
      data: parsed.data,
      status: parsed.status,
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "An item with this slug already exists in this collection." };
    }
    throw err;
  }

  revalidatePath(`/admin/${collectionSlug}`);
  redirect(`/admin/${collectionSlug}`);
}

export async function updateItem(
  collectionSlug: string,
  id: string,
  values: ItemFormValues
) {
  await assertAuthenticated();
  const collection = requireCollection(collectionSlug);
  const parsed = buildItemFormSchema(collection).parse(values);
  const db = getDb();

  try {
    await db
      .update(items)
      .set({
        slug: parsed.slug,
        data: parsed.data,
        status: parsed.status,
        updatedAt: new Date(),
      })
      .where(and(eq(items.id, id), eq(items.collectionSlug, collectionSlug)));
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "An item with this slug already exists in this collection." };
    }
    throw err;
  }

  revalidatePath(`/admin/${collectionSlug}`);
  redirect(`/admin/${collectionSlug}`);
}

export async function deleteItem(collectionSlug: string, id: string) {
  await assertAuthenticated();
  const db = getDb();
  await db
    .delete(items)
    .where(and(eq(items.id, id), eq(items.collectionSlug, collectionSlug)));
  revalidatePath(`/admin/${collectionSlug}`);
}

export async function togglePublish(
  collectionSlug: string,
  id: string,
  nextStatus: "draft" | "published"
) {
  await assertAuthenticated();
  const db = getDb();
  await db
    .update(items)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(eq(items.id, id), eq(items.collectionSlug, collectionSlug)));
  revalidatePath(`/admin/${collectionSlug}`);
}

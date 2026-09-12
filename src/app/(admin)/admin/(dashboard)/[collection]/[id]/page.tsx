import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { getCollection } from "@/collections";
import { getDb } from "@/db";
import { items, media } from "@/db/schema";
import { DynamicForm } from "@/components/admin/dynamic-form";
import type { ItemFormValues } from "@/lib/validation";
import { updateItem } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ collection: string; id: string }>;
}) {
  const { collection: collectionSlug, id } = await params;
  const collection = getCollection(collectionSlug);
  if (!collection) notFound();

  const db = getDb();
  const [item] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, id), eq(items.collectionSlug, collectionSlug)));
  if (!item) notFound();

  const mediaItems = await db.select().from(media).orderBy(desc(media.uploadedAt));

  const initialValues: ItemFormValues = {
    slug: item.slug,
    status: item.status as "draft" | "published",
    data: item.data as ItemFormValues["data"],
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit {collection.label}</h1>
      <DynamicForm
        collection={collection}
        initialValues={initialValues}
        mediaItems={mediaItems}
        onSubmit={updateItem.bind(null, collectionSlug, id)}
        submitLabel="Save changes"
      />
    </div>
  );
}

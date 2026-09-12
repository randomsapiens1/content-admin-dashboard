import { notFound } from "next/navigation";
import { getCollection } from "@/collections";
import { getDb } from "@/db";
import { media } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DynamicForm } from "@/components/admin/dynamic-form";
import { createItem } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewItemPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection: collectionSlug } = await params;
  const collection = getCollection(collectionSlug);
  if (!collection) notFound();

  const db = getDb();
  const mediaItems = await db.select().from(media).orderBy(desc(media.uploadedAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New {collection.label}</h1>
      <DynamicForm
        collection={collection}
        mediaItems={mediaItems}
        onSubmit={createItem.bind(null, collectionSlug)}
        submitLabel="Create"
      />
    </div>
  );
}

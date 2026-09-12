import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { media } from "@/db/schema";
import { MediaUploader } from "@/components/admin/media-uploader";
import { MediaGrid } from "@/components/admin/media-grid";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const db = getDb();
  const items = await db.select().from(media).orderBy(desc(media.uploadedAt));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Media</h1>
      <MediaUploader />
      <MediaGrid items={items} />
    </div>
  );
}

import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { items, media } from "@/db/schema";
import { collections } from "@/collections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const db = getDb();

  const counts = await Promise.all(
    collections.map(async (collection) => {
      const [total] = await db
        .select({ value: count() })
        .from(items)
        .where(eq(items.collectionSlug, collection.slug));
      const [published] = await db
        .select({ value: count() })
        .from(items)
        .where(
          and(
            eq(items.collectionSlug, collection.slug),
            eq(items.status, "published")
          )
        );
      return {
        collection,
        total: total?.value ?? 0,
        published: published?.value ?? 0,
      };
    })
  );

  const recentMedia = await db
    .select()
    .from(media)
    .orderBy(desc(media.uploadedAt))
    .limit(5);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {counts.map(({ collection, total, published }) => (
          <Link key={collection.slug} href={`/admin/${collection.slug}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{collection.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {total} item{total === 1 ? "" : "s"} · {published} published
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent media</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMedia.length === 0 ? (
            <p className="text-sm text-muted-foreground">No uploads yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {recentMedia.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="truncate">{item.filename}</span>
                  <span className="text-muted-foreground">
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

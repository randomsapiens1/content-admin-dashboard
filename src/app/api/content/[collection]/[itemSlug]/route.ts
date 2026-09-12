import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCollection } from "@/collections";
import { getDb } from "@/db";
import { items } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collection: string; itemSlug: string }> }
) {
  const { collection: collectionSlug, itemSlug } = await params;
  const collection = getCollection(collectionSlug);
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const db = getDb();
  const [item] = await db
    .select({
      slug: items.slug,
      data: items.data,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
    })
    .from(items)
    .where(
      and(
        eq(items.collectionSlug, collectionSlug),
        eq(items.slug, itemSlug),
        eq(items.status, "published")
      )
    );

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}

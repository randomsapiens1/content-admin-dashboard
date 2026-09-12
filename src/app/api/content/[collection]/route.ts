import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { getCollection } from "@/collections";
import { getDb } from "@/db";
import { items } from "@/db/schema";

const PAGE_SIZE = 50;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection: collectionSlug } = await params;
  const collection = getCollection(collectionSlug);
  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const db = getDb();
  const rows = await db
    .select({
      slug: items.slug,
      data: items.data,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
    })
    .from(items)
    .where(and(eq(items.collectionSlug, collectionSlug), eq(items.status, "published")))
    .orderBy(desc(items.updatedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return NextResponse.json(
    { items: rows, page },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
  );
}

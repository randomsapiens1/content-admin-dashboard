import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, ilike, or, sql } from "drizzle-orm";
import { getCollection } from "@/collections";
import { getDb } from "@/db";
import { items } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemTable } from "@/components/admin/item-table";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function CollectionListPage({
  params,
  searchParams,
}: {
  params: Promise<{ collection: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { collection: collectionSlug } = await params;
  const collection = getCollection(collectionSlug);
  if (!collection) notFound();

  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const db = getDb();
  const whereClause = q
    ? and(
        sql`${items.collectionSlug} = ${collectionSlug}`,
        or(ilike(items.slug, `%${q}%`), sql`${items.data}::text ILIKE ${`%${q}%`}`)
      )
    : sql`${items.collectionSlug} = ${collectionSlug}`;

  const rows = await db
    .select()
    .from(items)
    .where(whereClause)
    .orderBy(desc(items.updatedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{collection.label}</h1>
        <Button render={<Link href={`/admin/${collectionSlug}/new`} />}>
          New {collection.label.replace(/s$/, "")}
        </Button>
      </div>

      <form className="max-w-sm">
        <Input type="search" name="q" placeholder="Search..." defaultValue={q} />
      </form>

      <ItemTable
        collectionSlug={collectionSlug}
        titleField={collection.titleField}
        items={rows}
      />

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Page {page}</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              className="underline"
              href={`/admin/${collectionSlug}?${new URLSearchParams({ q, page: String(page - 1) })}`}
            >
              Previous
            </Link>
          )}
          {rows.length === PAGE_SIZE && (
            <Link
              className="underline"
              href={`/admin/${collectionSlug}?${new URLSearchParams({ q, page: String(page + 1) })}`}
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

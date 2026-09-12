import { getDb } from "../src/db";
import { items } from "../src/db/schema";

async function main() {
  const db = getDb();

  await db.insert(items).values([
    {
      collectionSlug: "posts",
      slug: "hello-world",
      status: "published",
      data: {
        title: "Hello World",
        excerpt: "The first post in this collection.",
        body: "This is a sample post created by the seed script. Edit or delete it from /admin/posts.",
        category: "Announcements",
        featured: true,
      },
    },
    {
      collectionSlug: "posts",
      slug: "draft-example",
      status: "draft",
      data: {
        title: "Draft Example",
        excerpt: "A draft that won't show up in the public API.",
        body: "Draft items are only visible in the admin dashboard.",
        category: "Guides",
        featured: false,
      },
    },
  ]);

  console.log("Seeded sample posts.");
}

main().then(() => process.exit(0));

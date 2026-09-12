import type { CollectionConfig } from "./types";
import { postsCollection } from "./posts.config";

/**
 * The full set of content collections for this project. Add or remove
 * entries here to change what shows up in the admin dashboard and what
 * the public content API serves.
 */
export const collections: CollectionConfig[] = [postsCollection];

const registry = new Map(collections.map((c) => [c.slug, c]));

export function getCollection(slug: string): CollectionConfig | undefined {
  return registry.get(slug);
}

export function requireCollection(slug: string): CollectionConfig {
  const collection = getCollection(slug);
  if (!collection) {
    throw new Error(`Unknown collection: ${slug}`);
  }
  return collection;
}

export type { CollectionConfig, FieldDef, FieldType } from "./types";

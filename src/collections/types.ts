export type FieldType =
  | "text"
  | "richtext"
  | "number"
  | "boolean"
  | "date"
  | "image"
  | "select";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Options for the 'select' field type. */
  options?: string[];
  helpText?: string;
}

export interface CollectionConfig {
  /** URL-safe identifier, used in routes and the DB (e.g. "posts"). */
  slug: string;
  /** Plural display name shown in the admin nav (e.g. "Posts"). */
  label: string;
  fields: FieldDef[];
  /**
   * Name of the field used to auto-generate an item's slug (e.g. "title").
   * If omitted, the item's id is used as its slug.
   */
  titleField?: string;
}

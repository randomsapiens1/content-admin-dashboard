import { z } from "zod";
import type { CollectionConfig, FieldDef } from "@/collections/types";

function schemaForField(field: FieldDef): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "number":
      schema = z.coerce.number();
      break;
    case "boolean":
      schema = z.coerce.boolean();
      break;
    case "date":
      schema = z.string().min(1, "Required");
      break;
    case "select":
      schema = field.options?.length
        ? z.enum(field.options as [string, ...string[]])
        : z.string();
      break;
    case "text":
    case "richtext":
    case "image":
    default:
      schema = z.string();
      break;
  }

  if (field.type === "boolean") {
    return schema;
  }

  if (!field.required) {
    if (field.type === "text" || field.type === "richtext" || field.type === "image") {
      return schema.optional().or(z.literal(""));
    }
    return schema.optional();
  }

  if (field.type === "text" || field.type === "richtext" || field.type === "image") {
    return (schema as z.ZodString).min(1, `${field.label} is required`);
  }

  return schema;
}

/** Builds a zod object schema for an item's `data` payload from its collection's field definitions. */
export function buildItemDataSchema(collection: CollectionConfig) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of collection.fields) {
    shape[field.name] = schemaForField(field);
  }
  return z.object(shape);
}

export const itemMetaSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  status: z.enum(["draft", "published"]),
});

export function buildItemFormSchema(collection: CollectionConfig) {
  return itemMetaSchema.extend({
    data: buildItemDataSchema(collection),
  });
}

export type ItemFormValues = z.infer<ReturnType<typeof buildItemFormSchema>>;

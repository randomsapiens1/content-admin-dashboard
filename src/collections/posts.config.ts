import type { CollectionConfig } from "./types";

/**
 * Example collection. Delete or edit this when adapting the template
 * to a new project — this is the file consumers of the template customize.
 */
export const postsCollection: CollectionConfig = {
  slug: "posts",
  label: "Posts",
  titleField: "title",
  fields: [
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "excerpt",
      label: "Excerpt",
      type: "text",
      helpText: "Short summary shown in listings.",
    },
    { name: "body", label: "Body", type: "richtext", required: true },
    { name: "coverImage", label: "Cover Image", type: "image" },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: ["News", "Guides", "Announcements"],
    },
    { name: "featured", label: "Featured", type: "boolean" },
    { name: "publishDate", label: "Publish Date", type: "date" },
  ],
};

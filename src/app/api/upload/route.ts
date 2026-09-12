import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { media } from "@/db/schema";
import { uploadBlob } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const blob = await uploadBlob(file.name, file);
  const db = getDb();

  const [record] = await db
    .insert(media)
    .values({
      blobUrl: blob.url,
      pathname: blob.pathname,
      filename: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
    })
    .returning();

  return NextResponse.json(record, { status: 201 });
}

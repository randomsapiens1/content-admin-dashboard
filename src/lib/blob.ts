import "server-only";
import { put, del } from "@vercel/blob";

export async function uploadBlob(filename: string, file: File | Blob) {
  return put(filename, file, {
    access: "public",
    addRandomSuffix: true,
  });
}

export async function deleteBlob(pathname: string) {
  await del(pathname);
}

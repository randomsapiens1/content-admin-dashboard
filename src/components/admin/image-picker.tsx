"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Media } from "@/db/schema";

export function ImagePicker({
  value,
  onChange,
  mediaItems,
}: {
  value: string;
  onChange: (url: string) => void;
  mediaItems: Media[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-md border">
          <Image src={value} alt="" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
          No image
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
          {value ? "Change image" : "Select image"}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select an image</DialogTitle>
          </DialogHeader>
          {mediaItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No media uploaded yet. Upload images from the Media library
              first.
            </p>
          ) : (
            <div className="grid max-h-96 grid-cols-4 gap-3 overflow-y-auto">
              {mediaItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="relative aspect-square overflow-hidden rounded-md border hover:ring-2 hover:ring-ring"
                  onClick={() => {
                    onChange(item.blobUrl);
                    setOpen(false);
                  }}
                >
                  <Image
                    src={item.blobUrl}
                    alt={item.filename}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => onChange("")}
        >
          Remove
        </Button>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteItem, togglePublish } from "@/app/(admin)/admin/(dashboard)/[collection]/actions";
import type { Item } from "@/db/schema";

export function ItemTable({
  collectionSlug,
  titleField,
  items,
}: {
  collectionSlug: string;
  titleField?: string;
  items: Item[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleTogglePublish(item: Item) {
    setPendingId(item.id);
    startTransition(async () => {
      await togglePublish(
        collectionSlug,
        item.id,
        item.status === "published" ? "draft" : "published"
      );
      setPendingId(null);
    });
  }

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await deleteItem(collectionSlug, id);
      toast.success("Item deleted");
      setPendingId(null);
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No items yet. Create your first one.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const data = item.data as Record<string, unknown>;
          const title = titleField ? String(data[titleField] ?? item.slug) : item.slug;
          const busy = isPending && pendingId === item.id;

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{title}</TableCell>
              <TableCell className="text-muted-foreground">{item.slug}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.status === "published"}
                    disabled={busy}
                    onCheckedChange={() => handleTogglePublish(item)}
                  />
                  <Badge variant={item.status === "published" ? "default" : "secondary"}>
                    {item.status}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(item.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  render={<Link href={`/admin/${collectionSlug}/${item.id}`} />}
                  variant="outline"
                  size="sm"
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="destructive" size="sm" disabled={busy} />}
                  >
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This can&apos;t be undone. &ldquo;{title}&rdquo; will be permanently
                        deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

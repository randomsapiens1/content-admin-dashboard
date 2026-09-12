"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { CollectionConfig } from "@/collections";

export function SidebarNav({
  collections,
  siteName,
}: {
  collections: CollectionConfig[];
  siteName: string;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    ...collections.map((c) => ({ href: `/admin/${c.slug}`, label: c.label })),
    { href: "/admin/media", label: "Media" },
  ];

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-4 border-r bg-muted/30 p-4">
      <div className="px-2 text-lg font-semibold">{siteName}</div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted",
                active && "bg-muted"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <form action="/api/auth/logout" method="POST" className="mt-auto">
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Sign out
        </Button>
      </form>
    </aside>
  );
}

import Link from "next/link";
import { branding } from "@/lib/branding";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">{branding.siteName}</h1>
      <p className="max-w-md text-muted-foreground">
        A self-hosted, config-driven admin dashboard. Define your content
        collections in <code>src/collections</code>, then manage entries and
        media from the dashboard.
      </p>
      <Button render={<Link href="/admin" />}>Go to dashboard</Button>
    </div>
  );
}

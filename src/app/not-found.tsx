import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="rounded-full bg-muted p-6">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Page not found
          </h1>
          <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
            Sorry, we couldn&#39;t find the page you&#39;re looking for.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/">
            Go back home
          </Link>
        </Button>
      </div>
    </div>
  );
}

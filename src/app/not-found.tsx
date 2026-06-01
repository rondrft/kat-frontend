import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold text-kat">404</h1>
      <p className="text-muted-foreground">Esta página no existe en Kat.</p>
      <Button asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}

import Link from "next/link";
import { UI } from "@/lib/texts";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-10 text-center">
      <p className="text-lg">Aquesta pàgina no existeix.</p>
      <Link href="/" className="min-h-tap text-accent dark:text-accent-dark">
        {UI.final.inici}
      </Link>
    </div>
  );
}

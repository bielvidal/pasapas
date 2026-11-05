import Link from "next/link";
import { UI } from "@/lib/texts";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 py-10 text-center">
      <p className="text-lg">{UI.noExisteix}</p>
      <Link href="/" className="link min-h-tap">
        {UI.final.inici}
      </Link>
    </div>
  );
}

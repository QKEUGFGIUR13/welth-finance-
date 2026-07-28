import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] pt-28 px-4 text-center">
      <p className="font-display text-7xl text-pine/30" style={{ fontWeight: 700 }}>
        404
      </p>
      <h1 className="mt-2 font-display text-2xl text-ink" style={{ fontWeight: 700 }}>
        Page not found
      </h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        That route doesn’t exist. Head back and keep your books in order.
      </p>
      <Link
        to="/"
        className="mt-6 text-pine font-semibold hover:underline underline-offset-4"
      >
        Back to Welth
      </Link>
    </div>
  );
}

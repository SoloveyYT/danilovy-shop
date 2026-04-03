import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold text-ink">404</h1>
      <p className="mt-4 text-muted">Страница не найдена.</p>
      <Link href="/" className="mt-8 inline-block link-underline">
        На главную
      </Link>
    </div>
  );
}

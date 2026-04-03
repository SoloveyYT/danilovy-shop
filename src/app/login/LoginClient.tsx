"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account/orders";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(typeof data.error === "string" ? data.error : "Ошибка входа");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setErr("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink">Вход</h1>
      <form onSubmit={onSubmit} className="card-jewel mt-8 space-y-4 p-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
          />
        </div>
        {err && <p className="text-sm text-red-700">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-ink py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
        <p className="text-center text-sm text-muted">
          Нет аккаунта?{" "}
          <Link href="/register" className="link-underline">
            Регистрация
          </Link>
        </p>
      </form>
    </div>
  );
}

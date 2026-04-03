"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const body = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      message: String(fd.get("message") || ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setStatus("err");
        setMsg("Проверьте поля формы.");
        return;
      }
      setStatus("ok");
      setMsg("Сообщение отправлено. Мы свяжемся с вами.");
      e.currentTarget.reset();
    } catch {
      setStatus("err");
      setMsg("Ошибка сети. Попробуйте позже.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-jewel mt-6 space-y-4 p-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-ink">
          Имя
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-ink">
          Телефон (необязательно)
        </label>
        <input
          id="phone"
          name="phone"
          className="mt-1 w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          Сообщение
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-sm border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
      >
        {status === "loading" ? "Отправка…" : "Отправить"}
      </button>
      {msg && (
        <p className={`text-sm ${status === "ok" ? "text-green-800" : "text-red-700"}`}>{msg}</p>
      )}
    </form>
  );
}

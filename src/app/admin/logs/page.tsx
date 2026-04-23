"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdmin } from "@/lib/admin-fetch";

type LogRow = {
  id: string;
  userId: string;
  email: string;
  action: string;
  meta: unknown;
  createdAt: string;
};

function formatMeta(meta: unknown): string {
  if (meta == null) return "—";
  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdmin("/api/admin/logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Журнал</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Действия администраторов: изменения каталога, настроек, заказов и загрузки файлов. Показаны последние
        записи.
      </p>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={load}
          className="rounded-sm border border-stone-300 px-4 py-2 text-sm text-ink hover:bg-stone-50"
        >
          Обновить
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-muted">Загрузка…</p>
      ) : logs.length === 0 ? (
        <p className="mt-8 text-muted">Пока нет записей — после сохранения изменений в админке они появятся здесь.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-stone-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Время</th>
                <th className="px-3 py-2 font-medium">Кто</th>
                <th className="px-3 py-2 font-medium">Действие</th>
                <th className="px-3 py-2 font-medium">Детали</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id} className="border-b border-stone-100 last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted">
                    {new Date(row.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="max-w-[180px] px-3 py-2 text-xs">
                    <span className="break-all text-ink">{row.email}</span>
                  </td>
                  <td className="px-3 py-2 font-medium text-ink">{row.action}</td>
                  <td className="max-w-md px-3 py-2 font-mono text-xs text-muted">
                    <span className="break-all">{formatMeta(row.meta)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

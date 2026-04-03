import { Suspense } from "react";
import { OrdersClient } from "./OrdersClient";

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-16 text-muted">Загрузка…</div>}>
      <OrdersClient />
    </Suspense>
  );
}

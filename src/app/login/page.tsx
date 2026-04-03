import { Suspense } from "react";
import { LoginClient } from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 py-16 text-muted">Загрузка…</div>}>
      <LoginClient />
    </Suspense>
  );
}

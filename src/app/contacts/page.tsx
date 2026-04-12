import type { Metadata } from "next";
import { SHOP_NAME } from "@/lib/constants";
import { getPublicSettings } from "@/lib/settings";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Контакты",
};

export default async function ContactsPage() {
  const s = await getPublicSettings();
  const yandexMapsOpenUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(`${SHOP_NAME}, ${s.address}`)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink">Контакты</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Запишитесь на приём по телефону или оставьте сообщение — мы ответим в рабочее время.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <div className="card-jewel p-6">
            <h2 className="font-display text-xl font-semibold text-ink">Адрес</h2>
            <p className="mt-3 text-muted">{s.address}</p>
            <h2 className="font-display mt-8 text-xl font-semibold text-ink">Телефон</h2>
            <p className="mt-3">
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="text-lg font-medium text-ink link-underline">
                {s.phone}
              </a>
            </p>
            <h2 className="font-display mt-8 text-xl font-semibold text-ink">График</h2>
            <ul className="mt-3 space-y-1 text-muted">
              {s.scheduleLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-ink">Как добраться</h2>
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-sm border border-stone-200 bg-stone-100">
              <iframe
                title="Карта — Ювелирная мастерская Даниловых"
                src={s.yandexMapEmbedUrl}
                width="100%"
                height="100%"
                className="h-full min-h-[280px] w-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="mt-3 text-sm">
              <a
                href={yandexMapsOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline underline-offset-2 hover:no-underline"
              >
                Открыть карту в Яндекс.Картах в новой вкладке
              </a>
            </p>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Если внутри рамки открывается ваш сайт с ошибкой 404 — в настройках мастерской в поле карты должен быть
              полный адрес, начиная с <span className="font-mono">https://</span> (скопируйте из Яндекса целиком).
              Если окно чёрное или «сайт заблокирован» — чаще мешают блокировщики рекламы; можно открыть карту по ссылке
              ниже.
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">Обратная связь</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

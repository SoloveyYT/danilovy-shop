# Ювелирная мастерская Даниловых — маркетплейс

Многостраничный интернет-магазин на **Next.js 15 (App Router)**, **PostgreSQL**, **Prisma ORM**, аутентификация через **JWT** в httpOnly-cookie; оплата согласуется с мастерской (телефон из настроек).

## Возможности

- **Гости**: каталог услуг и серебра, цены, корзина в `localStorage`.
- **Клиенты** (регистрация): оформление заказа, история заказов.
- **Администратор**: CRUD услуг и каталога серебра (артикулы, цены, изображения — загрузка в `public/uploads`), заказы со статусами (новый → в работе → готов → выдан), уведомление о новых заказах (счётчик непросмотренных), экспорт заказов в **CSV**, редактирование контактов и графика.

## Структура проекта

```
├── prisma/
│   ├── schema.prisma    # Модели User, Service, CatalogItem, Order, OrderItem, Setting
│   └── seed.ts          # Начальные данные и админ
├── public/uploads/      # Загруженные изображения (в git не коммитятся)
├── src/
│   ├── app/             # Страницы и API routes
│   ├── components/      # UI, корзина, формы
│   ├── lib/             # Prisma, JWT, настройки
│   └── middleware.ts    # Защита /checkout, /account, /admin
├── .env.example
├── docker-compose.yml   # Опционально: только PostgreSQL
└── package.json
```

## Требования

- Node.js **20+**
- PostgreSQL **14+**

## Установка

1. Скопируйте переменные окружения:

   ```bash
   copy .env.example .env
   ```

   Укажите `DATABASE_URL`, длинный `JWT_SECRET` (не менее 32 символов для продакшена) и при необходимости `NEXT_PUBLIC_APP_URL`.

2. Установите зависимости:

   ```bash
   npm install
   ```

3. Создайте таблицы в БД:

   ```bash
   npx prisma db push
   ```

   Или миграции:

   ```bash
   npx prisma migrate dev --name init
   ```

4. Заполните БД и создайте администратора (email/пароль из `.env` или значения по умолчанию в `seed.ts`):

   ```bash
   npm run db:seed
   ```

## Запуск в режиме разработки

```bash
npm run dev
```

Сайт: [http://localhost:3000](http://localhost:3000). Админ-панель: `/admin` (только для пользователя с ролью `ADMIN`).

## PostgreSQL через Docker

```bash
docker compose up -d
```

В `.env` укажите строку подключения к контейнеру (пример в `docker-compose.yml`).

## Продакшен

```bash
npm run build
npm start
```

Перед запуском задайте `NODE_ENV=production`, HTTPS и корректные секреты.

**Развёртывание на VPS с нуля:** см. [DEPLOY-FROM-ZERO.md](./DEPLOY-FROM-ZERO.md).

## Безопасность

- **SQL-инъекции**: запросы через Prisma (параметризованные).
- **XSS**: React экранирует вывод; в админке не вставляйте сырой HTML в описания без санитизации.
- **CORS**: API рассчитан на тот же origin; при отдельном фронте добавьте заголовки в `next.config.ts` или middleware.
- **JWT**: хранение в httpOnly cookie, защита маршрутов в `middleware.ts`.

## Лицензия

Проект создан для мастерской Даниловых.

/**
 * Начальное наполнение БД: администратор, услуги, примеры каталога серебра, настройки.
 * Запуск: npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@danilovy.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe_Strong1";
  const hash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: hash,
      fullName: "Администратор",
      role: "ADMIN",
    },
    update: {
      passwordHash: hash,
      role: "ADMIN",
    },
  });

  const services = [
    { article: "REP-001", title: "Лазерная пайка цепи, браслета, кольца", price: "1500", sortOrder: 10 },
    { article: "REP-002", title: "Наращивание протертых деталей", price: "2000", sortOrder: 20 },
    { article: "REP-003", title: "Увеличение/уменьшение размера кольца", price: "1200", sortOrder: 30 },
    { article: "REP-004", title: "Ремонт замков у серёжек", price: "900", sortOrder: 40 },
    { article: "REP-005", title: "Подбор и закрепка камня", price: "2500", sortOrder: 50 },
    { article: "REP-006", title: "Ремонт/замена замка", price: "1100", sortOrder: 60 },
    { article: "REP-007", title: "Покрытие позолотой или родием", price: "3500", sortOrder: 70 },
    { article: "REP-008", title: "Чистка и полировка до зеркального блеска", price: "800", sortOrder: 80 },
    {
      article: "REP-009",
      title: "Перебор на новую нить браслетов и бус с установкой замка",
      price: "1400",
      sortOrder: 90,
    },
    { article: "REP-010", title: "Ремонт бижутерии", price: "700", sortOrder: 100 },
    { article: "REP-011", title: "Запайка оправы очков", price: "600", sortOrder: 110 },
    {
      article: "MFG-001",
      title: "Изготовление ювелирного изделия любой сложности (оценка по эскизу)",
      price: "50000",
      sortOrder: 200,
      description: "Индивидуальный расчёт сроков и стоимости после согласования эскиза.",
    },
    {
      article: "MFG-002",
      title: "Изготовление на заказ из материала клиента (переплавка золота/серебра)",
      price: "30000",
      sortOrder: 210,
      description: "По каталогу, фото или эскизу. Стоимость ориентировочная — уточняется на приёме.",
    },
    {
      article: "MFG-003",
      title: "Изготовление изделий из серебра по каталогам",
      price: "8000",
      sortOrder: 220,
      description: "Выбор модели, размера и камней — см. раздел «Каталог серебра».",
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { article: s.article },
      create: {
        article: s.article,
        title: s.title,
        description: "description" in s ? s.description : "",
        price: s.price,
        sortOrder: s.sortOrder,
        isActive: true,
      },
      update: {
        title: s.title,
        description: "description" in s ? s.description : "",
        price: s.price,
        sortOrder: s.sortOrder,
      },
    });
  }

  const sizesRing = JSON.stringify([
    { label: "16", modifier: "0" },
    { label: "17", modifier: "0" },
    { label: "18", modifier: "200" },
    { label: "19", modifier: "400" },
  ]);
  const stones = JSON.stringify([
    { name: "Без вставки", modifier: "0" },
    { name: "Фианит", modifier: "800" },
    { name: "Топаз", modifier: "4500" },
  ]);

  const catalog = [
    {
      article: "SLV-R01",
      title: "Кольцо «Классика» из серебра 925",
      basePrice: "5900",
      sizesJson: sizesRing,
      stonesJson: stones,
      sortOrder: 1,
    },
    {
      article: "SLV-P02",
      title: "Подвеска «Северное сияние»",
      basePrice: "4200",
      sizesJson: "[]",
      stonesJson: JSON.stringify([
        { name: "Фианит белый", modifier: "0" },
        { name: "Фианит шампань", modifier: "300" },
      ]),
      sortOrder: 2,
    },
    {
      article: "SLV-B03",
      title: "Браслет панцирный",
      basePrice: "7800",
      sizesJson: JSON.stringify([
        { label: "16 см", modifier: "0" },
        { label: "18 см", modifier: "500" },
        { label: "20 см", modifier: "900" },
      ]),
      stonesJson: "[]",
      sortOrder: 3,
    },
  ];

  for (const c of catalog) {
    await prisma.catalogItem.upsert({
      where: { article: c.article },
      create: {
        article: c.article,
        title: c.title,
        description: "Модель из каталога серебра 925 пробы. Уточните размер и камень при заказе.",
        basePrice: c.basePrice,
        sizesJson: c.sizesJson,
        stonesJson: c.stonesJson,
        sortOrder: c.sortOrder,
        isActive: true,
      },
      update: {
        title: c.title,
        basePrice: c.basePrice,
        sizesJson: c.sizesJson,
        stonesJson: c.stonesJson,
        sortOrder: c.sortOrder,
      },
    });
  }

  await prisma.setting.upsert({
    where: { key: "courier_fee_rub" },
    create: { key: "courier_fee_rub", value: "500" },
    update: {},
  });

  await prisma.setting.upsert({
    where: { key: "shop_schedule_json" },
    create: {
      key: "shop_schedule_json",
      value: JSON.stringify([
        "Пн 12:00–19:30",
        "Вт 12:00–19:30",
        "Ср 12:00–19:30",
        "Чт 12:00–16:00",
        "Пт ВЫХОДНОЙ",
        "Сб 12:00–18:00",
        "Вс 12:00–18:00",
      ]),
    },
    update: {},
  });

  await prisma.setting.upsert({
    where: { key: "yandex_map_embed_url" },
    create: {
      key: "yandex_map_embed_url",
      value:
        "https://yandex.ru/map-widget/v1/?text=%D0%B3.%20%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%91%D0%BE%D1%80%D0%B8%D1%81%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B5%20%D0%9F%D1%80%D1%83%D0%B4%D1%8B%2C%20%D0%B4.%2014%2C%20%D0%BA.%204&z=16",
    },
    update: {
      value:
        "https://yandex.ru/map-widget/v1/?text=%D0%B3.%20%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%91%D0%BE%D1%80%D0%B8%D1%81%D0%BE%D0%B2%D1%81%D0%BA%D0%B8%D0%B5%20%D0%9F%D1%80%D1%83%D0%B4%D1%8B%2C%20%D0%B4.%2014%2C%20%D0%BA.%204&z=16",
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed OK. Admin:", adminEmail);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

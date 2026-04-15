/**
 * Начальное наполнение БД: администратор, услуги, примеры каталога изделий, настройки.
 * Запуск: npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEFAULT_ADDRESS,
  DEFAULT_PERSONAL_MAX_URL,
  DEFAULT_SOCIAL_MAX_URL,
  DEFAULT_SOCIAL_TELEGRAM_URL,
  DEFAULT_SOCIAL_VK_URL,
  SHOP_NAME,
} from "../src/lib/constants";

const prisma = new PrismaClient();

const defaultYandexMapEmbedUrl = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(
  `${SHOP_NAME}, ${DEFAULT_ADDRESS}`,
)}&z=16`;

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
    {
      article: "REP-001",
      title: "Лазерная пайка цепи, браслета, кольца",
      price: "1500",
      sortOrder: 10,
      category: "Ремонт",
    },
    {
      article: "REP-002",
      title: "Наращивание протертых деталей",
      price: "2000",
      sortOrder: 20,
      category: "Ремонт",
    },
    {
      article: "REP-003",
      title: "Увеличение/уменьшение размера кольца",
      price: "1200",
      sortOrder: 30,
      category: "Ремонт",
    },
    {
      article: "REP-004",
      title: "Ремонт замков у серёжек",
      price: "900",
      sortOrder: 40,
      category: "Ремонт",
    },
    {
      article: "REP-005",
      title: "Подбор и закрепка камня",
      price: "2500",
      sortOrder: 50,
      category: "Ремонт",
    },
    {
      article: "REP-006",
      title: "Ремонт/замена замка",
      price: "1100",
      sortOrder: 60,
      category: "Ремонт",
    },
    {
      article: "REP-007",
      title: "Покрытие позолотой или родием",
      price: "3500",
      sortOrder: 70,
      category: "Ремонт",
    },
    {
      article: "REP-008",
      title: "Чистка и полировка до зеркального блеска",
      price: "800",
      sortOrder: 80,
      category: "Ремонт",
    },
    {
      article: "REP-009",
      title: "Перебор на новую нить браслетов и бус с установкой замка",
      price: "1400",
      sortOrder: 90,
      category: "Ремонт",
    },
    {
      article: "REP-010",
      title: "Ремонт бижутерии",
      price: "700",
      sortOrder: 100,
      category: "Ремонт",
    },
    {
      article: "REP-011",
      title: "Запайка оправы очков",
      price: "600",
      sortOrder: 110,
      category: "Ремонт",
    },
    {
      article: "MFG-001",
      title: "Изготовление ювелирного изделия любой сложности (оценка по эскизу)",
      price: "50000",
      sortOrder: 200,
      description: "Индивидуальный расчёт сроков и стоимости после согласования эскиза.",
      category: "Изготовление",
    },
    {
      article: "MFG-002",
      title: "Изготовление на заказ из материала клиента (переплавка золота/серебра)",
      price: "30000",
      sortOrder: 210,
      description: "По каталогу, фото или эскизу. Стоимость ориентировочная — уточняется на приёме.",
      category: "Изготовление",
    },
    {
      article: "MFG-003",
      title: "Изготовление изделий из серебра по каталогам",
      price: "8000",
      sortOrder: 220,
      description: "Выбор модели, размера и камней — см. раздел «Каталог».",
      category: "Изготовление",
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { article: s.article },
      create: {
        article: s.article,
        title: s.title,
        category: "category" in s ? s.category : "",
        description: "description" in s ? s.description : "",
        price: s.price,
        sortOrder: s.sortOrder,
        isActive: true,
      },
      update: {
        title: s.title,
        category: "category" in s ? s.category : "",
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
      title: "Кольцо «Классика» из серебра",
      category: "Кольца",
      basePrice: "5900",
      sizesJson: sizesRing,
      stonesJson: stones,
      sortOrder: 1,
    },
    {
      article: "SLV-P02",
      title: "Подвеска «Северное сияние»",
      category: "Подвески",
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
      category: "Браслеты",
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
        category: "category" in c ? c.category : "",
        description: "Модель из каталога: серебро или золото по договорённости. Уточните размер и камень при заказе.",
        basePrice: c.basePrice,
        sizesJson: c.sizesJson,
        stonesJson: c.stonesJson,
        imageUrlsJson: "[]",
        sortOrder: c.sortOrder,
        isActive: true,
      },
      update: {
        title: c.title,
        category: "category" in c ? c.category : "",
        basePrice: c.basePrice,
        sizesJson: c.sizesJson,
        stonesJson: c.stonesJson,
        sortOrder: c.sortOrder,
      },
    });
  }

  const workCount = await prisma.workExample.count();
  if (workCount === 0) {
    await prisma.workExample.createMany({
      data: [
        {
          title: "Реставрация кольца",
          description: "Восстановление оправы и закрепка камня.",
          category: "Ремонт",
          imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
          imageUrlsJson: JSON.stringify([
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
            "https://images.unsplash.com/photo-1610375461248-301e1c6e9214?w=800",
          ]),
          sortOrder: 1,
          isPublished: true,
        },
        {
          title: "Индивидуальный перстень",
          description: "Изготовление по эскизу заказчика.",
          category: "Изготовление",
          imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800",
          imageUrlsJson: "[]",
          sortOrder: 2,
          isPublished: true,
        },
      ],
    });
  }

  const bijCount = await prisma.bijouterieItem.count();
  if (bijCount === 0) {
    await prisma.bijouterieItem.createMany({
      data: [
        {
          article: "BJ-001",
          title: "Серьги с фианитами",
          category: "Серьги",
          description: "Демонстрационная позиция.",
          price: "2900",
          stock: 5,
          imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800",
          imageUrlsJson: "[]",
          sortOrder: 1,
          isActive: true,
        },
        {
          article: "BJ-002",
          title: "Браслет «Классика»",
          category: "Браслеты",
          description: "Демонстрационная позиция.",
          price: "1900",
          stock: 12,
          imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
          imageUrlsJson: "[]",
          sortOrder: 2,
          isActive: true,
        },
      ],
    });
  }

  await prisma.setting.upsert({
    where: { key: "courier_fee_rub" },
    create: { key: "courier_fee_rub", value: "500" },
    update: {},
  });

  await prisma.setting.upsert({
    where: { key: "jewelry_categories_json" },
    create: {
      key: "jewelry_categories_json",
      value: JSON.stringify([
        "Кольца",
        "Серьги",
        "Браслеты",
        "Подвески",
        "Цепи",
        "Колье",
        "Броши",
        "Часы",
        "Прочее",
      ]),
    },
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
      value: defaultYandexMapEmbedUrl,
    },
    update: {
      value: defaultYandexMapEmbedUrl,
    },
  });

  await prisma.setting.upsert({
    where: { key: "social_telegram_url" },
    create: { key: "social_telegram_url", value: DEFAULT_SOCIAL_TELEGRAM_URL },
    update: {},
  });
  await prisma.setting.upsert({
    where: { key: "social_max_url" },
    create: { key: "social_max_url", value: DEFAULT_SOCIAL_MAX_URL },
    update: {},
  });
  await prisma.setting.upsert({
    where: { key: "social_vk_url" },
    create: { key: "social_vk_url", value: DEFAULT_SOCIAL_VK_URL },
    update: {},
  });

  await prisma.setting.upsert({
    where: { key: "personal_max_url" },
    create: { key: "personal_max_url", value: DEFAULT_PERSONAL_MAX_URL },
    update: {},
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

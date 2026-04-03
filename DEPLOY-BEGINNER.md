# Запуск сайта на сервере — для начинающих

Здесь **по шагам**, что делать руками. Не нужно понимать всё сразу: идите **сверху вниз** и отмечайте галочками.

**Важно.** Этот сайт — не «как в конструкторе». Нужен **VPS** (отдельный сервер с Linux), а не обычный дешёвый хостинг «только PHP». Подойдут, например: **Timeweb VPS**, **REG.RU VPS**, **Selectel**.

Слова на память:
- **SSH** — удалённое подключение к серверу (чёрное окно с командами).
- **Домен** — имя сайта, например `danilov-silver.ru`.
- **IP** — числа вроде `31.31.196.206`, по ним интернет находит сервер.

---

## Шаг 0. Что у вас уже должно быть

- [ ] Куплен **VPS** (Ubuntu 22.04 или 24.04 — идеально).
- [ ] Есть **IP-адрес** сервера (в письме от хостера или в панели).
- [ ] Есть **логин и пароль** для SSH (или ключ — тогда по инструкции хостера).
- [ ] Куплен **домен** (например `danilov-silver.ru`).
- [ ] На **вашем компьютере** установлен **Node.js** только для того, чтобы при желании собирать проект локально; на сервере Node ставится отдельно (шаг 4).

Если чего-то нет — сначала докупите VPS и домен у одного регистратора, чтобы проще было в поддержке.

---

## Шаг 1. Привязать домен к серверу (DNS)

Нужно, чтобы по имени `danilov-silver.ru` открывался **ваш** IP.

1. Зайдите в личный кабинет, где куплен домен (**REG.RU** и т.д.).
2. Найдите раздел **DNS**, **зона DNS**, **управление зоной** или **ресурсные записи**.
3. Добавьте записи типа **A**:
   - **Имя:** `@` (или пусто, или сам домен — как показывает панель) → **Значение:** IP вашего VPS (например `31.31.196.206`).
   - **Имя:** `www` → **То же** значение IP.
4. Сохраните. Подождите **от 15 минут до суток**.

Проверка (на Windows: **cmd** или PowerShell).

**Вариант А — `ping`:**

```text
ping danilov-silver.ru
```

Нормально, если в **первых строках** видно имя и **квадратные скобки с IP**, например:  
`Обмен пакетами с danilov-silver.ru [31.31.196.206]` — значит DNS уже «знает» ваш IP.  
Дальше могут идти ответы `Ответ от ...` или **таймауты** (`Превышен интервал ожидания`) — на многих серверах **пинг специально отключён**, это **не значит**, что сайт не заработает.

**Вариант Б — если `ping` пишет «не удаётся найти узел» / «could not find host»:**

- Проверьте, что домен написан **без опечаток** (`danilov-silver.ru`).
- Подождите ещё (DNS обновляется до суток).
- Убедитесь, что в панели REG.RU записи **A** действительно сохранены и указывают на **нужный** IP.

**Вариант В — надёжнее для проверки IP (всегда сработает, если DNS живой):**

```text
nslookup danilov-silver.ru
```

В блоке **«Addresses»** или **«Address»** должен быть ваш IP VPS. Если `nslookup` показывает правильный IP — **шаг 1 с точки зрения DNS можно считать выполненным**, даже если `ping` «молчит» или таймаутит.

---

## Шаг 2. Подключиться к серверу по SSH (первый раз)

**Windows 10/11:** нажмите **Win + R**, введите `cmd`, Enter. Команда (подставьте свой IP и логин, часто логин `root`):

```text
ssh root@ВАШ_IP
```

При первом подключении спросит «продолжить?» — напишите `yes` и Enter. Потом введите **пароль** (символы при вводе не отображаются — это нормально).

Если не пускает — в панели хостера посмотрите точный **логин** (иногда не `root`, а другой) и включён ли SSH.

Вы вошли, если видите приглашение вроде `root@server:~#`.

---

## Шаг 3. Обновить систему (один раз)

Скопируйте по очереди (каждая строка — Enter, дождаться окончания):

```bash
sudo apt update
sudo apt upgrade -y
```

Если спросит пароль снова — введите.

---

## Шаг 4. Установить Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
node -v
```

Должно показать версию **v20.x.x**.

---

## Шаг 5. Установить PostgreSQL и создать базу

```bash
sudo apt install -y postgresql postgresql-contrib
```

Придумайте **сложный пароль** для базы (запишите в блокнот только у себя). Замените `ВАШ_ПАРОЛЬ` ниже на него **одной командой** (в кавычках):

```bash
sudo -u postgres psql -c "CREATE USER danilovy WITH PASSWORD 'ВАШ_ПАРОЛЬ';"
sudo -u postgres psql -c "CREATE DATABASE danilovy_shop OWNER danilovy;"
```

Строка для файла `.env` на сервере будет такой (пароль тот же):

```env
DATABASE_URL="postgresql://danilovy:ВАШ_ПАРОЛЬ@localhost:5432/danilovy_shop?schema=public"
```

---

## Шаг 6. Загрузить проект на сервер (подробно для начинающих)

**Зачем этот шаг.** Сайт — это **папка с файлами** (ваш проект). Сейчас она на **вашем компьютере**. Сервер — **другой компьютер** в сети. Нужно **скопировать** туда код, чтобы потом на сервере выполнить `npm install` и сборку.

**Куда класть.** На сервере удобная папка: `/var/www/danilovy-shop` (внутри должны лежать `package.json`, `src`, `prisma` и т.д.).

**Что не обязательно переносить с ПК:**

- **`node_modules`** — на сервере появится после `npm ci` (шаг 8). Без неё архив легче.
- **`.next`** — сборку сделаете на сервере (`npm run build`).
- Локальный **`.env`** с паролями **лучше не заливать** — новый `.env` создадите в шаге 7 на сервере.

---

### Вариант А — через Git (GitHub)

**Когда удобно:** завели репозиторий на GitHub и один раз «залили» код — на сервере одна команда `git clone`.

**6А.1.** Регистрация на [github.com](https://github.com), **New repository** (имя любое, например `danilovy-shop`). Можно без README.

**6А.2.** На **компьютере** в папке проекта в терминале (в Cursor — встроенный терминал):

```bash
git config --global user.email "Solo86234@gmail.com"
git config --global user.name "Ваше Имя"
git init
git add .
git commit -m "deploy"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/danilovy-shop.git
git push -u origin main
```

Подставьте **свою** ссылку на репозиторий с GitHub. Если спросит логин/пароль — для GitHub обычно нужен **Personal Access Token**, не пароль от сайта (Настройки GitHub → Developer settings → Tokens).

**6А.3.** На **сервере** по SSH:

```bash
sudo apt install -y git
cd /var/www
sudo mkdir -p danilovy-shop
sudo chown $USER:$USER danilovy-shop
cd danilovy-shop
git clone https://github.com/ВАШ_ЛОГИН/danilovy-shop.git .
```

**Точка в конце** (`git clone ... .`) важна: файлы попадут прямо в `danilovy-shop`, а не в лишнюю подпапку.

**6А.4.** Проверка: `ls` — должны быть `package.json`, папки `src`, `prisma`.

Для **приватного** репозитория понадобится токен или SSH-ключ; новичкам проще сначала сделать репозиторий **публичным**, без секретов в файлах (секреты только в `.env` на сервере, он в Git не попадает благодаря `.gitignore`).

---

### Вариант Б — без Git (ZIP + WinSCP)

**Когда удобно:** не хотите Git — только архив и перетаскивание мышью.

**6Б.1.** В проводнике Windows откройте папку проекта. Упакуйте в **ZIP** содержимое (желательно **без** папки `node_modules`, если она есть и огромная).

**6Б.2.** Установите **WinSCP**: [winscp.net](https://winscp.net/).

**6Б.3.** Новое соединение: протокол **SFTP**, **хост** = IP сервера, **пользователь** и **пароль** = как для входа по SSH. Подключиться.

**6Б.4.** Справа — сервер. Перейдите в `/var/www`, создайте папку `danilovy-shop`, зайдите в неё.

**6Б.5.** Слева — ваш ПК. Перетащите ZIP вправо.

**6Б.6.** В SSH на сервере:

```bash
cd /var/www/danilovy-shop
sudo apt install -y unzip
unzip имя-файла.zip
```

Если после распаковки `package.json` оказался в **внутренней** папке — перенесите файлы на уровень `danilovy-shop` (через WinSCP или команды `mv`).

**6Б.7.** Проверка: в `/var/www/danilovy-shop` должен лежать **`package.json`**.

```bash
sudo chown -R $USER:$USER /var/www/danilovy-shop
```

---

### После варианта А или Б

Если в списке файлов есть **`package.json`** — шаг 6 выполнен. Дальше — **шаг 7** (`.env`).

---

## Шаг 7. Создать файл `.env` на сервере

На сервере:

```bash
cd /var/www/danilovy-shop
nano .env
```

Вставьте (все значения — **свои**):

```env
DATABASE_URL="postgresql://danilovy:ВАШ_ПАРОЛЬ@localhost:5432/danilovy_shop?schema=public"
JWT_SECRET="сюда_очень_длинная_случайная_строка_не_меньше_32_символов"
NEXT_PUBLIC_APP_URL="https://danilov-silver.ru"
YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""
ADMIN_EMAIL="ваш@email.ru"
ADMIN_PASSWORD="сложный_пароль_админа"
```

Сохранение в `nano`: **Ctrl+O**, Enter, **Ctrl+X**.

Позже в ЮKassa вставите ключи в `YOOKASSA_*`; пока можно оставить пустыми — сайт заведётся, оплата заработает после ключей.

---

## Шаг 8. Установить зависимости и собрать сайт

```bash
cd /var/www/danilovy-shop
npm ci
npx prisma db push
npm run db:seed
npm run build
```

Если какая-то команда выдала **ошибку** — скопируйте **весь текст ошибки** и разберите по нему (или покажите знающему человеку), не гадайте.

Проверка «вручную»:

```bash
npm start
```

Откройте в браузере `http://ВАШ_IP:3000` — если видите сайт, сборка ок. Остановить: **Ctrl+C**.

---

## Шаг 9. Запуск сайта «навсегда» (systemd)

Чтобы после закрытия SSH сайт не выключался:

```bash
sudo nano /etc/systemd/system/danilovy-shop.service
```

Вставьте (путь к проекту поправьте, если не `/var/www/danilovy-shop`):

```ini
[Unit]
Description=Danilovy Shop
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/danilovy-shop
Environment=NODE_ENV=production
EnvironmentFile=/var/www/danilovy-shop/.env
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Права:

```bash
sudo chown -R www-data:www-data /var/www/danilovy-shop
sudo chmod 600 /var/www/danilovy-shop/.env
sudo mkdir -p /var/www/danilovy-shop/public/uploads
sudo chown -R www-data:www-data /var/www/danilovy-shop/public/uploads
```

Запуск:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now danilovy-shop
sudo systemctl status danilovy-shop
```

Должно быть **active (running)**.

---

## Шаг 10. Nginx и HTTPS (чтобы открывалось по https://danilov-silver.ru)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Файл сайта:

```bash
sudo nano /etc/nginx/sites-available/danilovy
```

Вставьте:

```nginx
server {
    listen 80;
    server_name danilov-silver.ru www.danilov-silver.ru;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    client_max_body_size 20M;
}
```

Включить:

```bash
sudo ln -sf /etc/nginx/sites-available/danilovy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Сертификат:

```bash
sudo certbot --nginx -d danilov-silver.ru -d www.danilov-silver.ru
```

Дальше откройте **https://danilov-silver.ru** в браузере.

---

## Шаг 11. ЮKassa (когда сайт уже открывается)

1. Зарегистрируйте магазин на [yookassa.ru](https://yookassa.ru/) (ИП).
2. Возьмите **shopId** и **секретный ключ** → пропишите в `.env` на сервере в `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`.
3. В кабинете ЮKassa укажите вебхук:  
   `https://danilov-silver.ru/api/payments/webhook`
4. Перезапуск сервиса после правки `.env`:

```bash
sudo systemctl restart danilovy-shop
```

Если меняли `NEXT_PUBLIC_APP_URL`, нужно снова выполнить `npm run build` от пользователя `www-data` или временно зайти под `www-data` и пересобрать — проще один раз вызвать поддержку или знакомого, если непонятно.

---

## Если что-то пошло не так

| Симптом | Куда смотреть |
|--------|----------------|
| Браузер пишет «не удаётся подключиться» | DNS (шаг 1), фаервол в панели хостера (открыть 80, 443), `systemctl status danilovy-shop` |
| 502 Bad Gateway | Не запущен Node: `sudo systemctl status danilovy-shop`, логи `journalctl -u danilovy-shop -n 50` |
| После оплаты кидает на localhost | В `.env` должно быть `NEXT_PUBLIC_APP_URL=https://danilov-silver.ru` и пересборка `npm run build` |
| Ошибка Prisma | База не создана или неверный `DATABASE_URL` |

---

## Что делать дальше по этому файлу

1. Отметьте **Шаг 0**.
2. Делайте **Шаг 1**, пока не заработает `ping`.
3. Потом **Шаг 2** — пока не зайдёте по SSH.
4. Идите дальше по порядку. Не перескакивайте.

Если застряли — запишите **на каком шаге** и **точный текст ошибки** (скрин или копипаст). Без этого угадывать бесполезно.

Удачи.

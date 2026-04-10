# Запуск сайта на сервере — инструкция с нуля

Одна логика: **сначала код на GitHub (или архивом), потом сервер**.  
Чтобы не повторять ошибки с Git — в разделе 1 главное правило: **репозиторий на GitHub создаётся пустым** (без README).

Домен в примерах: **danilov-silver.ru**. Подставьте свой IP и пароли.

---

## Часть 0. Что должно быть

- [ ] **VPS** с Ubuntu и доступ по **SSH** (не «только PHP-хостинг»).
- [ ] Установлен **Git для Windows** на ПК: https://git-scm.com/download/win  
- [ ] Аккаунт **GitHub**.

Если с Git не хотите связываться — сразу переходите к **части 2Б** (архив и WinSCP), часть 1 можно пропустить.

---

## Часть 1. Залить проект на GitHub (без конфликтов)

### 1.1. Создать репозиторий правильно

1. Зайдите на https://github.com → **New repository**.
2. Имя, например: `danilovy-shop`.
3. **Важно:** галочки **Add a README**, **Add .gitignore**, **Choose a license** — **НЕ ставьте**. Репозиторий должен быть **полностью пустым**.
4. Нажмите **Create repository**.

Так GitHub **не создаёт** первый коммит, и ошибки *«rejected / fetch first»* не появятся.

### 1.2. Один раз настроить имя и почту Git (на ПК)

Откройте PowerShell **в папке проекта** и выполните (подставьте свои):

```powershell
git config --global user.email "ваш@email.com"
git config --global user.name "ВашНикGitHub"
```

### 1.3. Если в этой папке уже был сломанный Git

Удалите старую служебную папку (она скрытая):

```powershell
Remove-Item -Recurse -Force .git
```

Потом делайте шаги 1.4–1.6 с чистого листа.

### 1.4. Первый коммит и отправка

В той же папке проекта, **по очереди** (подставьте **свой** логин и имя репозитория):

```powershell
git init
git add .
git commit -m "initial"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/danilovy-shop.git
git push -u origin main
```

При `git push` откроется вход в браузере — войдите в GitHub.

### 1.5. Если репозиторий на GitHub уже был с README (старая ошибка)

Либо **удалите** репозиторий на сайте GitHub и создайте новый по п. 1.1, либо один раз перезапишите ветку (только если на GitHub нет нужного кода):

```powershell
git push -u origin main --force
```

### 1.6. Проверка

На странице репозитория на GitHub должны быть папки `src`, `prisma`, файл `package.json`.

---

## Часть 2А. Скачать код на сервер через Git

Подключитесь к серверу по **SSH**. Подставьте **ссылку HTTPS** вашего репозитория:

```bash
sudo apt update
sudo apt install -y git
cd /var/www
sudo mkdir -p danilovy-shop
sudo chown $USER:$USER /var/www/danilovy-shop
cd danilovy-shop
git clone https://github.com/SoloveyYT/danilovy-shop.git .
ls
```

Должен быть файл `package.json`. Дальше — **часть 3**.

---

## Часть 2Б. Без Git: ZIP и WinSCP

1. На ПК заархивируйте папку проекта в **ZIP** (без папки `node_modules`, если она большая).
2. Установите **WinSCP**, подключение: **SFTP**, хост = IP сервера, логин/пароль как для SSH.
3. На сервере создайте `/var/www/danilovy-shop`, загрузите ZIP, распакуйте по SSH:

```bash
cd /var/www/danilovy-shop
sudo apt install -y unzip
unzip ваш-архив.zip
```

4. Если `package.json` оказался во вложенной папке — перенесите **все файлы** в `/var/www/danilovy-shop`.

Дальше — **часть 3**.

---

## Часть 3. Сервер: PostgreSQL, .env, сборка, автозапуск

Все команды — **на сервере по SSH**, если не сказано иначе.

### 3.1. PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
```

Создайте пользователя и базу (пароль придумайте и **запишите**):

```bash
sudo -u postgres psql -c "CREATE USER danilovy WITH PASSWORD 'ВАШ_ПАРОЛЬ_БД';"
sudo -u postgres psql -c "CREATE DATABASE danilovy_shop OWNER danilovy;"
```

Успех: в ответ строки `CREATE ROLE` и `CREATE DATABASE`.

### 3.2. Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
node -v
```

### 3.3. Файл `.env` на сервере

```bash
cd /var/www/danilovy-shop
nano .env
```

Вставьте (пароль БД и секреты — **свои**):

```env
DATABASE_URL="postgresql://danilovy:ВАШ_ПАРОЛЬ_БД@localhost:5432/danilovy_shop?schema=public"
JWT_SECRET="любая_длинная_случайная_строка_не_короче_32_символов"
NEXT_PUBLIC_APP_URL="https://danilov-silver.ru"
YOOKASSA_SHOP_ID=""
YOOKASSA_SECRET_KEY=""
ADMIN_EMAIL="ваш@email.ru"
ADMIN_PASSWORD="надежный_пароль_админа"
```

Сохранить в nano: **Ctrl+O**, Enter, **Ctrl+X**.

### 3.4. Сборка

```bash
cd /var/www/danilovy-shop
npm ci
npx prisma db push
npm run db:seed
npm run build
```

Проверка вручную (потом **Ctrl+C**):

```bash
npm start
```

В браузере откройте `http://IP_СЕРВЕРА:3000` — должен открыться сайт.

### 3.5. Автозапуск (systemd)

```bash
sudo nano /etc/systemd/system/danilovy-shop.service
```

Вставьте:

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

Дальше:

```bash
sudo chown -R www-data:www-data /var/www/danilovy-shop
sudo chmod 600 /var/www/danilovy-shop/.env
sudo mkdir -p /var/www/danilovy-shop/public/uploads
sudo chown -R www-data:www-data /var/www/danilovy-shop/public/uploads
sudo systemctl daemon-reload
sudo systemctl enable --now danilovy-shop
sudo systemctl status danilovy-shop
```

Должно быть **active (running)**.

### 3.6. Nginx и HTTPS

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo nano /etc/nginx/sites-available/danilovy
```

Содержимое (домен замените при необходимости):

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

Включение сайта и сертификат:

```bash
sudo ln -sf /etc/nginx/sites-available/danilovy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d danilov-silver.ru -d www.danilov-silver.ru
```

В REG.RU для домена должна быть запись **A** на IP сервера (см. часть 4).

### 3.7. После смены `.env` (например, ключи ЮKassa)

```bash
sudo systemctl restart danilovy-shop
```

Если меняли `NEXT_PUBLIC_APP_URL`, нужна пересборка от имени владельца файлов:

```bash
cd /var/www/danilovy-shop
sudo -u www-data env PATH=$PATH npm run build
sudo systemctl restart danilovy-shop
```

---

## Часть 4. Домен (кратко)

В панели REG.RU у домена **danilov-silver.ru** добавьте записи **A**:

- имя `@` (или корень) → IP сервера;
- имя `www` → тот же IP.

Проверка с ПК: `nslookup danilov-silver.ru` — должен показывать IP сервера.

---

## Часть 5. ЮKassa

Когда сайт открывается по **https://danilov-silver.ru**:

1. Ключи в личном кабинете ЮKassa → в `.env` (`YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`).
2. Вебхук: `https://danilov-silver.ru/api/payments/webhook`
3. Перезапуск: `sudo systemctl restart danilovy-shop` (и при смене публичного URL — `npm run build`, см. 3.7).

---

## Если снова «ломается» Git на ПК

1. Сохраните папку проекта целиком (копия на всякий случай).  
2. Удалите `.git`: `Remove-Item -Recurse -Force .git`  
3. Создайте на GitHub **новый пустой** репозиторий (часть 1.1).  
4. Выполните только блок из **части 1.4**.

Или забудьте про Git на ПК и пользуйтесь **частью 2Б** (ZIP + WinSCP).

---

## Часто: «Connection refused» на `http://IP:3000`

1. **Сайт не запущен** — на сервере должно работать `npm start` или `systemctl status danilovy-shop`. Проверка с сервера: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000` (ожидается `200` или `307`).
2. **Слушать на всех интерфейсах** — в `package.json` скрипт `start`: `next start -H 0.0.0.0 -p 3000` (чтобы был доступ не только с localhost).
3. **Фаервол VPS** — открыть входящий TCP 3000 или проверять сайт через Nginx на портах 80/443 (тогда снаружи `:3000` можно не открывать).
4. Сообщение про **squid** / **localhost** в ошибке — часто мешает **прокси** в браузере или сети. Отключите прокси для теста или откройте с телефона по мобильному интернету.

---

Удачи. Один шаг — один абзац; если что-то падает, сохраните **точный текст ошибки** и номер части.

# 🎮 ModHub — Вебплатформа для публікацій ігрових модифікацій

> Повноцінна клієнт-серверна платформа для публікації та пошуку ігрових модів з інтегрованим AI-агентом на базі LLM, що обробляє природномовні запити та формує персоналізовані рекомендації.

---

## 👤 Автор

- **ПІБ**: Задорожний Володимир
- **Група**: ФЕІ-44
- **Спеціальність**: 122 Комп'ютерні науки
- **Керівник**: доц. Ярослав БОЙКО
- **Рецензент**: доц. Роман МИСЮК
- **Університет**: Львівський національний університет імені Івана Франка, факультет електроніки та комп'ютерних технологій
- **Рік**: 2026

---

## 📌 Загальна інформація

- **Тип проєкту**: Вебплатформа (SPA + REST API)
- **Мови програмування**: JavaScript (Node.js + React)
- **Стек**: MERN (MongoDB, Express.js, React, Node.js)
- **AI**: NVIDIA NIM API — модель `meta/llama-3.1-8b-instruct`
- **Автентифікація**: JWT (cookie + localStorage)

---

## 🧠 Опис функціоналу

- 🔐 Реєстрація та авторизація користувачів з JWT-токенами
- 🗂️ Каталог модифікацій з пагінацією, фільтрацією (гра, категорія) та сортуванням
- 📄 Детальна сторінка мода: метадані, скріншоти, інструкція зі встановлення, файл для завантаження
- ✍️ Публікація модів з повною формою метаданих (теги, категорії, версія, скріншоти тощо)
- 🤖 AI-агент у форматі чату — приймає природномовні запити та повертає рекомендації
- 💬 Збереження історії чату між сесіями
- ❤️ Управління статусами модів: «сподобалось», «збережено», «не цікаво»
- 🎯 Рекомендаційна система на основі вподобань користувача

---

## 🧱 Опис основних файлів

| Файл | Призначення |
|------|-------------|
| `server/server.js` | Точка входу Express-сервера, підключення middleware та маршрутів |
| `server/models/Mod.js` | Mongoose-схема модифікації з повнотекстовим індексом |
| `server/models/Game.js` | Mongoose-схема гри |
| `server/routes/modRoutes.js` | REST API для CRUD-операцій з модами, пошук, фільтрація |
| `server/routes/aiRoutes.js` | Маршрути AI-агента: чат, рекомендації, збереження історії |
| `server/routes/authRoutes.js` | Реєстрація, вхід, вихід |
| `server/services/aiService.js` | Логіка визначення інтенту та пошуку за метаданими |
| `server/services/recommendationService.js` | Генерація рекомендацій на основі вподобань |
| `server/utils/nvidiaAI.js` | Клієнт NVIDIA NIM API (OpenAI-сумісний) |
| `server/middleware/auth.js` | JWT-middleware для захищених маршрутів |
| `Client/src/App.jsx` | Кореневий React-компонент, маршрутизація |
| `Client/src/pages/Mods.jsx` | Каталог модів з фільтрами та вбудованим чатом |
| `Client/src/pages/ModDetails.jsx` | Детальна сторінка мода |
| `Client/src/pages/CreateMod.jsx` | Форма публікації нового мода |
| `Client/src/pages/Chat.jsx` | Окрема сторінка чату з AI-агентом |
| `Client/src/components/AiChatBox.jsx` | Компонент чат-бота (compact та full режими) |

---

## ▶️ Як запустити проєкт «з нуля»

### 1. Встановлення інструментів

- [Node.js](https://nodejs.org/) v18+ та npm
- [MongoDB](https://www.mongodb.com/) (локально або [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Ключ NVIDIA NIM API — отримати на [build.nvidia.com](https://build.nvidia.com/)

### 2. Клонування репозиторію

```bash
git clone https://github.com/your-username/Diplom_act.git
cd Diplom_act
```

### 3. Встановлення залежностей

```bash
# Backend
cd server
npm install

# Frontend
cd ../Client
npm install
```

### 4. Створення `.env` файлу

У папці `server/` створіть файл `.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/modhub
JWT_SECRET=your_super_secret_key
NVIDIA_API_KEY=your_nvidia_nim_api_key
CLIENT_URL=http://localhost:5173
```

### 5. Запуск

```bash
# Backend (з папки server/)
npm start
# або в режимі розробки:
npm run dev

# Frontend (з папки Client/)
npm run dev
```

Відкрийте браузер: [http://localhost:5173](http://localhost:5173)

---

## 🔌 API — основні ендпоінти

### 🔐 Автентифікація

**POST** `/api/auth/register`
```json
{
  "username": "gamer123",
  "email": "user@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "jwt_token_here",
  "user": { "id": "...", "username": "gamer123" }
}
```

---

### 🗂️ Моди

**GET** `/api/mods?page=1&limit=20&search=графіка&game=skyrim&sort=popular`

Параметри: `page`, `limit`, `search`, `game`, `category`, `sort` (popular / newest / rating / downloads / alphabetical)

**GET** `/api/mods/:id` — деталі мода

**POST** `/api/mods` *(потрібна авторизація)*
```json
{
  "title": "Ultimate Skyrim Graphics Overhaul",
  "titleUa": "Максимальне покращення графіки Skyrim",
  "game": "game_id_here",
  "categories": ["category_id_1"],
  "version": "2.1.0",
  "tags": ["графіка", "текстури", "4K"],
  "shortDescription": "Повний графічний оверхол",
  "description": "Детальний опис...",
  "coverImage": "https://...",
  "modFile": "https://..."
}
```

**DELETE** `/api/mods/:id` *(тільки автор)*

---

### 🤖 AI-агент

**POST** `/api/ai/chat`
```json
{
  "message": "Порадь моди для оптимізації Skyrim на слабкому ПК",
  "sessionMessages": []
}
```
**Response:**
```json
{
  "reply": "Ось кілька модів для оптимізації...",
  "relatedMods": [ { "title": "...", "slug": "..." } ]
}
```

**GET** `/api/ai/history` — отримати збережену історію чату

**DELETE** `/api/ai/history` — очистити історію

---

### ❤️ Статуси користувача

**POST** `/api/user-mods/status`
```json
{
  "modId": "mod_id_here",
  "status": "liked"
}
```
Доступні статуси: `liked`, `saved`, `notInterested`

---

## 🖱️ Інструкція для користувача

1. **Реєстрація / Вхід** — створіть акаунт або увійдіть через сторінку `/login`

2. **Каталог модів** (`/mods`):
   - Використовуйте рядок пошуку для знаходження за назвою або тегами
   - Фільтруйте за грою та категорією
   - Сортуйте за популярністю, датою або рейтингом
   - Зліва внизу відкрийте чат з AI-агентом

3. **AI-агент** — напишіть запит звичайною мовою:
   - *«Порадь графічні моди для Skyrim»*
   - *«Що встановити на слабкий ПК?»*
   - *«Як встановити мод вручну?»*

4. **Сторінка мода** — перегляд скріншотів, інструкції зі встановлення, завантаження файлу. Натисніть ❤️ / 🔖 для збереження вподобань.

5. **Публікація мода** (`/create-mod`) — заповніть форму з метаданими та опублікуйте свій мод.

---

## 📷 Скріншоти

- Каталог модів з фільтрами
- Детальна сторінка мода
- Чат з AI-агентом
- Форма публікації

*(додайте зображення у папку `/screenshots/`)*

---

## 🧪 Відомі проблеми та рішення

| Проблема | Рішення |
|----------|---------|
| `CORS error` | Перевірте `CLIENT_URL` у `.env` та налаштування cors у `server.js` |
| `Cannot connect to MongoDB` | Перевірте `MONGO_URI` у `.env`, чи запущений MongoDB |
| AI не відповідає | Перевірте `NVIDIA_API_KEY` та доступність `integrate.api.nvidia.com` |
| `401 Unauthorized` | Токен прострочений — вийдіть і увійдіть знову |
| Завантаження файлів не працює | Перевірте наявність та права доступу до папки `server/uploads/` |

---

## 🧾 Використані технології та джерела

- [React](https://react.dev/) — документація
- [Express.js](https://expressjs.com/) — документація
- [MongoDB / Mongoose](https://mongoosejs.com/docs/) — документація
- [NVIDIA NIM](https://docs.nvidia.com/nim/) — документація
- [JWT.io](https://jwt.io/introduction) — опис стандарту
- [React Router v6](https://reactrouter.com/) — документація
- [Vite](https://vitejs.dev/) — інструмент збірки

---

## 📄 Ліцензія

Проєкт виконано в навчальних цілях як бакалаврська кваліфікаційна робота.  
Львівський національний університет імені Івана Франка, 2026.

# Telegram Mini App для Booking System

React приложение для системы бронирования, интегрированное с booking_api.

## Архитектура

1. **Пользователь открывает бота** → `/start`
2. **Бот показывает кнопку** для открытия Mini App
3. **Mini App открывается** и получает `chat_id` из Telegram WebApp API
4. **Проверка регистрации** через `GET /api/users/{chat_id}`
5. **Если не зарегистрирован** → выбор роли (Client/Professional)
6. **Регистрация/Вход**:
   - Client: First Name, Last Name, Phone (опционально)
   - Professional: Username, Password
7. **После успешной регистрации** → "Hello World"

## Установка

```bash
npm install
```

## Настройка

Создайте файл `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Запуск

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Интеграция с ботом

Чтобы добавить кнопку для открытия Mini App в бота, нужно изменить handler в `booking_client`:

### Вариант 1: Кнопка в сообщении приветствия

В `booking_client/internal/handlers/handler.go`, в функции `handleStart`, добавьте кнопку Web App:

```go
// После отправки welcomeText с выбором роли, добавьте кнопку Web App
webAppButton := tgbotapi.NewWebAppButton("Открыть приложение", tgbotapi.WebAppInfo{
    URL: "https://your-ngrok-url.ngrok-free.dev",
})

keyboard := tgbotapi.NewInlineKeyboardMarkup(
    tgbotapi.NewInlineKeyboardRow(
        tgbotapi.NewInlineKeyboardButtonData("👤 Client", "client"),
        tgbotapi.NewInlineKeyboardButtonData("👨‍💼 Professional", "professional"),
    ),
    tgbotapi.NewInlineKeyboardRow(
        webAppButton,
    ),
)
```

### Вариант 2: Кнопка в меню команд

В `booking_client/cmd/bot/main.go`, после инициализации бота:

```go
// Set menu button
menuButton := tgbotapi.NewMenuButtonWebApp("Открыть приложение", tgbotapi.WebAppInfo{
    URL: "https://your-ngrok-url.ngrok-free.dev",
})
bot.GetAPI().Request(tgbotapi.NewSetChatMenuButton(chatID, menuButton))
```

### Вариант 3: Кнопка в dashboard

В `booking_client/internal/handlers/client/client_handler.go`, в функции `ShowDashboard`:

```go
webAppButton := tgbotapi.NewWebAppButton("📱 Открыть приложение", tgbotapi.WebAppInfo{
    URL: cfg.MiniAppURL, // Добавьте в config
})

keyboard := tgbotapi.NewInlineKeyboardMarkup(
    // ... существующие кнопки ...
    tgbotapi.NewInlineKeyboardRow(webAppButton),
)
```

## API Endpoints

Приложение использует следующие endpoints:

- `GET /api/users/{chat_id}` - проверка существования пользователя
- `POST /api/clients/register` - регистрация клиента
- `POST /api/professionals/sign_in` - вход для профессионала

## Структура проекта

```
src/
├── App.jsx              # Главный компонент с логикой выбора роли и регистрации
├── App.css              # Стили компонента
├── services/
│   └── api.js           # API сервис для работы с booking_api
└── main.jsx             # Точка входа
```

## Особенности

- ✅ Автоматическое получение `chat_id` из Telegram
- ✅ Проверка регистрации пользователя
- ✅ Выбор роли (Client/Professional)
- ✅ Форма регистрации для клиента
- ✅ Форма входа для профессионала
- ✅ Поддержка тем Telegram (light/dark)
- ✅ Адаптивный дизайн

## Разработка с ngrok

1. Запустите dev server:
   ```bash
   npm run dev
   ```

2. Запустите ngrok:
   ```bash
   ngrok http 8000
   ```

3. Используйте ngrok URL в настройках бота (BotFather → /newapp)

4. Убедитесь, что в `vite.config.js` добавлен ваш ngrok домен в `allowedHosts`

## Следующие шаги

После успешной регистрации можно добавить:
- Dashboard для клиента (бронирования, просмотр записей)
- Dashboard для профессионала (управление расписанием, подтверждение бронирований)
- Интеграцию с уведомлениями через бота

# Telegram Mini App for Booking System

React application for the booking system, integrated with booking_api.

## Architecture

1. **User opens the bot** → `/start`
2. **Bot shows a button** to open the Mini App
3. **Mini App opens** and receives `chat_id` from Telegram WebApp API
4. **Registration check** via `GET /api/users/{chat_id}`
5. **If not registered** → role selection (Client/Professional)
6. **Registration/Login**:
   - Client: First Name, Last Name, Phone (optional)
   - Professional: Username, Password
7. **After successful registration** → "Hello World"

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Running

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview
```

## Bot Integration

To add a button to open the Mini App in the bot, you need to modify the handler in `booking_client`:

### Option 1: Button in welcome message

In `booking_client/internal/handlers/handler.go`, in the `handleStart` function, add a Web App button:

```go
// After sending welcomeText with role selection, add Web App button
webAppButton := tgbotapi.NewWebAppButton("Open App", tgbotapi.WebAppInfo{
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

### Option 2: Button in command menu

In `booking_client/cmd/bot/main.go`, after bot initialization:

```go
// Set menu button
menuButton := tgbotapi.NewMenuButtonWebApp("Open App", tgbotapi.WebAppInfo{
    URL: "https://your-ngrok-url.ngrok-free.dev",
})
bot.GetAPI().Request(tgbotapi.NewSetChatMenuButton(chatID, menuButton))
```

### Option 3: Button in dashboard

In `booking_client/internal/handlers/client/client_handler.go`, in the `ShowDashboard` function:

```go
webAppButton := tgbotapi.NewWebAppButton("📱 Open App", tgbotapi.WebAppInfo{
    URL: cfg.MiniAppURL, // Add to config
})

keyboard := tgbotapi.NewInlineKeyboardMarkup(
    // ... existing buttons ...
    tgbotapi.NewInlineKeyboardRow(webAppButton),
)
```

## API Endpoints

The application uses the following endpoints:

- `GET /api/users/{chat_id}` - check if user exists
- `POST /api/clients/register` - register a client
- `POST /api/professionals/sign_in` - sign in for professional

## Project Structure

```
src/
├── App.jsx              # Main component with role selection and registration logic
├── App.css              # Component styles
├── services/
│   └── api.js           # API service for working with booking_api
└── main.jsx             # Entry point
```

## Features

- ✅ Automatic `chat_id` retrieval from Telegram
- ✅ User registration check
- ✅ Role selection (Client/Professional)
- ✅ Registration form for client
- ✅ Sign-in form for professional
- ✅ Telegram theme support (light/dark)
- ✅ Responsive design

## Development with ngrok

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Start ngrok:
   ```bash
   ngrok http 8000
   ```

3. Use the ngrok URL in bot settings (BotFather → /newapp)

4. Make sure your ngrok domain is added to `allowedHosts` in `vite.config.js`

---

## 🚀 Deployment to Firebase Hosting

For deployment to Firebase Hosting, see [DEPLOY.md](./DEPLOY.md)

**Quick deployment:**

```bash
# 1. Install Firebase CLI (once)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize project (once)
firebase init hosting
# Select: dist/, single-page app: Yes

# 4. Build and deploy
npm run deploy
# or
npm run build && firebase deploy --only hosting
```

After deployment, you'll get a URL like `https://YOUR-PROJECT.web.app` - use it in BotFather → `/newapp`

**Firebase Hosting advantages:**
- ✅ Free tier (sufficient for 500+ users)
- ✅ Automatic HTTPS and CDN
- ✅ Simple one-command deployment
- ✅ Versioning and rollback

---

## Next Steps

After successful registration, you can add:
- Client dashboard (bookings, view appointments)
- Professional dashboard (schedule management, booking confirmations)
- Integration with bot notifications

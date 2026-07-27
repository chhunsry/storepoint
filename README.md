# Premium Accessories Store Points Telegram Bot

This package contains:

- `public/index.html` - your Telegram Mini App
- `public/logo.jpg` - your logo
- `server.mjs` - a small web server and Telegram bot

## What You Need

1. Create a bot in Telegram with `@BotFather`.
2. Copy the bot token.
3. Host this folder on a service that gives you an HTTPS URL.

## Render Setup

1. Upload this folder to GitHub.
2. Create a new Render Web Service from the GitHub repo.
3. Use these settings:
   - Build Command: leave empty
   - Start Command: `npm start`
4. Add environment variables:
   - `BOT_TOKEN` = your BotFather token
   - `WEB_APP_URL` = your Render URL, for example `https://your-app.onrender.com`
5. Deploy.

## BotFather Setup

After hosting, open `@BotFather`:

1. `/mybots`
2. Choose your bot
3. Bot Settings
4. Menu Button or Configure Mini App
5. Set the URL to your HTTPS app URL

Then open your bot and send `/start`.

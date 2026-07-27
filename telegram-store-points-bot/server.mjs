import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 3000);
const botToken = process.env.BOT_TOKEN || "";
const publicUrl = (process.env.WEB_APP_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");
const publicDir = new URL("./public/", import.meta.url);
let updateOffset = 0;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function getAppUrl(request) {
  if (publicUrl) return publicUrl;
  const host = request.headers["x-forwarded-host"] || request.headers.host || `localhost:${port}`;
  const proto = request.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

async function sendTelegram(method, body) {
  if (!botToken) return undefined;

  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${method} failed: ${text}`);
  }

  return response.json();
}

async function answerStartMessage(message, appUrl) {
  await sendTelegram("sendMessage", {
    chat_id: message.chat.id,
    text: "Open Premium Accessories Store Points:",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Store Points",
            web_app: { url: appUrl },
          },
        ],
      ],
    },
  });
}

async function pollTelegram() {
  if (!botToken) return;

  try {
    const response = await sendTelegram("getUpdates", {
      offset: updateOffset,
      timeout: 25,
      allowed_updates: ["message"],
    });

    for (const update of response.result || []) {
      updateOffset = update.update_id + 1;
      const message = update.message;
      if (!message?.chat) continue;

      const text = message.text || "";
      if (text.startsWith("/start")) {
        await answerStartMessage(message, publicUrl || "https://your-host-url.com");
      }
    }
  } catch (error) {
    console.error(error.message);
  } finally {
    setTimeout(pollTelegram, 1200);
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "http://localhost");

    if (url.pathname === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true, bot: Boolean(botToken), appUrl: getAppUrl(request) }));
      return;
    }

    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";

    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    const fileUrl = new URL(`.${safePath}`, publicDir);
    const content = await readFile(fileUrl);
    const contentType = mimeTypes[extname(fileUrl.pathname)] || "application/octet-stream";

    response.writeHead(200, { "content-type": contentType });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Store Points app running on port ${port}`);
  if (!botToken) console.log("BOT_TOKEN is missing. The web app will work, but the bot will not reply.");
});

pollTelegram();

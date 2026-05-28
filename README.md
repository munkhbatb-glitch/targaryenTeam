# Video Call Demo (NestJS + Next.js + WebRTC)

Нэг server дээр frontend + backend + WebSocket signaling ажиллана.

## Онцлог

- WebRTC video/audio call
- Real-time chat (WebSocket + SQLite)
- Email room invite (Brevo / Resend — optional)
- Static Next.js UI → NestJS serve

## Локал ажиллуулах

```bash
npm install
cp .env.example .env
# .env дээр BREVO_API_KEY, EMAIL_FROM тохируулна (optional)

npm run build
npm run start:prod
```

Browser: **https://localhost:3443**

## Dev mode (frontend + backend зэрэг)

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `https://localhost:3443`

> Анхаарах: dev үед backend-ийн HTTP redirect порт `3001` дээр ажиллана (frontend `3000`-г эзэлдэг тул).

## Үнэгүй demo deploy (GitHub + Render)

### 1. GitHub repo үүсгэх

```bash
git init
git add .
git commit -m "Video call demo"
git branch -M main
git remote add origin https://github.com/YOUR_USER/video-call-demo.git
git push -u origin main
```

> `.env` git-д орохгүй. API key-үүдийг GitHub Secrets биш, Render dashboard дээр оруулна.

### 2. Render дээр deploy

1. [render.com](https://render.com) → **New +** → **Blueprint** (эсвэл **Web Service**)
2. GitHub repo холбох
3. `render.yaml` автоматаар уншигдана (эсвэл гараар):
   - **Build:** `npm install; npm run build` (PowerShell дээр `&&` ажиллахгүй байж болно)
   - **Start:** `npm run start:prod`
4. **Environment variables** (Render dashboard):

| Variable | Жишээ | Заавал? |
|----------|-------|---------|
| `APP_URL` | `https://video-call-demo.onrender.com` | Тийм |
| `BREVO_API_KEY` | `xkeysib-...` | И-мэйл урилгад |
| `EMAIL_FROM` | Brevo дээр баталгаажсан sender | И-мэйл урилгад |

5. Deploy дараа `APP_URL`-ийг Render-ийн бодит URL болгон шинэчил.

### Demo ашиглах

1. Deploy хийсэн URL нээ (жишээ: `https://video-call-demo.onrender.com`)
2. **Call** хуудас руу ор → room ID автоматаар үүснэ
3. Хоёр browser/tab нээж ижил room link-ээр нэгд
4. Camera/mic зөвшөөр → video call + chat

**Анхаарах:**
- Render free tier 15 мин idle дараа унтарна → эхний хүсэлт удаан (cold start)
- И-мэйл урилга: Brevo sender + IP whitelist шаардлагатай
- И-мэйлгүй demo: link-ийг гараар хуваалцаж болно (`/call/?room=...`)

## Бүтэц

```
targaryn/
  src/           # NestJS (API, WebSocket, email, SQLite)
  frontend/      # Next.js UI
  frontend/out/  # build output (deploy-д build хийгдэнэ)
  render.yaml    # Render blueprint
```

## Командууд

| Команд | Юу хийх вэ |
|--------|------------|
| `npm run build` | Frontend + backend build |
| `npm run start:prod` | Production server |
| `npm run start:dev` | Backend hot reload |

## И-мэйл урилга (optional)

```env
EMAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-...
EMAIL_FROM=you@verified-domain.com
EMAIL_FROM_NAME=Video Call Demo
APP_URL=https://your-app.onrender.com
```

Brevo → Senders дээр `EMAIL_FROM` баталгаажуул. IP restriction идэвхтэй бол server IP-г whitelist хийнэ.

## Технологи

- **NestJS** — API, WebSocket, email, SQLite chat
- **Next.js** — static export UI
- **WebRTC** — peer video/audio
- **Render** — үнэгүй HTTPS hosting (demo)

# Breads-Fe

> 🍞 Part of **[Breads](https://github.com/NguyenAnhDuc1711/Breads)** — start there for the architecture
> overview, screenshots and the other three repositories.

The user-facing web client for Breads: feed, profiles, real-time chat, search and settings.
Live at **https://breads.sytes.net/**

---

## Stack

| Concern | Choice |
|---|---|
| Framework | **Next.js** (App Router, `output: "standalone"`) + React |
| Language | TypeScript |
| State | Redux Toolkit — slices for user, post, message, notification, report |
| Data fetching | Axios against the Breads-Be REST API |
| Real-time | `socket.io-client` (`src/socket.ts`) |
| i18n | `i18next` / `react-i18next` — English & Vietnamese (`languages/`) |
| Images | `next/image` + Sharp, Cloudinary as the remote source |
| Analytics | Google Tag Manager via `@next/third-parties` |
| Container | Multi-stage Dockerfile on `node:20-alpine` |

## Layout

```
app/
  (main)/            route group for the authenticated shell
    [tab]/           dynamic feed tabs (for you, following, liked, saved)
    chat/            real-time messaging
    activity/        notifications
    search/          user search + follow suggestions
    users/           profiles
    posts/           post detail & replies
    setting/         account settings
  api/link-preview/  server-only route — keeps the linkpreview.net key out of the bundle
  sitemap.ts         dynamic sitemap
  robots.ts          robots.txt
  post-sitemap/      per-post sitemap segment
middleware.ts        auth-cookie route guard
src/
  store/             Redux slices
  components/        shared UI
  hooks/  lib/  util/
  Breads-Shared/     git submodule — API paths, enums and DTO types
```

## Notable details

- **Route protection lives in `middleware.ts`**, not in components. Protected prefixes are checked against
  the `refreshToken` / `jwt` cookies at the edge, so an unauthenticated request to `/chat` never renders a
  flash of protected UI before redirecting.
- **SEO is treated as a feature**: dynamic `sitemap.ts`, a separate post sitemap segment, and `robots.ts`.
  The post sitemap authenticates to the backend with a shared secret header (`x-sitemap-secret`) so that
  sitemap-only endpoints are not publicly enumerable.
- **The link-preview API key never reaches the browser** — previews are fetched through
  `app/api/link-preview/route.ts`, a server route, and the key is deliberately not `NEXT_PUBLIC_`.
- **Types are shared, not copied.** `src/Breads-Shared` is a git submodule pointing at
  [Breads-Shared](https://github.com/NguyenAnhDuc1711/Breads-Shared); API paths and enums come from the same
  source the backend compiles against.

## Getting started

```bash
git clone --recurse-submodules https://github.com/NguyenAnhDuc1711/Breads-Fe.git
cd Breads-Fe
cp .env.example .env.local     # fill in the values
npm install
npm run dev                    # http://localhost:3000
```

> Without `--recurse-submodules` the `src/Breads-Shared` directory stays empty and the build fails.
> If you already cloned, run `git submodule update --init --recursive`.

### Environment

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | client | Breads-Be origin |
| `NEXT_PUBLIC_APP_URL` | client | this app's own origin — `metadataBase`, sitemap, robots |
| `LINKPREVIEW_API_KEYS` | **server only** | comma-separated linkpreview.net keys |
| `SITEMAP_SHARED_SECRET` | **server only** | must match `SITEMAP_SHARED_SECRET` on Breads-Be |

## Docker

```bash
docker compose up -d --build
```

## CI/CD

GitHub Actions runs CI and CodeQL on every push; a green run on `master` triggers an SSH deploy to the VPS,
which pulls, updates submodules and rebuilds the container.

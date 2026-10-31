@AGENTS.md

# Brescia Lions — Official Website + Admin Panel

Cricket club website (tagline: "Un simbolo, una città, una famiglia", hashtag #OrgoglioDiBrescia, "One City. One Identity.").
Public website for fans + a private Admin Panel for the club team to manage all content without a developer.
Frontend and backend both live in this single Next.js project. There is NO separate backend folder.

## Working with the user
- The user writes in Hinglish (Roman Urdu/Hindi + English). Reply in the same style, keep answers short and simple.
- The user is used to NestJS (controller / service / schema). Keep that mental model.
- Do not start big implementation steps without the user's go-ahead; confirm the plan first.

## Stack
- Next.js 16 (App Router, `src/` dir), React 19, TypeScript (strict)
- Tailwind CSS v4 via `@tailwindcss/postcss` (`postcss.config.mjs`). Do NOT use `@tailwindcss/turbopack`.
- The config is `next.config.mjs` (plain JS, NOT .ts) and `npm run build` is `next build --webpack`: the Hostinger server (brescialionst10.com) has an old glibc, so the native SWC binary cannot load, Turbopack is unavailable and a `next.config.ts` could not be compiled there. Keep it that way. Do NOT enable `cacheComponents` / `partialPrefetching` unless the user asks.
- MongoDB with Mongoose
- Zod for validation
- Cloudinary for images (confirmed; MongoDB stores only URLs)
- Email: SMTP via nodemailer (admin OTP emails in Phase 7, contact form in Phase 10). User provides keys in `.env.local` (never in chat)
- Hosting: undecided, ignore for now. User provides all secrets (MongoDB, Cloudinary, SMTP) in `.env.local`; never hardcode or commit them.
- Auth (DECIDED): there is exactly ONE admin account. Website visitors have NO login, signup or accounts. No seed user, no roles, no Users section/module.
  - First-time setup at `/admin/setup`: the admin creates their own account (email + password) and verifies the email with an OTP sent to the email they typed. It works only while no admin exists (permanently closed after). Optional lock: env `ADMIN_EMAIL`, when set, restricts setup to that one email (use it on the live site, or create the admin immediately after deploying).
  - After the setup OTP is correct the admin is NOT logged in automatically: `/admin/setup` sends them to `/admin/login?created=1` (green "account is ready" message) and they log in with the email + password they chose; a password reset likewise ends on `/admin/login?reset=1`. The user asked for exactly this flow.
  - Login at `/admin/login` with email + password (bcrypt), session in an httpOnly JWT cookie (`JWT_SECRET`).
  - Forgot / reset password: enter email, receive a 6-digit OTP by email, enter OTP, set new password. OTP is stored hashed, expires in 10 minutes, max 5 wrong attempts, resend cooldown; the response never reveals whether the email exists.
  - No signup API/route other than the one-time setup. Every mutating route still calls `requireAdmin()`.
- Custom Tailwind admin UI (no shadcn/ui) — site is small
- Next 16 note: `middleware.ts` is now `proxy.ts`. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.

## Theme (from the crest: golden crowned lion, Colosseum, Italian flag, cricket ball on deep green)

| Token | Value | Used for |
|---|---|---|
| Dark green | `#062A17` / `#0B3D22` | Page background, menu, footer |
| Light green | `#12572F` | Cards and sections |
| Gold | `#D4A73A` → `#F3D27A` | Headings, buttons, borders, highlights |
| Italian flag | green `#1F8A3C`, white, red `#C8272D` | Thin strip at the top of every page, small badges |
| Text | white or cream `#F7F1E1` | Body text |

Define these as tokens in `src/app/globals.css` (`@theme`), never hardcode hex in components.

### Fonts
- Headings: **Cinzel** (Roman, royal, matches the crest)
- Body, menu, buttons: **Montserrat**
- Load both with `next/font/google` in `src/app/layout.tsx`.

### Style
- Big classic gold headings
- Cards with rounded corners and thin gold borders
- Crest shown in top menu, main banner, footer and next to every Brescia Lions match
- Mobile first and fully responsive (360px phones up to desktop, no horizontal scroll): menu becomes a ☰ button, cards stack vertically. Check every new page at 360/390px and tablet width before calling a phase done.
- Sticky top menu: Home · About Us · Squad · Fixtures · Results · News · Gallery · Contact (+ "Follow Us" button)

## Public pages (`app/(site)`)
- **Home** (one scrolling page): Top menu → Main banner slider (auto-changing slides) → Upcoming matches (next 3 cards) → Latest news (3 newest) → About the Lions (+ key numbers: founded, players, matches, wins) → Meet the Squad (slider) → Photo gallery (lightbox) → Sponsors → Footer
- **About Us**: history, crest story, mission/vision, owners/management, coaching staff
- **Squad**: all players + staff, filter by role, player detail page (bio, batting/bowling style)
- **Fixtures & Results**: tabs All / Upcoming / Results, Won/Lost label, points table on the side with Brescia Lions highlighted
- **News**: filter by category + search; story page with share buttons (WhatsApp, Facebook, X) + related stories
- **Gallery**: albums → album page
- **Contact**: form (name, email, message) + club email/phone/address/map. Message is emailed AND saved in admin
- **Footer** (every page): crest, quick links, contact, social icons (Instagram, Facebook, X, YouTube, TikTok), email subscribe box, privacy/terms
- SEO (sitemap, meta, Open Graph for WhatsApp/social sharing), https, fast images

## Admin panel (`app/admin`, password protected)
Sections: Dashboard (counts), Main Banner, News (draft/publish), Matches, Results, Points Table, Squad, Gallery (albums, bulk upload), Sponsors, About Us, Messages (+ subscribers), Settings (contact, socials, footer). There is no Users section (single admin).
Extras: drag & drop images (auto resize), "Are you sure?" before every delete, search in every list.
Anything saved appears on the website immediately (use `revalidatePath` / `revalidateTag`).

## Folder structure

```
brescia/
├── public/images/ (logo.png, placeholder-player.png), og-default.jpg
├── src/
│   ├── app/
│   │   ├── layout.tsx, globals.css, sitemap.ts, robots.ts
│   │   ├── (site)/                 # PUBLIC website: layout (flag strip + Navbar + Footer),
│   │   │                           # page (home), about, squad[/[slug]], fixtures, results,
│   │   │                           # news[/[slug]], gallery[/[slug]], contact, not-found
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   └── (panel)/            # layout (sidebar + auth check), Dashboard, and per section:
│   │   │                           # banners, news, matches, points-table, squad, gallery,
│   │   │                           # sponsors, about, messages, settings
│   │   │                           # (list page.tsx, new/page.tsx, [id]/page.tsx)
│   │   └── api/                    # route.ts = CONTROLLER (REST endpoints)
│   │       ├── articles/ (route.ts, [id]/route.ts)
│   │       ├── banners/ matches/ standings/ players/ gallery/ sponsors/
│   │       │   about/ messages/ subscribers/ settings/ auth/
│   │       └── upload/route.ts     # image upload + delete
│   ├── modules/                    # SERVICE + SCHEMA, one folder per feature
│   │   ├── articles/ (article.schema.ts, article.dto.ts, article.service.ts)
│   │   └── banners, matches, standings, players, gallery, sponsors, about,
│   │       messages, subscribers, settings, auth  (auth = admin account + OTP)  (same 3 files each)
│   ├── components/
│   │   ├── ui/       # Button, Card, Badge, Modal, ConfirmDialog
│   │   ├── site/     # Navbar, Footer, HeroSlider, MatchCard, NewsCard, PlayerCard,
│   │   │             # GalleryGrid, Lightbox, SponsorsRow, PointsTable
│   │   └── admin/    # Sidebar, DataTable, ImageDropzone, RichTextEditor, section forms
│   ├── lib/          # db.ts, auth.ts (requireAdmin), upload.ts, mail.ts, utils.ts
│   └── proxy.ts      # protects /admin/*
├── .env.local        # MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, CLOUDINARY_*, EMAIL_*
└── next.config.ts, postcss.config.mjs, tsconfig.json, package.json
```

## Architecture rules (NestJS-style)
- `modules/<feature>/<feature>.schema.ts` — Mongoose schema (like a NestJS entity)
- `modules/<feature>/<feature>.dto.ts` — Zod validation for create/update input
- `modules/<feature>/<feature>.service.ts` — business logic + all DB queries
- `app/api/<feature>/route.ts` — acts as the controller: check admin, validate with DTO, call service, return response. Keep it thin; no DB queries here.
- No separate `*.controller.ts` files (route.ts is the controller).
- Public pages (Server Components) call `*.service.ts` functions directly — never fetch our own API.
- Admin forms call the REST API with `fetch("/api/...")`.
- Every mutating route (POST/PATCH/DELETE, upload) must call `requireAdmin()` itself; `proxy.ts` is not enough.
- Every create/update/delete in admin must revalidate the affected public pages.
- Drafts (e.g. unpublished news) must never be returned to public pages.
- Slugs are used in public URLs (`/news/[slug]`, `/squad/[slug]`, `/gallery/[slug]`).
- Images: upload via `/api/upload` → Cloudinary → save URL in DB; deleting a record should also delete its image.
- Path alias: `@/*` → `src/*`.

## Content note
Player photos, news, teams and scores in the proposal are samples only; real content is added by the club via the admin panel.

## Out of scope for v1 (possible later)
Online shop, live scores, ticket booking, Italian language version, videos section.

## Build phases (strictly step by step, NO parallel work)
Two stages: Phases 1-6 build the WHOLE website with static sample data (user approves the design at Phase 6). Phases 7-10 add the backend, admin panel and APIs and make everything dynamic.

The user tests after every phase. Build one phase at a time. After each phase run `npm run build` and `npm run lint`, check mobile (360/390px) and tablet, report what was built and what the user should test, then WAIT for the user's go-ahead before the next phase. Only touch files that belong to the current phase.

**Static-stage rule (so Phases 7-10 are easy):** pages must NOT hardcode data. Define types and put sample data in `src/data/`. Pages (Server Components) get data only through the `modules/<feature>/<feature>.service.ts` functions (e.g. `getLatestNews()`), which return the sample data for now. In Phases 8-9 only the service internals change to read MongoDB; page code stays the same. Forms (contact, subscribe) are visual only until Phase 10.

| # | Phase | Stage | What the user tests |
|---|---|---|---|
| 1 | **Foundation:** theme, fonts, Navbar/Footer/flag strip, common UI (DONE) | Static | Design, colours, mobile menu |
| 2 | **Home page (DONE):** banner slider (auto-changing), upcoming matches, latest news, about, squad slider, gallery, sponsors | Static | Whole home page on desktop and phone |
| 3 | **News** (list, filter, search, detail, share buttons) + **Contact** page (DONE) | Static | News pages, contact page layout |
| 4 | **Fixtures & Results** (DONE) (tabs, Won/Lost, points table) + **About Us** page | Static | Fixtures, results, points table, About |
| 5 | **Squad** (DONE) (role filter, player detail) + **Gallery** (albums, album page, lightbox) | Static | Squad and gallery pages |
| 6 | **Polish (DONE):** SEO (meta, sitemap, OG), 404/loading states, mobile pass, full review. User approves the design here | Static | Whole website end to end |
| 7 | **Backend foundation (DONE):** single-admin auth (`/admin/setup` first-time account + email OTP verify, login, forgot/reset password with email OTP, `proxy.ts`, `requireAdmin()`), SMTP mail helper, Cloudinary upload/delete, admin layout + sidebar + Dashboard | Backend | Create the admin account, OTP email arrives, login/logout, forgot + reset password, `/admin` blocked without login, upload |
| 8 | **Dynamic (DONE, awaiting user test):** News, Banners, Gallery (schema, dto, service, API routes, admin pages; website now reads from MongoDB) | Backend | Add/edit/delete news, banner, album; see it on the site |
| 9 | **Dynamic (DONE, awaiting user test):** Matches + Results + Points Table (teams), Squad + Staff, Sponsors, About Us, Settings | Backend | Same, for these sections |
| 10 | **Contact + Messages + Subscribers (DONE, awaiting user test)**, contact form email, final security check (`requireAdmin()` on every mutating route), testing | Backend | Form to admin inbox, subscribe, full test |

## HANDOFF NOTE (read first in a new session)
Where the project stands right now (the site builds with 0 type errors):
- Phases 1-10 are done (Phases 8, 9 and 10 await the user's own test). Everything is admin-managed and read from MongoDB. NOT done on purpose: deleting `src/data/` + the demo seed (ask the user first, only at client handover; "Load demo content" stops working after that).
- The user has not created the admin account yet. Setup is at `/admin/setup` (any email gets the OTP; `ADMIN_EMAIL` is optional). The real database `brescia` already holds the demo news/banners/albums (flagged `isDemo`).
- Home page order now: banner slider, Upcoming Fixtures ("Coming Soon" card, schedule not announced), Latest News slider, About, Meet the Squad slider, Photo Gallery, Our Sponsors (sample sponsors), footer. A "Join the Pride" band was tried and REMOVED at the user's request; do not add it again unless asked.
- Nothing is hard-coded about the league any more: with no matches the pages show "Fixtures Coming Soon" / "Results Coming Soon", and with no teams added the points table shows only the Lions on zero. (`src/data/matches.ts` and its `LEAGUE_STARTED`/`SCHEDULE_ANNOUNCED` flags were deleted in Phase 9.)
- The live Vercel demo (https://brescia-nine.vercel.app) is an OLD static build and does not have the admin/backend; redeploying needs the env vars listed below in the Status section.
- How the user likes to work (Hinglish): keep replies short; for SMALL tweaks only run `tsc` + `eslint` (and a quick look) and say so, do NOT run full browser test suites; use the full API/browser tests only for big or risky work (auth, database, admin, deploy). Do not start big work without a go-ahead; if the user says "stop", stop immediately. Never `taskkill chrome.exe`.

## Status
Phases 1-7 are DONE. Phase 8 (News, Banners and Gallery) was verified earlier and Phase 9 (Matches/Results/Points Table, Squad + Staff, Sponsors, About Us, Settings) is built on the same pattern: schema, dto, service, REST routes, admin pages, and the website reads MongoDB. Phase 9 is verified in dev and production mode against a temporary test database: 111 API checks (dev server) and 59 browser UI checks (production build, headless Chrome, incl. 390px no-horizontal-scroll on 14 pages and Italian-time conversion; 3 further browser checks were wrong test selectors, not app bugs); build, lint and tsc pass. Both phases await the user's own test. Phase 10 is built and verified too (see Phase 10 notes).

The user creates the admin account at `/admin/setup` with any email they can open (`ADMIN_EMAIL` is optional and currently empty). The real `brescia` database has no admin and no content yet (only empty collections); after creating the account the admin clicks "Load demo content" on the Dashboard to fill News, Banners and Gallery with samples. The live Vercel demo (https://brescia-nine.vercel.app) is still the OLD static build: before redeploying, add the env vars on Vercel (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `CLOUDINARY_*`, `EMAIL_*`).

Phase 8 notes:
- Modules `articles`, `banners`, `gallery` each have `*.schema.ts`, `*.dto.ts`, `*.service.ts`; public pages call the same services, which now read MongoDB (public functions only return published/active/non-empty items; admin functions are `*ForAdmin`). Types still live in `*.types.ts` and carry `isDemo` + `imagePublicId`.
- REST routes (all wrapped in `withAdmin`, bodies validated with zod): `/api/articles[/id]`, `/api/banners[/id]` + `/api/banners/reorder`, `/api/gallery[/id]` + `/photos` + `/photos/[photoId]` (PATCH `{cover:true}`, DELETE), `/api/seed` (`{action:"load"|"remove"}`). After every change the controller calls `revalidateSite()` (`lib/cache.ts`, `revalidatePath("/", "layout")`) so the pre-built public pages update at once.
- Rules: update DTOs have NO `.default()` (a PATCH must not reset fields); article HTML is sanitized on save (`lib/html.ts`, sanitize-html: no scripts, event handlers, iframes, outside images); only images from our own Cloudinary folder are accepted (`lib/images.ts` `imageDto`); a story cannot be published without a cover; slugs are unique (auto `title`, `title-2`...); replacing/deleting an item deletes its Cloudinary image (demo images have no `publicId`, so nothing is deleted); button links must be `/page` or `https://`.
- Demo content: `modules/seed/seed.service.ts` copies `src/data/{articles,banners,gallery}.ts` into MongoDB flagged `isDemo`; "Remove demo content" deletes only flagged records. Keep `src/data/` and the seed until client handover, then delete both (Phase 10). Matches, squad, sponsors and About Us moved to MongoDB in Phase 9 (see Phase 9 notes); the demo seed also covers sponsors, players and coaching staff.
- Admin UI: `ArticleForm` + `RichTextEditor` (Tiptap v3: bold/italic/underline, H2/H3, lists, quote, link, image upload), `BannerForm`/`BannerList` (up/down order, live/hidden switch), `AlbumCreateForm`/`AlbumManager` (multi-photo upload 3 at a time, make cover, delete photo/album), `DeleteButton` (confirm dialog), light-panel primitives in `components/admin/ui.tsx`. `ImageDropzone` takes `persistedPublicId`: removing the saved image only clears the form (server deletes it on save), removing a fresh upload deletes it at once. Browser helpers: `lib/image-client.ts`.
- Home page sliders: the hero banner always autoplays every 5 s (no pause on hover; a manual click on a dot/arrow restarts the timer). "Latest News" loads the 12 newest stories (featured first); with more than 3 it becomes a `ScrollRow scrollbar` slider (3 cards on desktop, 2 on tablet, ~1 with a peek on phone; swipe, arrows and a thin gold scrollbar), with 3 or fewer it stays a plain 3-column grid. `/news` still lists everything in a filterable grid.
- Home page: shows the default crest slide (`modules/banners/default-banner.ts`) when no banner is live, a "No news yet" line, and hides the gallery section when empty. Empty public sections never crash.
- There is NO `loading.tsx` in `(site)`: with it, `notFound()` returned HTTP 200 (soft 404) because the page had already started streaming. Do not add it back.
- `next typegen` must be run after adding new routes so `RouteContext`/`PageProps` types exist.

Production-readiness notes (after Phase 10):
- Added `/privacy` and `/terms` (shared `LegalPage`, date constant `LEGAL_UPDATED` in `components/site/LegalPage.tsx`; text is a general GDPR-style template, the club should have it reviewed), footer links, sitemap entries and consent lines under the contact and subscribe forms. The only cookie is the admin session cookie; the Contact page Google Maps iframe is mentioned in the privacy text.
- `next.config.ts` now sets security headers (nosniff, SAMEORIGIN, referrer policy, permissions policy, HSTS) and `poweredByHeader: false`; no strict CSP on purpose (Google Maps iframe + Next inline scripts). Added `app/global-error.tsx` and `app/admin/(panel)/error.tsx`.
- `.env.example` documents every variable (`.gitignore` keeps it tracked); `README.md` has the run/deploy/launch checklist (Vercel env vars, `ADMIN_EMAIL` lock, `NEXT_PUBLIC_SITE_URL`, `ALLOW_INDEXING=true` only on launch day). Dashboard System status has a "Website address" row (red while `NEXT_PUBLIC_SITE_URL` is missing).
- Verified in a production build with launch env: security headers present, robots/sitemap/canonical use the real URL, 404s are real 404s, `/admin` redirects, no secret found in the built client/static output, `npm audit` 0 vulnerabilities.
- NOT done (needs the user): deploying to Vercel (env vars hold secrets), rotating the Cloudinary secret that was pasted in chat, real content, legal review, deleting `src/data/` + seed at handover. Nothing is committed to git yet.

Phase 10 notes:
- Club email default is now `info@brescialionst10.com` (the official club email; first it was a test address) (`siteConfig.contact.email` in `lib/site.ts`; the admin can change it in Settings). Contact form messages are emailed to the Settings email.
- Modules `messages` and `subscribers` (schema/dto/service; `message.mail.ts` builds the HTML-escaped email, subject has no line breaks). Routes: `POST /api/messages` and `POST /api/subscribers` are the ONLY public mutating routes besides `/api/auth/*`; they check same-origin, validate with zod, have a hidden `website` bot-trap field (a filled trap returns success and saves nothing) and a per-visitor limit via `lib/rate-limit.ts` (counter in MongoDB with TTL: contact 5/hour, subscribe 10/hour, key = `x-forwarded-for` IP from `clientIp()`). Everything else (`GET/PATCH/DELETE /api/messages[/id]`, `GET /api/subscribers`, `DELETE /api/subscribers/[id]`, `GET /api/subscribers/export` CSV) is `withAdmin`.
- A saved message is kept even if the email fails (`emailed` flag, shown in the admin message page). The email is sent with `after()` and `replyTo` = the visitor. Subscribing twice looks identical to the visitor (no leak of who is subscribed). CSV export defuses cells starting with `= + - @`.
- Admin: `/admin/messages` (All/Unread, search; opening a message marks it read through `MessageActions`; reply = mailto link; mark unread; delete with confirm), `/admin/subscribers` (search, delete, Download CSV). Sidebar has Messages + Subscribers; Dashboard has Unread messages + Subscribers tiles. Public `ContactForm` and footer `SubscribeForm` post to the APIs with loading/error/success states.
- Security scan (a small script over `src/app/api/**/route.ts`): 67 handlers, all `withAdmin` except the 8 intended public ones (`/api/auth/{login,logout,setup,setup/verify,forgot,reset}`, `POST /api/messages`, `POST /api/subscribers`). Re-run this check after adding any route.
- Verified: 49 API checks (dev server) and 22 browser checks (production build, headless Chrome, 390px no horizontal scroll, one REAL email delivered through the SMTP account) against a temporary test database that was dropped afterwards; build, lint, tsc pass.
- `src/data/` and `modules/seed` still exist (Phase 8/9 demo content). Delete them only at client handover, after asking the user.

Phase 9 notes:
- New modules (each with schema/dto/service, controllers in `app/api/*`, all wrapped in `withAdmin`, all call `revalidateSite()`): `teams` (route `/api/teams`), `matches`, `players`, `staff`, `sponsors`, `about`, `settings`. Failures come back as `fail(code, message)` (`lib/result.ts`) and the controller turns them into responses with `serviceFailure` (`lib/api.ts` maps `not_found`, `not_allowed`, `slug_taken`, `name_taken`, `in_use`, `needs_image`, `invalid`).
- Teams + Points Table: one `Team` collection holds the badge details AND the table row (played/won/lost/points). The Lions team is created on first use (`ensureLionsTeam`, unique partial index on `isLions`) and cannot be deleted; a team that has matches cannot be deleted (409). The table is edited by hand in `/admin/points-table` (`TeamManager`), it is NOT updated automatically when a match result is saved (the match form reminds the admin). The public table is sorted by points, then wins; with no team in the database it shows only the Lions on zero.
- Matches + Results: one `Match` collection (`status` upcoming|completed). `/admin/matches` has tabs All/Upcoming/Results + search, "Add result" shows on upcoming matches whose time has passed. A finished match needs both scores, and a result (Won/Lost/Tie/No result, from the Lions' point of view) when the Lions play; an upcoming match clears scores/result. Match times are typed and shown in ITALIAN time whatever the admin's computer time zone is (`lib/datetime.ts`: `romeLocalToIso` / `isoToRomeLocal`). Public pages: upcoming = status upcoming AND date in the future.
- Squad: `Player` (name, slug, number, role, captain, batting/bowling style, bio, photo 900x1200) and `Staff` (coaching/support: name, slug, role, short line, profile, experience, speciality, photo, `order`). Public player list is sorted by shirt number; staff by `order` (up/down arrows in the admin, `/api/staff/reorder`). Only one captain: making a player captain removes the badge from the old one. Slugs are generated once and stay the same when someone is renamed. `/admin/squad` shows players (search + role chips) and staff on one page; staff reorder arrows are hidden while searching. The old "management" sample list was dropped (the About page only ever showed the owner block).
- Sponsors: `Sponsor` (name, https link, logo, `active`, `order`) with the same up/down + live/hidden switch (`OrderedList` component, shared with staff). The home page shows an "Our Sponsors" row (above "Partner with the Lions") only when at least one sponsor is live.
- About Us: ONE `About` document; every field is optional and a missing field falls back to `modules/about/about.defaults.ts` (the real club text), merged field by field in `getAbout()`. `/admin/about` (`AboutForm`) edits home intro, key numbers, story, owner, crest cards and mission/vision; paragraph boxes use a blank line between paragraphs; removing a picture goes back to the default picture. The coaching staff on `/about` come from the Staff collection.
- Settings: ONE `Settings` document: email, phone (optional), address (drives the map), five social links, footer line. `siteConfig` in `lib/site.ts` stays as the default; a never-saved field uses it, an empty saved social link HIDES that icon. Footer and `/contact` are async server components reading `getSiteSettings()`.
- Demo seed now also loads 5 sponsors, 15 players, 7 coaches (all flagged `isDemo`, so "Remove demo content" deletes them) and makes sure the Lions team exists. `src/data/matches.ts` was deleted (no sample fixtures any more); `src/data/{about,players,sponsors}.ts` are still needed by the seed until Phase 10.
- Empty states handled: no players hides the home squad slider and `/squad` says "The squad will be announced soon."; no staff hides the Coaching Staff block on `/about`; no sponsors hides the sponsors row.
- `app/admin/(panel)/layout.tsx` has `export const dynamic = "force-dynamic"` on purpose: without it `next build` also ran the admin page bodies (in parallel with the login check) and `ensureLionsTeam()` wrote a Lions row into the database during the build. Keep it, and never put database WRITES in code that public/static pages call.
- All public pages are rendered per request: `app/(site)/layout.tsx` and `app/sitemap.ts` have `export const dynamic = "force-dynamic"`, and the `generateStaticParams` functions were removed. Reason: the home page used to be pre-built at deploy time and on Hostinger `revalidatePath` did not refresh it (home showed 4 stories while `/news` showed 7). Side effect: `next build` no longer needs the database. Home "Latest News" shows ALL published stories (100 max) in the ORDER THE ADMIN SETS: `Article.order` (smallest first, fallback `publishedAt` desc then `createdAt` desc), changed with the ▲ ▼ arrows on `/admin/news` (`ArticleOrderButtons`, `POST /api/articles/reorder`; arrows only in the unfiltered list). A new story gets the first position (`createArticle` uses `ensureOrder()` + min order - 1); old stories without `order` are numbered once by `ensureOrder()` when the admin list or a create runs (public pages never write). The "Show on homepage" tick no longer changes anything.
- Hosting reality: the club site is deployed on Hostinger (Node 24, build = `npm run build`, env vars from the host's `.env`). `withAdmin` has a default context type `{ params: Promise<object> }` so `next build --webpack` type checks the route handlers.
- Testing gotcha: with `NEXT_DIST_DIR=.next-test`, `next dev` rewrites `.next-test/dev/logs` on every request and its own watcher treats that as a code change, so a real browser page reloads in an endless loop (HMR "Fast Refresh rebuilding"). This is a test-setup artifact, not an app bug. For browser tests build with `NEXT_DIST_DIR=.next-test next build` and run `next start -p 3100` (production mode); `MAIL_MODE=console` only works in dev, so create the test admin with a dev server first (or API tests) and reuse it.

Phase 7 notes:
- Env names in use: `MONGODB_URI`, `JWT_SECRET` (96 chars, generated; must be >= 32), `ADMIN_EMAIL`, `CLOUDINARY_*`, `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` (Gmail app password; optional `EMAIL_FROM`). The old `SMTP_*` lines in `.env.local` are unused. `MAIL_MODE=console` (dev only) prints emails to the server log instead of sending.
- Auth code: `modules/auth/` (`admin.schema.ts`, `auth.dto.ts`, `otp.ts`, `auth.mail.ts`, `auth.service.ts`), `lib/auth.ts` (session cookie `brescia_admin`, `getCurrentAdmin`, `requireAdminPage`, `withAdmin`), `lib/session-token.ts` (jose JWT, shared with `proxy.ts`), `lib/api.ts` (`parseBody`, `apiError`, same-origin check), `lib/mail.ts` (nodemailer). Routes: `/api/auth/{setup,setup/verify,login,logout,forgot,reset}`, `/api/upload` (POST multipart, DELETE json) wrapped in `withAdmin`.
- Rules implemented: single admin enforced by a unique `singleton` field; setup only while no verified admin exists; `ADMIN_EMAIL` is now OPTIONAL: if empty, ANY email typed on `/admin/setup` gets the OTP and the first person to verify becomes the admin (the user asked for this); if set, only that email may create the account (recommended on the live site, since until the admin exists anyone could open `/admin/setup` first); OTP 6 digits, HMAC-hashed, 10 min expiry, 5 attempts (counted atomically), 60 s resend cooldown; login locks for 15 min after 5 failures; forgot-password never reveals whether the email exists (code is sent via `after()`); password reset bumps `sessionVersion`, which logs out old sessions; passwords min 10 chars with a letter and a number; bcrypt cost 12.
- Admin UI: `app/admin/(auth)/{login,setup,forgot-password}` (dark brand theme, forms in `components/admin/auth/`), `app/admin/(panel)/` (light theme `bg-paper text-ink`, `Sidebar` with disabled "Soon" items until each section is built, `LogoutButton`, Dashboard with system status + a temporary "Image upload check"). `ImageDropzone` (`components/admin/ImageDropzone.tsx`) resizes big photos in the browser (max 2400px, webp) and uploads to `/api/upload` (limit 4 MB because Vercel allows 4.5 MB bodies); Cloudinary folders are `brescia/<folder>`; uploads are checked by file signature. In Phase 8+ use `ImageDropzone` in the News/Banner/Gallery forms and delete the temporary `AdminUploadCheck`. Light-panel buttons: `Button` variants `dark` and `outlineDark`.
- `next.config.ts` allows `res.cloudinary.com/<cloud>/**` images and has a `NEXT_DIST_DIR` switch so a second dev server (for tests) can run beside the normal one; `.next-test/` is git-ignored and eslint-ignored.
- Gotcha: Next allows only ONE `next dev` per folder. If a stale background server holds port 3000, the user's own `npm run dev` does nothing and they keep seeing old code. Check `netstat -ano | grep :3000` and the process start time before blaming the code; stop only that PID.
- Testing tips: run `NEXT_DIST_DIR=.next-test MONGODB_URI=<...brescia_test...> ADMIN_EMAIL=... MAIL_MODE=console npx next dev -p 3100`, never test against the real `brescia` database. NEVER `taskkill /IM chrome.exe` (it closes the user's own Chrome); kill only the specific PID.

Notes for all phases:
- Home page: HeroSlider with 7 sample slides (autoplay, dots, arrows, swipe; mobile has an extra dark overlay for text contrast), upcoming matches, latest news, about, squad slider, photo gallery with lightbox, sponsors.
- Types live in `modules/<feature>/<feature>.types.ts`; sample data in `src/data/*.ts`; services in `modules/<feature>/<feature>.service.ts` (async, return sample data now). Only services read `src/data/`. `src/data/` is deleted when the services move to MongoDB (Phases 8-9).
- Sample match/article dates are relative to today (`src/data/helpers.ts`), so "upcoming" always has data.
- Sample photos are free-licence Pexels photos in `public/images/sample/<pexels-id>.jpg`, for the client demo only (avoid photos with foreign flags or tournament branding). Real photos come from the admin panel.
- Phase 3: `/news` filters by category chips + search using plain links and a GET form (`?category=...&q=...`, no client JS). `/news/[slug]` has share buttons (WhatsApp/Facebook/X), related stories, OG metadata, and `generateStaticParams`; draft articles return 404. Article HTML is rendered with `.article-content` styles in `globals.css` (sanitize the HTML on save in Phase 8). `PageHeader` is the title band for all inner pages.
- Phase 4: `/fixtures` (tabs All / Upcoming via `?tab=upcoming`) and `/results` share `FixturesView` (match rows + sticky points table with Brescia highlighted; tab links: All -> /fixtures, Upcoming -> /fixtures?tab=upcoming, Results -> /results). Won/Lost/Tie/No-result badges are from the Lions' point of view. Match service: `getUpcomingMatches`, `getResults`, `getAllMatches`, `getStandings`. `/about` has Our Story, Story Behind The Crest (6 crest elements), Mission & Vision, Owners & Management, Coaching Staff (silhouette placeholders until photos are uploaded; `StaffCard`). Home page `AboutSection` and `/about` share `StatsList`.
- Phase 5: `/squad` filters by role with `?role=` (chips via the generic `FilterChips`), shows a Support Staff section (from `about.coaching`, only when no role filter). `/squad/[slug]` has photo, shirt number, role/captain badges, batting/bowling style, profile and teammates. `/gallery` lists albums (`AlbumCard`), `/gallery/[slug]` shows `PhotoGrid` with the shared `Lightbox` (also used by the home `PhotoMosaic`; keys: Esc, left/right arrows). Services added: `getPlayers(role)`, `getPlayerBySlug`, `getRelatedPlayers`, `getSupportStaff`, `getAlbums`, `getAlbumBySlug`.
- Sliders (`ScrollRow`): arrows appear only when there is something to scroll to (hidden when everything fits, left arrow only after scrolling, right arrow disappears at the end); `/squad` Support Staff is a `ScrollRow scrollbar flush gap="gap-4 sm:gap-5"` whose cards use EXACTLY the same columns/widths/gaps as the players grid above (4 on desktop, 3 on tablet, 2 on phone: `lg:w-[calc(25%-0.9375rem)]` etc.), so they line up pixel for pixel; with more than 4 coaches the extra ones are reached by the slider (verified: 7 sample coaches).
- League not started: `LEAGUE_STARTED = false` in `src/data/matches.ts` removes the sample results and puts every team on 0/0/0/0 in the points table (note under the table says the league has not started); `/results` and the Fixtures page show `ComingSoonCard` ("Results Coming Soon" / "Fixtures Coming Soon"). About stats show 0 matches / 0 wins and the history text no longer claims wins. Still inconsistent demo content seeded in MongoDB (kept on purpose, user said keep dummy for now): news match reports ("Lions roar to a 6-wicket win", "Lions battle past Torino Kings"), banner 5 "Celebrate Every Win - Five wins from six", and the "Preview" story. Offer to rewrite them before launch.
- Schedule not announced: `SCHEDULE_ANNOUNCED = false` in `src/data/matches.ts` switches the sample upcoming matches off, so the home "Upcoming Fixtures" section and `/fixtures` (All + Upcoming tabs) show the `ComingSoonCard`. The same card appears automatically whenever there is no upcoming match (also once the data comes from MongoDB in Phase 9). The played results and the points table are still sample data (ask the user whether to hide them too).
- Staff profiles: coaching staff cards (on `/squad` and `/about`, plain grid, no slider) open `/squad/staff/[slug]` (photo 3:4 like players, Role/Experience/Speciality cards, profile text split on blank lines, other staff, canonical + OG metadata, in the sitemap). `StaffCard` takes `href`; owners/management on `/about` stay non-clickable (no profile page). `StaffMember` has `slug`, `profile`, `experience`, `speciality`; `player.service` has `getSupportStaff/getStaffBySlug/getStaffSlugs` (slug = `slugify(name)`). Phase 9: staff become admin-managed together with the squad (same photo size 900x1200, 3:4).
- Sample player photos are anonymous stock cricketers; avoid photos with other nations' kits or sponsor branding when swapping.
- Phase 6: SEO and states. `src/app/layout.tsx` has default OG/Twitter metadata + `metadataBase`; `public/og-default.jpg` (1200x630), `src/app/icon.png` + `apple-icon.png` are generated from the crest. `sitemap.ts` lists all pages, published news, players and albums. `robots.ts` and the `robots` meta are `noindex` UNLESS the env `ALLOW_INDEXING=true` is set (set it, plus `NEXT_PUBLIC_SITE_URL`, only at real launch). JSON-LD: `SportsTeam` on home, `NewsArticle` on article pages (`JsonLd`). Canonical on home and article. 404: `app/not-found.tsx` (with Navbar/Footer) and `(site)/not-found.tsx`; `(site)/error.tsx` (try again) and `(site)/loading.tsx` (skeleton); skip-to-content link in `(site)/layout.tsx`; first images in lists use `priority`.
- Deployment: demo is live on Vercel at https://brescia-nine.vercel.app (account `waliiqbal2020-3486`, team `wali-iqbals-projects`, project `brescia`, linked locally in `.vercel/`, which is git-ignored). Deployed with the CLI (`npx vercel deploy --prod --yes`) because the GitHub connection was not set up. Production env set on Vercel: `NEXT_PUBLIC_SITE_URL`. `ALLOW_INDEXING` is intentionally NOT set (site stays noindex). In Phases 7+ add `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `SMTP_*` on Vercel too (`vercel env add NAME production`), then redeploy.
- Footer "Privacy Policy · Terms" are plain text (no pages yet).
- `/contact` form is visual only: it shows a thank-you message but sends nothing and saves nothing until Phase 10 (then POST `/api/messages`, saved in admin + emailed). The map is a Google Maps embed (no API key) of `siteConfig.contact.address`.
- Next 16 conventions used: `PageProps<"/route">` global type, `await props.params` / `await props.searchParams`.
- `NEXT_PUBLIC_SITE_URL` (optional env) sets the absolute site URL for share links and OG tags; default `http://localhost:3000`. Set it before deploying.
- `.env.local` is filled (MongoDB verified, Cloudinary, JWT_SECRET; email uses EMAIL_HOST/PORT/USER/PASS; ADMIN_EMAIL still empty). Real crest `public/images/logo.png` and hashtag `public/images/hashtag.png` (paths in `src/lib/site.ts`; originals in `design-assets/`). Footer subscribe form is visual only until Phase 10.
- Testing tip: headless Chrome via DevTools protocol works for screenshots at 390px / 1280px; in Git Bash set `MSYS_NO_PATHCONV=1` when passing URL paths as arguments.
- Next dev badge "N" in the corner is dev only.

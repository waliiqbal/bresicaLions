# Brescia Lions — website and admin panel

Public website for fans plus a private admin panel for the club team. Built with
Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, MongoDB (Mongoose),
Zod, Cloudinary and nodemailer. Frontend and backend live in this one project.

## Run it on your computer

1. Install Node.js 20 or newer.
2. `npm install`
3. Copy `.env.example` to `.env.local` and fill in the values (see below).
4. `npm run dev` and open http://localhost:3000
5. First time only: open http://localhost:3000/admin/setup, type your email and a password,
   enter the 6-digit code that arrives by email, then log in at `/admin/login`.
6. On the Dashboard click **Load demo content** to fill the site with samples
   (and **Remove demo content** when you are ready for the real content).

Useful commands: `npm run build` (production build), `npm run lint`, `npx tsc --noEmit`.

## Environment variables

See `.env.example` for every name with a short explanation. Secrets live only in `.env.local`
(never committed) and on the hosting provider.

## Put the website live (Vercel)

1. Push the project to GitHub and import it in Vercel (framework: Next.js, defaults are fine).
2. In Vercel > Project > Settings > Environment Variables add every variable from
   `.env.example` for **Production**. Important ones:
   - `MONGODB_URI`: in MongoDB Atlas > Network Access allow Vercel (`0.0.0.0/0`).
   - `JWT_SECRET`: a new random text of 64+ characters (do not reuse the local one).
   - `ADMIN_EMAIL`: the one email allowed to create the admin account.
   - `NEXT_PUBLIC_SITE_URL`: the real address, for example `https://www.brescialions.it`.
   - `CLOUDINARY_*` and `EMAIL_*`.
   - Do **not** set `MAIL_MODE`.
3. Deploy. Then immediately open `https://your-site/admin/setup` and create the admin account
   (until it exists, the `ADMIN_EMAIL` lock is what protects the setup page).
4. Log in, open **Settings** and check the club email, phone, address and social links.
5. Add the real content (News, Banners, Squad, Matches, Sponsors, About Us, Gallery).
   Use **Remove demo content** on the Dashboard to delete the sample content.
6. Launch day: set `ALLOW_INDEXING=true` in Vercel and redeploy so Google may list the site.
   Until then the site tells search engines to stay away.
7. Connect your own domain in Vercel > Domains (https is automatic).

## Before and after launch checklist

- [ ] Admin account created with a strong password, `ADMIN_EMAIL` set.
- [ ] Dashboard > System status: Database, Email, Image storage and Website address are all green.
- [ ] Send a test message from the Contact page: it must appear under Messages and arrive by email.
- [ ] Privacy Policy and Terms (`/privacy`, `/terms`) reviewed by the club (they are a general template).
- [ ] Demo content removed, real photos and text added.
- [ ] `ALLOW_INDEXING=true` set and site redeployed on launch day.
- [ ] Regularly download the subscriber list (Subscribers > Download CSV) and keep a MongoDB Atlas backup.

## Project layout

- `src/app/(site)` public pages, `src/app/admin` admin panel, `src/app/api` REST routes (controllers).
- `src/modules/<feature>` schema, DTO (Zod) and service (all database queries) for each feature.
- `src/components`, `src/lib` shared UI and helpers, `src/proxy.ts` first gate for `/admin`.
- `CLAUDE.md` holds the detailed project notes and decisions.

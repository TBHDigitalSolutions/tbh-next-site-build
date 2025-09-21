Great question—here’s the clean, “don’t-leak-secrets” way to set up your Google Maps key in a Next.js app.

# Where to put the env file

Create a file named **`.env.local`** at the **project root** (same folder as `package.json`):

```bash
# from your project root
touch .env.local
```

Put your key in it:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_REAL_BROWSER_KEY
```

Next.js automatically loads `.env.local` in dev and build—no extra config needed.

# Keep it out of GitHub

Most Next.js starter templates already ignore env files, but confirm your `.gitignore` has this (add it if missing):

```gitignore
# .gitignore
.env
.env*.local
```

If you accidentally committed an env file before, remove it from git tracking:

```bash
git rm --cached .env .env.local
git commit -m "Stop tracking env files"
```

(Then **rotate** the API key in Google Cloud Console—assume anything committed is compromised.)

# Use it on the page

Pass the key from the page to your map component (page-level data flow):

```tsx
// app/(main)/contact/page.tsx (snippet)
<LocationMap
  sectionTitle={location.sectionTitle}
  latitude={location.latitude}
  longitude={location.longitude}
  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
/>
```

> The `NEXT_PUBLIC_` prefix is required for **client-side** usage (the Google Maps loader runs in the browser).

# Production setup (no files committed)

Use your hosting provider’s env settings instead of committing files:

* **Vercel:** Project → Settings → Environment Variables →
  `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=…` (add to Preview & Production)
* **Netlify:** Site Settings → Build & deploy → Environment →
  add the same variable
* **Docker/Compose:** pass via `env_file` or `environment:` in your compose file (don’t commit the secret file)

# Optional: add a safe example file

Commit an **`.env.example`** (no real secrets) to help onboarding:

```dotenv
# .env.example
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=REPLACE_ME
```

# Optional guard (fail fast if missing)

Add a tiny runtime check where you read the var:

```ts
// src/lib/env.ts
export const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

if (process.env.NODE_ENV !== "production" && !GOOGLE_MAPS_KEY) {
  // eslint-disable-next-line no-console
  console.warn("[env] Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
}
```

And import that instead of reading `process.env` all over.

# Lock down your Google Maps key

Since this is a **public** browser key:

1. In **Google Cloud Console → Credentials → Your API Key**:

   * **Restrict key** → Application restrictions → **HTTP referrers**
     Add your local and prod origins (e.g., `http://localhost:3000/*`, `https://yourdomain.com/*`).
   * **API restrictions** → Restrict to APIs → **Maps JavaScript API** (and any others you actually use).
2. Set **quotas** if appropriate.

---

**Quick checklist**

* [x] Add `.env.local` at project root with your key
* [x] Ensure `.gitignore` ignores `.env*` files
* [x] Remove any accidentally tracked env files (`git rm --cached …`)
* [x] Use hosting provider env settings in production
* [x] Pass the key from the **page** to components (no component-level env reads)
* [x] Restrict the key in Google Cloud Console


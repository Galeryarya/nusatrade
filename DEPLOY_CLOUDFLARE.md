# NusaTrade — Cloudflare Pages (Static Export)

## Build

Use Node.js version compatible with the Firebase dependency installed (the current Firebase 13.x lockfile reports Node >=24.12). In a terminal:

```bash
npm ci
npm run build
```

Build output: `out/`. Upload **the contents of out/** or zip the contents of `out/` to Cloudflare Pages Direct Upload — not this source ZIP.

For deployment with a connected Git repository, set Build command: `npm run build`, Output directory: `out`, and set the `NEXT_PUBLIC_FIREBASE_*` environment variables in Cloudflare (for Git build). A local build reads `.env.local`.

## Notes

Product details now use `/products/detail?slug=...` so Firebase-generated products can load client-side without requiring Next.js to pre-render unpredictable dynamic product IDs.

Confirm Firebase Authentication > Authorized domains includes the actual `*.pages.dev` hostname and any custom domain. Check Firestore Security Rules separately. Browser-only app functions still depend on Firebase configuration and access rules.

`.env.local` must not be shared in a public source repository; it is excluded from the distribution ZIP. `NEXT_PUBLIC` keys are client-facing and not secret security credentials, but other credentials must never be bundled.

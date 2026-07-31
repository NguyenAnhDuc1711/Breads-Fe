# Do not delete this directory

This directory is intentionally empty (this README is not a valid page file, so
Next.js ignores it).

The app uses the **App Router** (`/app`). The legacy Vite view components still
live in `src/pages/`, and Next.js's `findPagesDir()` falls back to `src/pages`
as the **Pages Router** directory when no `./pages` exists — which would compile
every file in `src/pages/` as a route and break the build.

Keeping an empty `./pages` here shadows that fallback (Next.js prioritises
`./pages` over `./src/pages`), so `src/pages/*` stays what it is: plain
components imported by App Router route files.

Remove this only once `src/pages/` itself is gone.

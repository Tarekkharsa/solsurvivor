# Hosting

`npm run build` makes a static site in `dist/` with relative paths, so it works
at a domain root or in any sub-folder, and offline after the first visit.

## Option 1: GitHub Pages (from this repo)

1. In the repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Actions → Deploy to GitHub Pages → Run workflow** (`.github/workflows/pages.yml`, manual only).
3. The game appears at `https://<user>.github.io/solsurvivor/`.

## Option 2: Netlify or Cloudflare Pages

- Build command: `npm run build`
- Publish directory: `dist`

## Option 3: any web server

Copy the contents of `dist/` to the server. No server code is needed.

## After publishing

- Open the link in a private window (signed out) and play one sol.
- Turn on airplane mode and reload: the game should still start.
- Try `?lang=ar` and a phone.

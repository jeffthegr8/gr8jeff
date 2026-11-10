# Admin dashboard

## Run locally

1. Install dependencies with `npm install`.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `admin/.env`.
3. Run `npm run dev` from the `admin` directory.
4. Open `http://localhost:5000`.

## Structure

- `public/` contains the browser-facing pages and assets.
- `public/index.html` is the login page served at `/`.
- `public/dashboard.html` is the dashboard page.
- `public/css/` and `public/js/` contain styles and browser scripts.
- `server/server.js` serves the static site and exposes the API.

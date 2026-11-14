# GR8JEFF admin deployment

The admin app is served as static files by Netlify at `/admin/`. Its Express API runs separately on Render. Login uses the existing Supabase password authentication and admin allowlist; the dashboard uses the authenticated Supabase browser client and the existing row-level security policies for enquiries and portfolio records.

## Confirm Supabase configuration first

The active app entry point is `admin/server/server.js`, which authorizes admins by finding the signed-in user's ID in `admins.id`. Confirm that this is the correct allowlist table and key in the Supabase project before deploying. The separate root-level `server/server.js` checks `admin_users.user_id`; it is not the app launched by `admin/package.json`.

The dashboard directly reads and writes the `enquiries` and `portfolio` tables using the signed-in user's session. Keep RLS enabled and verify existing policies authorize only the intended admin operations. Do not use a service-role key in the browser or change database policies as part of this deployment.

The public site's portfolio content is currently static in the root `index.html`; dashboard edits to the `portfolio` table do not automatically update that HTML.

## Deploy the API on Render

1. In Render, create a **Blueprint** from this repository and use the root `render.yaml`.
2. The Blueprint configures the service to use `admin/`, run `npm ci`, and start with `npm start`. The app uses the `PORT` value provided by Render and targets Node.js 22.x.
3. In the Render service's environment settings, provide:
   - `SUPABASE_URL`: the Project URL shown in the Supabase project settings.
   - `SUPABASE_ANON_KEY`: that project's publishable/anon key. This is not a service-role key.
   - `ADMIN_ORIGINS`: the exact Netlify site origin, with no trailing slash, e.g. `https://gr8jeff.netlify.app`. To allow specific Netlify deploy-preview origins as well, list each exact HTTPS origin separated by commas.
4. Deploy the service and copy its HTTPS origin from Render. Do not append `/api` or a route path.
5. Check `https://<Render-service-origin>/api/health`; a healthy service returns JSON with `"status":"online"`.

Get the Supabase values from the actual project; do not use example or placeholder strings as credentials. Render injects `PORT`; do not set it manually.

## Deploy the site on Netlify

1. Connect the repository to the Netlify site. `netlify.toml` sets the publish directory to the repository root and runs the API-config build script.
2. In Netlify environment variables, set `GR8JEFF_API_BASE_URL` to the Render HTTPS origin copied above, without a trailing slash or path. Set it for each deploy context that should use the API.
3. Verify `ADMIN_ORIGINS` on Render includes the exact origin of the production Netlify site. If using a custom domain, use that domain instead of the default `gr8jeff.netlify.app`; origins must match exactly.
4. Trigger a Netlify deploy. The build intentionally fails if `GR8JEFF_API_BASE_URL` is missing or is not HTTPS. The build writes the public `admin/public/js/api-config.js`; it contains only the API base URL.
5. Confirm `/admin/` loads the login page, and that its CSS, JavaScript, and dashboard paths load. `/admin/public/` remains available.

The backend exposes `POST /api/auth/login` and `GET /api/health`. Enquiries and portfolio data are not Express API routes; those existing dashboard operations use Supabase directly with the user's authenticated session.

## Local development

From `admin/`, install dependencies and provide the environment variables in an ignored `.env` file:

```text
SUPABASE_URL=<value from the Supabase project>
SUPABASE_ANON_KEY=<publishable or anon key from the Supabase project>
ADMIN_ORIGINS=http://localhost:5000
```

Then run:

```powershell
npm ci
npm start
```

Open `http://localhost:5000/`. The checked-in `api-config.js` uses an empty base URL for local same-origin requests. Do not commit `.env` or put a service-role key in any browser file.

## Production testing checklist

- **Admin login:** load `/admin/`; sign in with a valid admin and confirm a non-admin account is denied. Confirm invalid credentials are rejected. Check the browser network panel for `POST <Render-origin>/api/auth/login` and no localhost requests.
- **Dashboard loading:** confirm the admin email and dashboard counts load; refresh the page and verify the session is restored; log out and confirm the dashboard is no longer accessible without signing in.
- **Enquiry management:** verify existing enquiries load, search and status filtering work, details open, and an admin status change persists after reloading. Confirm the related Supabase RLS policies permit only intended operations.
- **Portfolio management:** verify projects load and that creating, editing, publishing/unpublishing, and deleting a test project persist in Supabase; remove test data afterward. The current public homepage is static and will not reflect these table changes automatically.
- **Routes and CORS:** confirm `/api/health` returns `200`, the production Netlify origin can call login, and an unrelated browser origin is not granted CORS access. Verify `/admin/`, `/admin/dashboard.html`, and the CSS/JS assets return successfully.

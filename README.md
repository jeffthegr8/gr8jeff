# GR8JEFF portfolio

Static portfolio for Jefferson Murathi. The public website uses plain HTML, CSS, and JavaScript; it has no build step. The enquiry form uses the Supabase JavaScript client with the project's publishable key.

## Deploy on Netlify

1. Connect this repository to the Netlify site.
2. Deploy the Render API first, then set the Netlify environment variable `GR8JEFF_API_BASE_URL` to the Render service's HTTPS origin (no trailing slash or path).
3. Use the repository's `netlify.toml` settings: publish directory `.` and the configured build command. The build fails if `GR8JEFF_API_BASE_URL` is missing or is not HTTPS.
4. Deploy the site. Netlify serves `index.html` at `/`; `_redirects` keeps `/pricing` at its existing URL and serves the admin login at `/admin/`, including its dashboard, CSS, and JavaScript.

## Enquiry form and Supabase

The form inserts enquiries into the existing Supabase `enquiries` table. It uses a browser-safe publishable key, not a service-role key. Keep the table's row-level security enabled and restrict policies to the operations the public form requires. The form also opens WhatsApp with the submitted details after a successful insert; email and WhatsApp remain available as separate contact links.

Test a form submission on a deployed site or deploy preview (not by opening the HTML file directly). Send a clearly marked test enquiry, check that the success message appears, and verify the row in Supabase. Remove the test row afterward. If the insert fails, check the browser console and the table's row-level security policies.

## Admin API on Render

The admin API is a separate Render web service defined in `render.yaml`. Follow [admin deployment instructions](./admin/README.md) to create it and configure its Supabase credentials and allowed Netlify origins. The API uses the existing Supabase password login and admin allowlist; the dashboard continues to access enquiries and portfolio records through the authenticated Supabase client and existing RLS policies.

The browser-facing Supabase key is a publishable/anon key. Never put a Supabase service-role key in the website or admin assets. Confirm that the active admin allowlist is `admins.id` in the Supabase project before deployment; do not change table policies as part of this deployment.

## Edit the site

- `index.html` contains the portfolio copy, project case studies, About section, technology list, and contact form.
- `pricing/index.html` contains the standalone pricing page. `_redirects` keeps the public URL at `/pricing`.
- `css/style.css` contains the type, color, spacing, responsive, and reduced-motion rules.
- `js/script.js` controls the mobile navigation and Supabase-backed enquiry form.
- Replace the screenshots in `assets/images/` with optimized project images. Update their `alt` text and dimensions in `index.html` if you replace them.
- Replace `assets/images/social-preview.png` with a 1200 by 630 social sharing image and update the Open Graph/Twitter metadata if the site domain changes.
- Replace `assets/favicon.svg` to change the browser icon.
- Search both HTML pages for `[TODO: ...]` and fill each placeholder with verified details before launch.
- The public portfolio content in `index.html` is static. Changes made to the admin dashboard's `portfolio` table do not automatically rewrite that page.

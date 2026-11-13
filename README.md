# GR8JEFF portfolio

Static portfolio for Jefferson Murathi. The public website uses plain HTML, CSS, and JavaScript; it has no build step. The enquiry form uses the Supabase JavaScript client with the project's publishable key.

## Deploy on Netlify

1. Connect this repository to a Netlify site (or keep the existing repository connection).
2. Set the publish directory to the repository root and leave the build command empty.
3. Deploy the site. Netlify serves `index.html` at `/`; `_redirects` routes `/pricing` to `pricing/index.html`.

## Enquiry form and Supabase

The form inserts enquiries into the existing Supabase `enquiries` table. It uses a browser-safe publishable key, not a service-role key. Keep the table's row-level security enabled and restrict policies to the operations the public form requires. The form also opens WhatsApp with the submitted details after a successful insert; email and WhatsApp remain available as separate contact links.

Test a form submission on a deployed site or deploy preview (not by opening the HTML file directly). Send a clearly marked test enquiry, check that the success message appears, and verify the row in Supabase. Remove the test row afterward. If the insert fails, check the browser console and the table's row-level security policies.

## Edit the site

- `index.html` contains the portfolio copy, project case studies, About section, technology list, and contact form.
- `pricing/index.html` contains the standalone pricing page. `_redirects` keeps the public URL at `/pricing`.
- `css/style.css` contains the type, color, spacing, responsive, and reduced-motion rules.
- `js/script.js` controls the mobile navigation and Supabase-backed enquiry form.
- Replace the screenshots in `assets/images/` with optimized project images. Update their `alt` text and dimensions in `index.html` if you replace them.
- Replace `assets/images/social-preview.png` with a 1200 by 630 social sharing image and update the Open Graph/Twitter metadata if the site domain changes.
- Replace `assets/favicon.svg` to change the browser icon.
- Search both HTML pages for `[TODO: ...]` and fill each placeholder with verified details before launch.

The separate Supabase admin app is in `admin/`; it is not required to build or deploy the static portfolio.

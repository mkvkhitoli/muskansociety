# muskansociety.in — Muskan Society Khitoli

A static website in English and Hindi. It's plain HTML, CSS and JS with no build step, so it can be hosted for free from GitHub with **Cloudflare Pages**.

## Files

| File / folder | What it is |
|---|---|
| `index.html`, `about.html`, `programs.html`, `gallery.html`, `news.html`, `volunteer.html`, `contact.html` | The pages |
| `data/news.json` | News posts. **Edit this weekly** |
| `data/gallery.json` | Gallery photos and YouTube videos |
| `images/` | Put photos here |
| `assets/css/style.css` | Design (colours are at the top) |
| `assets/js/main.js` | Language toggle, WhatsApp forms, news and gallery loader. The WhatsApp number and default language are set at the top |

## Updating the website: Admin panel (CMS)

Open **https://muskansociety.in/admin/** and log in with a GitHub token (one-time setup below).

| Tab | What you can change |
|---|---|
| News | Add, edit or delete news with a photo (latest 3 also show on the Home page) |
| Events | Upcoming events. Past events hide automatically |
| Photos | Gallery photos. "Upload many" adds several at once |
| Videos | Paste a YouTube link |
| Office bearers / Members | Names (English and Hindi), roles, photos |
| Contact & links | Phone, WhatsApp number, email, address, office hours, map, Facebook, Instagram, YouTube |

Every save creates a commit on GitHub. Cloudflare then rebuilds the site, and the change is live in 1–2 minutes. Photos are shrunk automatically before upload.

### Get a login token (once a year)
1. github.com → your photo → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
2. Name: `Muskan CMS`. Expiration: 1 year
3. Repository access: **Only select repositories** → `muskansociety`
4. Permissions → Repository permissions → **Contents: Read and write**
5. Generate the token, copy it, and paste it on the admin login page. Keep it private, like a password.

Text on the About, Our Work and Home pages (story, mission, focus areas) is still edited in the `.html` files, or ask Claude to do it.

## One-time setup

### 1. Put the code on GitHub (account: mkvkhitoli@gmail.com)
1. Go to github.com and click **New repository**. Name it `muskansociety`. Public or Private both work.
2. Click **uploading an existing file**, drag in everything from this folder (not the folder itself), and commit.

### 2. Add the domain to Cloudflare (account: muskansociety.in@gmail.com)
1. In the Cloudflare dashboard, click **Add a domain**, enter `muskansociety.in`, and pick the **Free** plan.
2. Cloudflare will show 2 nameservers (like `xxx.ns.cloudflare.com`).
3. In **Hostinger**, go to Domains → muskansociety.in → **DNS / Nameservers** → Change nameservers. Paste the 2 Cloudflare nameservers and save.
4. Wait until Cloudflare shows the domain as **Active**. This usually takes minutes but can take up to 24 hours.

### 3. Deploy with Cloudflare Pages
1. In Cloudflare, go to **Workers & Pages → Create → Pages → Connect to Git**, and allow access to the GitHub repo `muskansociety`.
2. Build settings: Framework preset **None**, build command *(leave empty)*, output directory `/`.
3. Click **Save and Deploy**. You'll get a test address like `muskansociety.pages.dev`.
4. In the project, open **Custom domains → Set up a domain**. Add `muskansociety.in`, then add `www.muskansociety.in`. Cloudflare creates the DNS records for you.
5. Optional: to make `www` forward to the main domain, go to **Rules → Redirect Rules** and redirect `www.muskansociety.in/*` to `https://muskansociety.in/${1}` (301).

### 4. Email: info@muskansociety.in (free)
1. In Cloudflare, open **muskansociety.in → Email → Email Routing → Get started**.
2. Create the address `info@muskansociety.in` and set the destination to the Gmail inbox that should receive it. Verify that Gmail.
3. Cloudflare adds the MX records. Mail sent to info@ now arrives in Gmail.
4. To **reply as** info@ from Gmail, go to Settings → Accounts → "Send mail as". This needs an SMTP service such as Brevo's free plan. Without it you can receive but not reply as info@.

## Before going live: checklist
- [ ] Add a real logo. Replace `assets/img/favicon.svg` and the `LOGO` SVG in the page headers.
- [ ] Add team photos (the About page currently shows initials).
- [ ] Add activity photos to the gallery. Take consent for children's photos.
- [ ] Add the exact Google Maps pin on the Contact page (the map currently searches "Khitoli, Barhi, Katni").
- [ ] Add Facebook and Instagram links once the pages exist.
- [ ] Add impact numbers (girls taught, camps held) once you have them.

## Next step: CMS
News and gallery already come from JSON files, so a CMS can be added later without redesigning the site. **Decap CMS** gives a `/admin` page with a form to post news and upload photos, and it saves straight to GitHub. On Cloudflare Pages it needs a small free GitHub login worker.

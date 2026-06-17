# Gio — Business Ventures

A scroll-snapping personal portfolio where **every business is its own world**, with smooth reveal animations and transitions as you scroll.

## 🌐 What's here
- `index.html` — all the page content (hero, about, each business, contact)
- `css/styles.css` — all styling and animations
- `js/main.js` — scroll effects, dot navigation, count-up stats, word rotator

## ✏️ How to edit your content
Everything you need to personalize is in `index.html`, marked with `[brackets]`:
- **Hero** — your name, tagline, intro line
- **About** — your story + the photo (replace the `photo-placeholder` with a real `<img>`)
- **Venture 01 / 02 / 03** — each business's name, tagline, description, and link
- **Contact** — email and social links

To add another business, copy one of the `<section class="panel biz ...">` blocks and give it a new id + theme.

## 🚀 Deploying (GitHub Pages — free)
1. Push this branch and merge to `main` (or set Pages to build from this branch).
2. In your repo: **Settings → Pages → Source → GitHub Actions** (a workflow is included), or **Deploy from a branch → root**.
3. Your site goes live at `https://<username>.github.io/<repo>/`.

## 👀 Preview locally
Just open `index.html` in a browser, or run a tiny server:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

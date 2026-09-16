# sagar-bio-site

Personal bio-link site — portfolio, credentials and social links in one page.

## Files

| File | What it is |
|---|---|
| `index.html` | All the content — text, links, sections. Edit this to change anything you read on the page. |
| `styles.css` | All the design — colours, fonts, sizes. |
| `assets/profile.jpg` | Your portrait. Replace this file to change the photo (keep the same name). |
| `assets/favicon.svg` | The little icon in the browser tab. |

## How to change your links

Open `index.html` and look for the block marked `====== YOUR LINKS ======`.
Each button is one line with an `href="..."`. Change the URL inside the quotes.

## How to change colours

Open `styles.css`. Everything is at the top under `:root`:

- `--bg` — page background
- `--bg-glow` — the soft light behind your head
- `--accent` — the green used on the WhatsApp button

## How to see it locally

Open `index.html` in any browser, or run:

```bash
python -m http.server 5178
```

then visit http://localhost:5178

## How to publish (GitHub Pages)

1. Create a repository named `sagar-bio-site` on GitHub (public).
2. From this folder:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/USERNAME/sagar-bio-site.git
git push -u origin main
```

3. On GitHub: **Settings → Pages → Source: Deploy from a branch → main → /(root) → Save**
4. Your site goes live at `https://USERNAME.github.io/sagar-bio-site/` in a minute or two.

To update later: change the files, then

```bash
git add . && git commit -m "Update" && git push
```

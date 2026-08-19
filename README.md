# Skill Tree K9 — skilltree-k9.com

Static marketing site. Everything served lives in `public/`.

## Pages

| URL | File | Purpose |
|---|---|---|
| `/` | `public/index.html` | Narrative: hook, validation, authority, program summary, transformation, booking, about summary, FAQ |
| `/program` | `public/program/index.html` | The Calm Companion Program in full |
| `/about` | `public/about/index.html` | Steven's story |

Clean URLs come from the `directory/index.html` layout, which every static host
resolves without config. All three pages share the same header, footer, and
`app.js`. If you edit the header or footer, edit it in all three files.

Links and asset paths are **relative** (`program/`, `../styles.css`) rather than
root-absolute, so the site works whether the web root is `public/` (how it
deploys), the repo folder (a local preview of the whole project), or a
subdirectory.

### Previewing locally

Serve it over HTTP — opening `index.html` from disk with `file://` will not
follow `program/` to `program/index.html`:

```bash
python3 -m http.server 8000 --directory public   # then open http://localhost:8000
```

## CSS build

Styles are compiled with the Tailwind CLI — the site no longer loads the
Tailwind CDN compiler in the browser. Source of truth is `src/styles.css`
plus the theme in `tailwind.config.js`.

```bash
npm install
npm run build:css     # one-off, minified -> public/styles.css
npm run watch:css     # rebuild on change while editing
```

**`public/styles.css` is a build artifact and is committed** — the host serves
`public/` directly with no build step, so a stale commit means stale styles.
Re-run `npm run build:css` and commit the result whenever you change markup
classes, `src/styles.css`, or `tailwind.config.js`.

Classes that only ever appear at runtime (toggled by `app.js`) are listed in
`safelist` in `tailwind.config.js`. Add to it if you introduce more.

## Images

`public/` contains **only what the site actually serves**. Full-size originals
live in `src/images/` — outside the deployed folder — so they stay available as
masters without shipping ~15 MB to every visitor.

The page references resized WebP/JPEG derivatives: `hero-*.webp`,
`about-steven-*`, `transformation-*`, `authority-*`, `logo-256.webp`,
`cgc-evaluator-240.jpg`. If you swap a photo, drop the original in
`src/images/`, generate new derivatives, and point the markup at those — never
at a multi-megabyte original.

`public/og/skill-tree-k9-og.jpg` (1200x630) is the social share card.

## Mobile

Verified with no horizontal overflow and no sub-44px tap targets at 320, 360,
390, 430, and 768 px. The hero uses `min-height` with an `svh` override
(`src/styles.css`) so it grows rather than clipping when content is taller than
the viewport, and so mobile browser chrome doesn't hide the bottom row.

# West of June Media

The West of June Media website: five static pages, no build step and no dependencies.
Open `index.html` in a browser and it runs.

## What's here

| File | Page |
| --- | --- |
| `index.html` | Home |
| `services.html` | What I Do |
| `work.html` | Portfolio |
| `about.html` | My Story |
| `contact.html` | Let's Talk |
| `site.js` | Shared behaviour for every page: scroll reveals, hover states, button arrows |
| `favicon.svg` | Browser tab icon |
| `assets/` | All images, already complete |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

Fonts (Playfair Display, Jost, Caveat) load from Google Fonts. Everything else is local.

## Notes

Each page carries its own title, meta description, canonical URL and Open Graph tags,
all pointing at `https://westofjunemedia.com`. If the site ends up on a different
domain, those are the lines to update in the `<head>` of each page.

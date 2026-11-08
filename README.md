# NOOLAM — Kanchipuram Silk (rebuild)

A single-page showroom site for a demo saree brand, rebuilt section by section from
[alagappan567/noolam-saree-showcase](https://github.com/alagappan567/noolam-saree-showcase)'s prompts and screenshots.

Plain HTML, CSS and JavaScript — no build step. All imagery (figures, sarees, hangers, showroom) is drawn in code in `js/art.js`.

## Run

```bash
python3 -m http.server 5178
```

Then open http://localhost:5178.

## Sections
Hero · Six Moods · Try the Look · Pick a Silk · The Rack (with detail view) · The Muse Film · The Muse Reels · The Bridal Collection

## Admin: replace the drawings with real photos

Every drawn image on the site (hero, Six Moods arches, look models and pieces, Pick a Silk models, rack hangers,
film tiles, the brand film, reels and bridal cards) can be swapped for a real photo or video.

```bash
node admin-server.js
```

Then open http://localhost:5180/admin.html (needs Node 18+; nothing to install).

- **Upload** or drag a file onto any card. Photos are resized and converted to WebP in the browser.
- **Use drawing** puts the illustration back.
- **Publish to GitHub** commits `media/` and `content/media.json` and pushes the current branch.

Models and hanger shots look best as cut-outs on a transparent PNG/WebP. The brand film and reels accept MP4 or WebM video.
Uploads are listed in `content/media.json`; any slot missing there falls back to the drawing, so the site works on GitHub Pages as is.

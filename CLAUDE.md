# Plant Identification — CLAUDE.md

## Project overview

A single-feature plant identification website. User uploads or pastes an image, the app
identifies the plant via PlantNet, reveals the result with a typewriter effect, then shows a
photo gallery from iNaturalist. One feature, done exceptionally well.

## Tech stack

- **Framework:** Next.js (App Router, TypeScript)
- **Package manager:** pnpm — always use pnpm, never npm or yarn
- **Styling:** Tailwind CSS
- **APIs:** PlantNet (identification), iNaturalist (photo gallery — no key needed)

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build
pnpm lint         # lint
pnpm install      # install dependencies
```

## Project structure

```
app/
  api/
    identify/route.ts   # POST — proxies to PlantNet, keeps API key server-side
    images/route.ts     # GET ?q= — fetches species photos from iNaturalist
  components/
    Dropzone.tsx        # drag-and-drop + click-to-browse + paste (Ctrl+V)
    ResultCard.tsx      # typewriter reveal of the identification result
    ImageGallery.tsx    # responsive photo grid with attribution
    Loader.tsx          # earthy loading animation
  hooks/
    useTypewriter.ts    # character-by-character reveal, respects prefers-reduced-motion
  globals.css
  layout.tsx
  page.tsx              # main client component orchestrating the full flow
.env.local              # gitignored — PLANTNET_API_KEY goes here
.env.local.example      # committed — documents required env vars
```

## Environment variables

```
PLANTNET_API_KEY=...    # only secret; get a free key at my.plantnet.org
```

iNaturalist needs no key. Never expose `PLANTNET_API_KEY` to the browser — it must stay
server-side (no `NEXT_PUBLIC_` prefix).

## Design — earthy plant theme

**Palette:** deep forest green `#2f4538`, moss `#6b8f71`, sage `#a8c0a0`, clay `#8a6d52`,
cream paper `#f4f1e9`.

**Typography:** Fraunces or Cormorant (serif/organic) for headings; clean sans for body.

**Feel:** calm, botanical, tactile — soft rounded cards, subtle texture, gentle shadows. Not
techy.

## Key behaviors

- **Image input:** drag-and-drop, click-to-browse, and clipboard paste (Ctrl+V) all work.
- **Typewriter effect:** result reveals character-by-character with a blinking cursor. If
  `prefers-reduced-motion` is set, reveal instantly.
- **Gallery:** after result types out, fetch iNaturalist photos for the species. Show
  photographer attribution (required by iNaturalist licenses). Graceful empty state if no
  photos found.
- **Errors:** friendly, human messages — "Couldn't identify this one — try a clearer photo
  of a single leaf or flower."
- **Security:** all external API calls go through `/api/*` routes. No keys in the browser.

## API notes

- **PlantNet:** `POST https://my-api.plantnet.org/v2/identify/all?api-key=<key>` with image
  as `multipart/form-data`. Returns ranked species matches with scores.
- **iNaturalist:** `GET https://api.inaturalist.org/v1/taxa?q=<name>&rank=species&per_page=1`
  to resolve the taxon, then `GET https://api.inaturalist.org/v1/taxa/<id>` for curated
  photos. Send a `User-Agent` header.

## Out of scope

No user accounts, save history, or additional features — keep it to this one excellent flow.

# Site images

Curated photos used in the design — the front page, About, and so on.
Member-uploaded content does not belong here; that goes to Supabase Storage.

Drop originals in, then run:

    pnpm images:optimize

That resizes anything oversized to WebP in place and deletes the original, so full-size
phone photos never reach a git commit. Safe to re-run.

`hero/` is read at runtime, not listed in code: every `.webp` in it joins the front page
crossfade, in filename order. Adding a photo to the front page is dropping it in there.

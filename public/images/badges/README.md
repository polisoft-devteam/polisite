# Badge artwork

One image per badge, named after its key in `src/features/members/badges.ts`:

    poli.webp
    organiser.webp
    attendee.webp
    yearsOfService.webp
    traveller.webp
    sportsman.webp
    gifter.webp

Drop the artwork in, then run `pnpm images:optimize`.

A badge with no file here falls back to its icon, so the folder can be filled in one badge
at a time and nothing looks broken in the meantime. The filename is the whole connection:
there is nothing to register and no id to keep in step.

Square artwork. It is rendered in a circle at 48px on a profile, so anything with detail in
the corners loses it.

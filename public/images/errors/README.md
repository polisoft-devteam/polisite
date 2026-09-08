# Error screens

`error-page.webp` sits behind the big number on the 404 and 500 screens. One file, both screens.

Drop the original in and run `pnpm images:optimize`. Nothing breaks while it is missing:
the screens are painted with a gradient and the photograph is a background image, so an
absent file is simply an absent background rather than a broken picture.

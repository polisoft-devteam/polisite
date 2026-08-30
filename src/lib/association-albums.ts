// Shared photo albums.
//
// Everything here except the label is read off the album's own page — see
// scripts/read-album.mts. The URL must be the one Google's Share button produces
// (photos.app.goo.gl/…), because that carries the ?key= that makes the album open for
// someone who isn't already shared in. A URL copied from the address bar is missing it.

export type PhotoAlbum = {
  label: string
  /** The full share URL including ?key=. */
  url: string
  /** Google's cover image. The size suffix is ours — it accepts any crop. */
  coverUrl: string
  /** As Google reports it, so it stays in English. */
  dateRange?: string
}

export const PHOTO_ALBUMS: PhotoAlbum[] = [
  {
    label: "Eurotrip 2026",
    url: "https://photos.google.com/share/AF1QipOusjOCIf-BTK0Zte5b_287gWVfKRTDkkWlff5dJDdmTXntvZ5peBwljoDeJqQlqw?key=ZFd1Vy1JazIxaTNjQ1JLSGVtRlRTa0pfNzV3UlF3",
    coverUrl:
      "https://lh3.googleusercontent.com/pw/AP1GczOVynO24NLnI0hQxEkLQDiIQkoyULW1gk7ZRdDAO7YL6kbbfOoA78cZLNm4S3MedrKRD5YoA5EmeinA4Lj5JAhzTWxH-vc3Kpd1efuI9eq3HznO-uU=w1200-h630-p-k-no",
    dateRange: "Sep 23, 2019 – Aug 2, 2026",
  },
]

// A SoundCloud track, set or profile, embedded.
//
// The widget takes a permalink, so what is stored is the link a member copied from the
// address bar rather than a numeric track id dug out of an iframe. Nothing to look up and
// nothing to keep in step.
//
// Rendered directly rather than behind a click, like the Spotify playlist beside it, and
// the privacy page says as much. The player colour is ours, so it does not arrive wearing
// somebody else's green.

const PLAYER = "https://w.soundcloud.com/player/"

/** Our primary, which the widget wants without the hash. */
const PLAYER_COLOUR = "79f1c6"

export function SoundCloudEmbed({
  url,
  label,
}: {
  /** The soundcloud.com permalink. */
  url: string
  label: string
}) {
  const parameters = new URLSearchParams({
    url,
    color: `#${PLAYER_COLOUR}`,
    auto_play: "false",
    hide_related: "false",
    show_comments: "true",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "true",
    visual: "true",
  })

  return (
    <iframe
      src={`${PLAYER}?${parameters.toString()}`}
      title={label}
      height={300}
      allow="autoplay; encrypted-media"
      loading="lazy"
      className="w-full rounded-xl border-0"
    />
  )
}

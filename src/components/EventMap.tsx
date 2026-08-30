// A map of where the event is.
//
// Built from the address text alone: Google's own embed URLs carry an opaque place blob
// that can only be produced by their UI, but the q= form geocodes whatever it is given.
// No API key and no billing account, same reasoning as the search link it replaces.
//
// Loads from Google with the page, which the privacy page says.

export function EventMap({ location }: { location: string }) {
  return (
    <iframe
      src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
      title={location}
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      className="aspect-video w-full max-w-2xl rounded-lg border-0"
    />
  )
}

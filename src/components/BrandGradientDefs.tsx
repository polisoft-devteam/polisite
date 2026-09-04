// The brand gradient, in the one form CSS cannot provide: an SVG <linearGradient> an icon
// can point its fill at.
//
// Rendered once for the document and referenced by id from anywhere. The stops read the
// palette's variables, so switching palette in the lab moves this with everything else and
// there is nothing to keep in step.
//
// Hidden from layout and from assistive technology: it draws nothing itself.

export function BrandGradientDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="absolute"
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        <linearGradient id="brand-gradient" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" style={{ stopColor: "var(--brand-stop-1)" }} />
          <stop offset="50%" style={{ stopColor: "var(--brand-stop-2)" }} />
          <stop offset="100%" style={{ stopColor: "var(--brand-stop-3)" }} />
        </linearGradient>
      </defs>
    </svg>
  )
}

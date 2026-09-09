// Bottom bar shown on every page.
//
// The logos above it are read from the folder rather than listed here, the same way the
// front page's photographs are: adding one is dropping a file into public/images/footer.

import { getTranslations } from "next-intl/server"

import { SiteImage } from "@/components/SiteImage"
import { Link } from "@/i18n/navigation"
import { ASSOCIATION_FULL_NAME, ASSOCIATION_NAME } from "@/lib/association"
import { HeartIcon } from "@/lib/icons"
import { readFooterLogos, type FooterLogo } from "@/lib/site-images"

/**
 * How tall to hang a logo so it carries the same weight as the others.
 *
 * The area is what the eye compares, so the height falls out of it: a wide logo comes out
 * short, a square one tall, and both look the same size. Clamped, because one very long
 * or very tall file should not set the height of the whole row.
 */
function logoHeightRem({ width, height }: FooterLogo): number {
  const targetArea = 26
  const unclamped = Math.sqrt(targetArea / (width / height))

  return Math.min(Math.max(unclamped, 3), 5.5)
}

export async function SiteFooter() {
  const translateFooter = await getTranslations("Footer")
  const logos = await readFooterLogos()

  return (
    <footer className="mt-16 border-t">
      {logos.length > 0 && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 2xl:max-w-7xl">
          <p className="text-muted-foreground text-center text-xs tracking-wide uppercase">
            {translateFooter("sponsors")}
          </p>

          {/* Nudged left on a wide screen: the logos carry their own whitespace and the
              row reads off centre without it. */}
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 sm:gap-x-24 md:mr-16">
            {logos.map((logo) => (
              <li key={logo.src}>
                {/* Matched by area rather than by height: hung at one height a square
                    logo reads as half the size of a wide one, because the eye weighs how
                    much ink is there. Nothing cropped, nothing behind them, nothing on
                    hover. */}
                <SiteImage
                  src={logo.src}
                  alt=""
                  fit="contain"
                  rounded="rounded-none"
                  className="w-auto"
                  style={{
                    height: `${logoHeightRem(logo)}rem`,
                    aspectRatio: `${logo.width} / ${logo.height}`,
                  }}
                  sizes="240px"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Three equal columns rather than a row pushed apart: with justify-between the
          middle is only centred when the two outer items happen to be the same width, and
          "Poli" against "Integritetspolicy" is nowhere near. Equal columns put the middle
          line under the middle of the page, where the logos are. */}
      <div className="text-muted-foreground mx-auto grid w-full max-w-6xl gap-2 px-4 py-8 pb-24 text-center text-sm sm:grid-cols-3 sm:items-center md:pb-8 2xl:max-w-7xl">
        <span className="sm:justify-self-start">{ASSOCIATION_NAME}</span>

        {/* Split around the heart rather than an emoji in the message file, so it takes
            the colour and size of everything around it. */}
        <span className="flex items-center justify-center gap-1.5">
          {translateFooter("builtWith")}
          <HeartIcon
            aria-hidden="true"
            className="text-notification size-3.5"
          />
          {translateFooter("builtBy", {
            associationFullName: ASSOCIATION_FULL_NAME,
          })}
        </span>
        <Link
          href="/privacy"
          transitionTypes={["nav-forward"]}
          className="hover:text-foreground transition-colors sm:justify-self-end"
        >
          {translateFooter("privacy")}
        </Link>
      </div>
    </footer>
  )
}

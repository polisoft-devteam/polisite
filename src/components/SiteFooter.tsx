// Bottom bar shown on every page.
//
// The logos above it are read from the folder rather than listed here, the same way the
// front page's photographs are: adding one is dropping a file into public/images/footer.

import { getTranslations } from "next-intl/server"

import { SiteImage } from "@/components/SiteImage"
import { Link } from "@/i18n/navigation"
import { ASSOCIATION_FULL_NAME, ASSOCIATION_NAME } from "@/lib/association"
import { HeartIcon } from "@/lib/icons"
import { readFooterLogos } from "@/lib/site-images"

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

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-16 gap-y-8 sm:gap-x-24">
            {logos.map((logo) => (
              <li key={logo.src}>
                {/* One height for all of them, each keeping its own width: as drawn,
                    nothing cropped, nothing behind them, nothing on hover. */}
                <SiteImage
                  src={logo.src}
                  alt=""
                  fit="contain"
                  rounded="rounded-none"
                  className="h-12 w-auto sm:h-14"
                  style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
                  sizes="180px"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The name at one edge and the policy at the other, with what the site is made of
          between them. Centred only while it is stacked, on a phone. */}
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center gap-2 px-4 py-8 pb-24 text-center text-sm sm:flex-row sm:justify-between sm:text-left md:pb-8 2xl:max-w-7xl">
        <span>{ASSOCIATION_NAME}</span>

        {/* Split around the heart rather than an emoji in the message file, so it takes
            the colour and size of everything around it. */}
        <span className="flex items-center gap-1.5">
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
          className="hover:text-foreground transition-colors"
        >
          {translateFooter("privacy")}
        </Link>
      </div>
    </footer>
  )
}

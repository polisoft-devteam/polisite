// The front page's hero: the photographs in public/images/hero, crossfading behind the
// association's name. The frame and the wave cut belong to PhotoHero, which an event page
// uses too.

import { getTranslations } from "next-intl/server"

import { PhotoHero } from "@/components/PhotoHero"
import { ASSOCIATION_NAME } from "@/lib/association"
import { readHeroImages } from "@/lib/hero-images"

export async function SiteHero() {
  const translateHome = await getTranslations("Home")
  const heroImages = await readHeroImages()

  return (
    <PhotoHero
      images={heroImages}
      title={translateHome("title")}
      tagline={translateHome("heroTagline", {
        associationName: ASSOCIATION_NAME,
      })}
    />
  )
}

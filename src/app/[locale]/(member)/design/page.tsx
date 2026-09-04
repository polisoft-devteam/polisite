// Every component in one place, so a design change can be judged at a glance instead of
// by clicking through the app hoping to hit each one.
//
// Members-only rather than public: it's a working tool, not a page anyone needs.

import type { Metadata } from "next"
import {
  Anton,
  Bricolage_Grotesque,
  Outfit,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google"

import { AttendeeAvatars } from "@/components/AttendeeAvatars"
import { BackLink } from "@/components/BackLink"
import { EmptyState } from "@/components/EmptyState"
import { EventCard } from "@/components/EventCard"
import { EventForm } from "@/components/EventForm"
import { ProfileView } from "@/components/ProfileView"
import { SectionHeading } from "@/components/SectionHeading"
import { SuggestionCallout } from "@/components/SuggestionCallout"
import { designNoOpAction } from "./actions"
import {
  buildSampleEvent,
  buildSampleMember,
  SAMPLE_ATTENDEES,
  SAMPLE_GUESTS,
} from "@/lib/design-samples"
import { Fact, FactList } from "@/components/FactList"
import { FormField, FormSelect } from "@/components/FormField"
import { ExternalLink } from "@/components/ExternalLink"
import { ItemList } from "@/components/ItemList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Modal, ModalClose } from "@/components/Modal"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import { HoverRevealLabel } from "@/components/HoverRevealLabel"
import { ImageDropZone } from "@/components/ImageDropZone"
import { BadgeShelf } from "@/components/BadgeShelf"
import { MemberBadges } from "@/components/MemberBadges"
import { MembershipActions } from "@/components/MembershipActions"
import { MembersOnlyNotice } from "@/components/MembersOnlyNotice"
import { PaletteLab } from "@/components/PaletteLab"
import { PhotoHero } from "@/components/PhotoHero"
import { WelcomeCrawl } from "@/components/WelcomeCrawl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ExternalLinkIcon,
  GoogleIcon,
  SignOutIcon,
  WishlistIcon,
} from "@/lib/icons"
import { readHeroImages } from "@/lib/site-images"
import { BADGES } from "@/features/members/badges"
import { WELCOME_LETTER } from "@/lib/welcome-letter"

export const metadata: Metadata = { title: "Design" }

// Imported here rather than in the layout, so these only download on this page.
const outfit = Outfit({ subsets: ["latin"] })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"] })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] })
const anton = Anton({ subsets: ["latin"], weight: "400" })

const HEADING_CANDIDATES = [
  {
    name: "Fraunces",
    note: "Variabel serif, varm och redaktionell.",
    className: "font-heading",
  },
  {
    name: "Outfit",
    note: "Geometrisk sans. Ren och modern, lite anonym.",
    className: outfit.className,
  },
  {
    name: "Space Grotesk",
    note: "Teknisk känsla. Närmast spelvärlden av dessa.",
    className: spaceGrotesk.className,
  },
  {
    name: "Bricolage Grotesque",
    note: "Nuvarande. Egensinnig, mest personlighet.",
    className: bricolage.className,
  },
  {
    name: "Plus Jakarta Sans",
    note: "Vänlig och rundad. Trygg men inte tråkig.",
    className: jakarta.className,
  },
  {
    name: "Anton",
    note: "Tung display. Affischenergi — bara för rubriker.",
    className: anton.className,
  },
]

const TOKENS = [
  { name: "background", label: "background" },
  { name: "foreground", label: "foreground" },
  { name: "card", label: "card" },
  { name: "primary", label: "primary" },
  { name: "secondary", label: "secondary" },
  { name: "muted", label: "muted" },
  { name: "accent", label: "accent" },
  { name: "destructive", label: "destructive" },
  { name: "border", label: "border" },
]

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const

const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const

const SAMPLE_BADGES = BADGES.slice(0, 3).map((badge, index) => ({
  memberId: "00000000-0000-4000-8000-000000000002",
  badge: badge.key,
  tier: badge.maxTier ? index + 1 : null,
  awardedAt: new Date(2026, index * 3, 1),
  awardedByMemberId: null,
}))

export default async function DesignPage({
  params,
}: PageProps<"/[locale]/design">) {
  const { locale } = await params

  return (
    <PageContainer>
      <PageHeading
        eyebrow="Internt"
        title="Design"
        actions={<Button variant="outline">Exempelknapp</Button>}
      />

      <PageSection heading="Färger">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {TOKENS.map((token) => (
            <div key={token.name} className="space-y-1.5">
              <div
                className="border-border h-14 rounded-md border"
                style={{ background: `var(--${token.name})` }}
              />
              <p className="text-muted-foreground font-mono text-xs">
                {token.label}
              </p>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection heading="Typsnitt att välja mellan">
        <p className="text-muted-foreground text-sm">
          Samma rubrik i varje kandidat. Säg vilken du vill ha så byter jag —
          det är en rad i layouten.
        </p>

        <div className="space-y-6">
          {HEADING_CANDIDATES.map((candidate) => (
            <div key={candidate.name} className="border-border border-t pt-4">
              <p className="text-muted-foreground font-mono text-xs">
                {candidate.name} — {candidate.note}
              </p>
              <p
                className={`${candidate.className} mt-2 text-3xl font-semibold tracking-tight`}
              >
                Bastufestival på Ön
              </p>
              <p
                className={`${candidate.className} mt-1 text-xl font-semibold`}
              >
                Poli Meet — årets träff
              </p>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection heading="Typografi">
        <div className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Rubrik 3xl — Bastufestival på Ön
          </h1>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Rubrik 2xl — Årsträff 2027
          </h2>
          <h3 className="font-heading text-lg font-medium tracking-tight">
            Rubrik lg — Kommande evenemang
          </h3>
          <p className="max-w-2xl text-sm">
            Brödtext. Här samlar vi föreningens evenemang, medlemmar och
            historia. Samtalet fortsätter på Discord — det här är platsen för
            det som ska hålla över tid.
          </p>
          <p className="text-muted-foreground text-sm">
            Dämpad brödtext, för det som är sekundärt.
          </p>
          <p className="text-muted-foreground text-xs">
            Hjälptext under ett fält.
          </p>
          <p className="font-mono text-xs">Monospace — 2026-10-04 18:00</p>
        </div>
      </PageSection>

      <PageSection heading="Knappar">
        {/* success and info join the set; everything but ghost and link sweeps on
            hover, and icon-only buttons opt out. */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="success">Klart</Button>
          <Button variant="info">Info</Button>
          <Button variant="destructive">Ta bort</Button>
        </div>

        <div className="space-y-4">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground w-24 shrink-0 font-mono text-xs">
                {variant}
              </span>
              {BUTTON_SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {size}
                </Button>
              ))}
              <Button variant={variant} disabled>
                disabled
              </Button>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection heading="Fält">
        <div className="max-w-lg space-y-5">
          <FormField label="Titel" htmlFor="design-title">
            <Input id="design-title" defaultValue="Bastufestival" />
          </FormField>

          <FormField
            label="Med hjälptext"
            htmlFor="design-hint"
            hint="Frivilligt. Skalas ner automatiskt."
          >
            <Input id="design-hint" placeholder="https://" />
          </FormField>

          <FormField label="Ogiltigt" htmlFor="design-invalid">
            <Input id="design-invalid" aria-invalid="true" defaultValue="" />
          </FormField>

          <FormField label="Inaktiverat" htmlFor="design-disabled">
            <Input
              id="design-disabled"
              disabled
              defaultValue="Kan inte ändras"
            />
          </FormField>

          <FormField label="Rullgardin" htmlFor="design-select">
            <FormSelect id="design-select" defaultValue="members">
              <option value="public">Öppet publikt event</option>
              <option value="members">Poli</option>
            </FormSelect>
          </FormField>

          <FormField label="Textruta" htmlFor="design-textarea">
            <Textarea id="design-textarea" rows={3} />
          </FormField>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              defaultChecked
              className="border-input size-4 rounded border"
            />
            Kryssruta
          </label>
        </div>
      </PageSection>

      <PageSection heading="Länkar">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <ExternalLink href="https://www.google.com/maps/search/?api=1&query=Hotell+Pigalle+G%C3%B6teborg">
            <GoogleIcon className="size-3.5" />
            Visa på karta
          </ExternalLink>

          <ExternalLink href="https://example.com">
            <ExternalLinkIcon className="size-3.5" />
            Mer information
          </ExternalLink>

          <ExternalLink href="https://example.com">Utan ikon</ExternalLink>
        </div>
      </PageSection>

      <PageSection heading="Ikon som fäller ut sin text">
        {/* Hover or tab to it. The group class sits on the button, not inside the
            component, because that is where keyboard focus lands. */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="group/reveal w-auto px-2"
          >
            <HoverRevealLabel
              icon={<SignOutIcon className="size-4" />}
              label="Logga ut"
            />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="group/reveal w-auto px-2"
          >
            <HoverRevealLabel
              icon={<WishlistIcon className="size-4" />}
              label="En ganska lång etikett"
            />
          </Button>
        </div>
      </PageSection>

      <PageSection heading="Bilduppladdning">
        <div className="max-w-sm">
          <ImageDropZone
            id="design-drop"
            name="design-drop"
            label="Dra hit en bild, eller klicka för att välja"
            hint="JPEG, PNG, WebP eller AVIF. Skalas ner automatiskt."
          />
        </div>
      </PageSection>

      <PageSection id="palette" heading="Färg">
        <PaletteLab />
      </PageSection>

      <PageSection heading="Bara för medlemmar">
        {/* What someone following an event link from Discord meets. Both states here,
            because reaching either for real means signing out or demoting an account. */}
        <SectionHeading>Utloggad</SectionHeading>
        <MembersOnlyNotice state="signedOut" />

        <SectionHeading>Inloggad, har inte ansökt</SectionHeading>
        <MembersOnlyNotice state="canApply" />

        <SectionHeading>Ansökt, väntar på admin</SectionHeading>
        <MembersOnlyNotice state="pending" />

        <SectionHeading>Nekad, inget att trycka på</SectionHeading>
        <MembersOnlyNotice state="denied" />

        <SectionHeading>
          Knapparna för sig, som de sitter på Om oss
        </SectionHeading>
        <div className="flex flex-wrap items-center gap-2">
          <MembershipActions state="signedOut" />
          <MembershipActions state="canApply" />
          <MembershipActions state="pending" />
        </div>
      </PageSection>

      <PageSection heading="Utmärkelser">
        <SectionHeading>Någon annans profil, bara det de tagit</SectionHeading>
        <MemberBadges badges={SAMPLE_BADGES} locale={locale} />

        <SectionHeading>Egen profil, resten grå</SectionHeading>
        <MemberBadges badges={SAMPLE_BADGES} locale={locale} isOwnProfile />

        <SectionHeading>Hyllan som katalog, allt i färg</SectionHeading>
        <BadgeShelf locale={locale} mode="catalogue" />
      </PageSection>

      <PageSection heading="Notiser">
        {/* The bubble in isolation: it has to carry against either theme, which is why its
            colour is one value rather than a light and a dark one. */}
        <div className="flex items-center gap-4">
          <span className="bg-notification flex size-4 items-center justify-center rounded-full text-[0.625rem] font-bold text-white tabular-nums">
            3
          </span>
          <span className="bg-notification rounded-full px-1.5 text-xs font-bold text-white tabular-nums">
            12
          </span>
          <span className="text-muted-foreground text-sm">#f52055</span>
        </div>
      </PageSection>

      <PageSection heading="Märken och ansikten">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="destructive">destructive</Badge>

          <div className="ml-4 flex">
            {["Victor Persson", "Anna Svensson", "Erik Larsson"].map((name) => (
              <MemberAvatar
                key={name}
                fullName={name}
                avatarUrl={null}
                className="ring-background -ml-2 size-8 text-xs ring-2 first:ml-0"
              />
            ))}
          </div>
        </div>
      </PageSection>

      <PageSection heading="Listor och tomma tillstånd">
        <ItemList>
          <li className="flex justify-between gap-4 p-4">
            <span className="font-medium">Bastufestival</span>
            <span className="text-muted-foreground text-sm">4 okt 18:00</span>
          </li>
          <li className="flex justify-between gap-4 p-4">
            <span className="font-medium">Skidresa</span>
            <span className="text-muted-foreground text-sm italic">
              Datum ej bestämt
            </span>
          </li>
        </ItemList>

        <EmptyState>Inga evenemang inlagda ännu.</EmptyState>

        <FactList>
          <Fact label="Startar">lördag 4 oktober 2026 18:00</Fact>
          <Fact label="Pris">250,00 SEK</Fact>
          <Fact label="Platser">Obegränsat</Fact>
        </FactList>
      </PageSection>

      <PageSection heading="Dragspel och dialog">
        <Accordion className="border-border max-w-lg rounded-lg border">
          <AccordionItem value="one">
            <AccordionTrigger className="px-4 hover:no-underline">
              Fler inställningar
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <p className="text-muted-foreground text-sm">
                Innehåll som sällan behövs.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Modal
          trigger={<Button variant="outline">Öppna dialog</Button>}
          title="Exempeldialog"
          description="En rad som förklarar vad dialogen gör."
          closeLabel="Stäng"
          footer={
            <>
              <ModalClose render={<Button variant="outline" />}>
                Avbryt
              </ModalClose>
              <Button>Bekräfta</Button>
            </>
          }
        >
          <p className="text-muted-foreground text-sm">
            Innehållet i dialogen.
          </p>
        </Modal>

        {/* The real letter, so the crawl can be timed and read without signing out. */}
        <Modal
          trigger={<Button variant="outline">Grundarens brev</Button>}
          title={WELCOME_LETTER.title}
          closeLabel={WELCOME_LETTER.closeLabel}
          backgroundImage="/images/misc/viggeRasse.webp"
          titleClassName="text-center text-xl font-extrabold tracking-tight sm:text-2xl"
          className="sm:max-w-2xl"
          footer={<Button>{WELCOME_LETTER.requestLabel}</Button>}
        >
          <WelcomeCrawl
            paragraphs={WELCOME_LETTER.paragraphs}
            signature={WELCOME_LETTER.signature}
            pauseLabel={WELCOME_LETTER.pauseLabel}
            playLabel={WELCOME_LETTER.playLabel}
            replayLabel={WELCOME_LETTER.replayLabel}
          />
        </Modal>
      </PageSection>

      <PageSection heading="Hjältebild">
        {/* Normally full bleed at the top of a page. Boxed in here so the wave cut and the
            title's contrast can be checked without leaving the reference. */}
        <div className="overflow-hidden rounded-lg">
          <PhotoHero
            images={await readHeroImages()}
            eyebrow="Fest"
            title="Bastufestival"
            tagline="Underrubriken som ligger på fotot."
          />
        </div>
      </PageSection>

      <PageSection heading="Eventkort">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <EventCard
            event={buildSampleEvent()}
            attendees={SAMPLE_ATTENDEES}
            guests={SAMPLE_GUESTS}
            locale={locale}
            canOpen
          />
          <EventCard
            event={buildSampleEvent({
              title: "Kan vi åka skridskor?",
              kind: "suggestion",
              startsAt: null,
              category: "sport",
            })}
            attendees={[]}
            locale={locale}
            canOpen
          />
          <EventCard
            event={buildSampleEvent({
              title: "Fullsatt fest",
              category: "party",
            })}
            attendees={SAMPLE_ATTENDEES}
            locale={locale}
            canOpen
          />
        </div>
      </PageSection>

      <PageSection heading="Deltagare">
        <SectionHeading>Medlemmar och medföljande</SectionHeading>
        <AttendeeAvatars attendees={SAMPLE_ATTENDEES} guests={SAMPLE_GUESTS} />

        <SectionHeading>Bara medlemmar</SectionHeading>
        <AttendeeAvatars attendees={SAMPLE_ATTENDEES} />

        <SectionHeading>Förslagsnotis, på sidan</SectionHeading>
        <SuggestionCallout />

        <SectionHeading>Förslagsnotis, på ett foto</SectionHeading>
        {/* On its own dark ground, because in the app it sits over the hero photograph. */}
        <div className="mt-2 rounded-lg bg-neutral-800 p-4">
          <SuggestionCallout onPhoto />
        </div>

        <BackLink href="/design">Tillbaka</BackLink>
      </PageSection>

      <PageSection heading="Profil">
        <ProfileView
          member={buildSampleMember()}
          upcomingEvents={[buildSampleEvent()]}
          pastEvents={[]}
          locale={locale}
        />
      </PageSection>

      <PageSection heading="Eventguiden">
        <p className="text-muted-foreground text-sm">
          Samma steg-för-steg-formulär som på /events/new. Knappen här sparar
          ingenting.
        </p>
        <EventForm action={designNoOpAction} submitLabel="Spara (gör inget)" />
      </PageSection>
    </PageContainer>
  )
}

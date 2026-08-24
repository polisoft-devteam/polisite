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

import { EmptyState } from "@/components/EmptyState"
import { Fact, FactList } from "@/components/FactList"
import { FormField, FormSelect } from "@/components/FormField"
import { ItemList } from "@/components/ItemList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Modal, ModalClose } from "@/components/Modal"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
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
    note: "Nuvarande. Variabel serif, varm och redaktionell.",
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
    note: "Egensinnig. Mest personlighet, minst neutral.",
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

export default function DesignPage() {
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
      </PageSection>
    </PageContainer>
  )
}

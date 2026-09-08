// A page that isn't there, or an event whose slug nobody may read.
//
// Deliberately says nothing about which of the two it is: a members-only event answers a
// guess exactly as a typo does, which is what keeps a stranger from learning that a slug
// exists. See CLAUDE.md on event visibility.

import { getTranslations } from "next-intl/server"

import { ErrorScreen } from "@/components/ErrorScreen"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { ArrowLeftIcon } from "@/lib/icons"

export default async function LocaleNotFound() {
  const translateErrors = await getTranslations("Errors")

  return (
    <ErrorScreen
      code="404"
      title={translateErrors("notFoundTitle")}
      body={translateErrors("notFoundBody")}
      actions={
        <Button
          nativeButton={false}
          className="bg-info text-background hover:bg-info/90"
          render={<Link href="/" />}
        >
          <ArrowLeftIcon className="size-4" />
          {translateErrors("home")}
        </Button>
      }
    />
  )
}

// Wraps a card that a non-member may look at but not open.
//
// The card itself is rendered on the server and passed in as children, so this adds the
// modal without knowing anything about what it is wrapping, and without the card's link
// or slug ever being generated.

"use client"

import { useTranslations } from "next-intl"

import { Modal } from "@/components/Modal"

export function MembersOnlyCard({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  const translateArchive = useTranslations("Archive")

  return (
    <Modal
      title={translateArchive("membersOnlyTitle")}
      description={translateArchive("membersOnlyBody")}
      closeLabel={translateArchive("membersOnlyClose")}
      trigger={
        <button
          type="button"
          aria-label={`${label}. ${translateArchive("membersOnlyTitle")}`}
          className={className}
        />
      }
    >
      {children}
    </Modal>
  )
}

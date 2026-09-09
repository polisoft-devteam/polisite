// Wraps a card that a non-member may look at but not open.
//
// The card itself is rendered on the server and passed in as children, so this adds the
// modal without knowing anything about what it is wrapping, and without the card's link
// or slug ever being generated.
//
// The children go inside the trigger, which is the whole point: they are the card. They
// used to be handed to the modal instead, which left an empty card-shaped button on the
// page and the event's picture and title hidden until it was pressed.

"use client"

import { useTranslations } from "next-intl"

import { MembersOnlyPanel } from "@/components/MembersOnlyPanel"
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
  const translateEvents = useTranslations("Events")

  return (
    <Modal
      title={translateEvents("membersOnlyTitle")}
      closeLabel={translateEvents("membersOnlyClose")}
      trigger={
        <button
          type="button"
          aria-label={`${label}. ${translateEvents("membersOnlyTitle")}`}
          className={className}
        >
          {children}
        </button>
      }
    >
      <MembersOnlyPanel
        body={translateEvents("membersOnlyBody")}
        readMoreLabel={translateEvents("membersOnlyReadMore")}
      />
    </Modal>
  )
}

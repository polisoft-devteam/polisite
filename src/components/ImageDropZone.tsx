// A dotted box you can drop a photo on, or click to pick one.
//
// It wraps a real file input rather than replacing it: the input is still what the form
// posts, still what a keyboard reaches, and still what works if this component never
// hydrates. Everything here is decoration on top of that.
//
// The chosen file is previewed from a blob URL, which is revoked when it changes, so
// picking six photos in a row does not leak six of them.

"use client"

import { useEffect, useRef, useState } from "react"

import { PhotosIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export function ImageDropZone({
  id,
  name,
  accept = "image/jpeg,image/png,image/webp,image/avif",
  label,
  hint,
  currentImageUrl,
}: {
  id: string
  name: string
  accept?: string
  /** What to say when nothing has been chosen. */
  label: string
  hint: string
  /** What is already saved, shown until something new is picked. */
  currentImageUrl?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDraggedOver, setIsDraggedOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function takeFile(file: File | undefined) {
    if (!file) return

    setFileName(file.name)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const shown = previewUrl ?? currentImageUrl ?? null

  return (
    <div
      // The label is what makes the whole box clickable, and it is what a screen reader
      // reads, so no click handler or role is needed here.
      onDragOver={(event) => {
        event.preventDefault()
        setIsDraggedOver(true)
      }}
      onDragLeave={() => setIsDraggedOver(false)}
      onDrop={(event) => {
        event.preventDefault()
        setIsDraggedOver(false)

        const file = event.dataTransfer.files[0]
        if (!file || !inputRef.current) return

        // Hand the drop to the real input, so the form posts it like any other pick.
        inputRef.current.files = event.dataTransfer.files
        takeFile(file)
      }}
      className={cn(
        "group/drop relative rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        isDraggedOver
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/60 hover:bg-muted/50",
      )}
    >
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => takeFile(event.target.files?.[0])}
      />

      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center gap-2"
      >
        {shown ? (
          // A plain img: this is a local blob or an already-optimised upload, and
          // next/image cannot size either of them.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt=""
            className="h-28 w-full rounded-lg object-cover"
          />
        ) : (
          <PhotosIcon className="text-muted-foreground size-8 transition-transform duration-300 group-hover/drop:-translate-y-0.5 group-hover/drop:scale-110 motion-reduce:transition-none" />
        )}

        <span className="text-sm font-medium">{fileName ?? label}</span>
        <span className="text-muted-foreground text-xs">{hint}</span>
      </label>
    </div>
  )
}

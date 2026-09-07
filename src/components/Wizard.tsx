// A step-by-step form: one panel at a time, with a sidebar showing where you are.
//
// Every panel stays in the DOM and is only hidden, so fields keep their values and the
// whole thing submits as one form — no draft table, no partial saves. Hidden inputs still
// submit, which is what makes this work.
//
// Steps are passed as data rather than inspected from children, so nothing depends on the
// shape of the JSX handed in.
//
// The form itself lives here rather than around this, because the submit belongs to the
// last step and what comes back from it has to be shown next to that button: a server that
// refuses the form says which fields it refused, and the summary appears where the press
// happened.

"use client"

import { Fragment, useActionState, useState } from "react"

import { Spinner } from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import type { FormFeedback } from "@/lib/form-feedback"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export type WizardStep = {
  label: string
  /** Server-rendered fields, buttons, uploads — whatever the step needs. */
  content: React.ReactNode
}

export function Wizard({
  steps,
  action,
  hiddenFields,
  invalidHeading,
  fieldLabels,
  submitLabel,
  submitIcon,
  submittingLabel,
  backLabel,
  nextLabel,
  stepLabel,
}: {
  steps: WizardStep[]
  /** The server action the whole thing posts to, and whatever it refuses comes back. */
  action: (previous: FormFeedback, formData: FormData) => Promise<FormFeedback>
  /** Ids and the like the action needs but nobody types. */
  hiddenFields?: React.ReactNode
  /** Said once above the refused fields, e.g. "Något stämmer inte". */
  invalidHeading: string
  /** Field name to the label it carries in the form, so the summary reads in words. */
  fieldLabels: Record<string, string>
  submitLabel: string
  /** Sits on the submit button. Saving an edit and publishing a new thing are not the
      same act, so the caller says which this is. */
  submitIcon: React.ReactNode
  /** Shown while the action is away, e.g. "Publicerar …". */
  submittingLabel: string
  backLabel: string
  nextLabel: string
  /** e.g. "Steg" — shown with the number in the sidebar. */
  stepLabel: string
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [feedback, submit, isSubmitting] = useActionState(action, null)

  const isLastStep = currentStep === steps.length - 1
  const refusedFields = Object.entries(feedback?.fieldErrors ?? {}).filter(
    ([, messages]) => messages && messages.length > 0,
  )

  /**
   * Blocks advancing past a panel with invalid fields. Without this the browser would
   * refuse to submit on the last step and try to focus an input nobody can see.
   *
   * Marks fields with aria-invalid rather than calling reportValidity(): the native bubble
   * is an OS widget we can't style, and aria-invalid already turns the field's border red
   * while telling screen readers the same thing.
   */
  function goToNextStep(event: React.MouseEvent<HTMLButtonElement>) {
    // Advancing to the last step turns this very button into the submit button, and the
    // browser decides what a click does only after the handler has run — by which point it
    // is looking at a submit button inside a form. That is what posted the event on the way
    // to the last step. Refusing the click's default action settles it whatever the button
    // has become.
    event.preventDefault()

    const panel = event.currentTarget
      .closest("form")
      ?.querySelector<HTMLElement>(`[data-wizard-panel="${currentStep}"]`)

    const fields = Array.from(
      panel?.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea") ?? [],
    )

    let firstInvalidField: HTMLElement | null = null

    for (const field of fields) {
      const isValid = field.checkValidity()

      if (isValid) {
        field.removeAttribute("aria-invalid")
      } else {
        field.setAttribute("aria-invalid", "true")
        firstInvalidField ??= field
      }
    }

    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ block: "center", behavior: "smooth" })
      firstInvalidField.focus({ preventScroll: true })
      return
    }

    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  /**
   * Enter in a field means "I am done with this field", never "create the event".
   *
   * A form with a submit button submits when Enter is pressed in any single-line input.
   * The submit button only exists on the last step, which is why this bit there and only
   * there: a price typed into Advanced and confirmed with Enter created the event on the
   * spot, with every default still in place — including the Discord ping.
   */
  function blockImplicitSubmit(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter") return

    const field = event.target
    // A textarea needs Enter for new lines, and a focused button needs it to be pressed.
    if (
      field instanceof HTMLTextAreaElement ||
      field instanceof HTMLButtonElement
    ) {
      return
    }

    event.preventDefault()
  }

  return (
    <form action={submit}>
      {hiddenFields}

      <div
        className="mt-8 flex flex-col gap-8 lg:flex-row-reverse lg:items-start"
        onKeyDown={blockImplicitSubmit}
      >
        {/* Below lg the labels come off the buttons and appear once, underneath: three
          circles each carrying two lines of text does not fit a phone, and scrolling a
          progress indicator sideways hides the very thing it is meant to show. */}
        <div className="shrink-0 lg:w-56">
          <ol className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:gap-0">
            {steps.map((step, index) => {
              const isCurrent = index === currentStep
              const isComplete = index < currentStep

              return (
                <Fragment key={step.label}>
                  <li className="lg:w-full">
                    <button
                      type="button"
                      // Only steps already passed are safe to jump back to; jumping forward
                      // would skip the validation on the way.
                      disabled={!isComplete && !isCurrent}
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md p-2 text-left text-sm transition-colors lg:px-3",
                        isCurrent && "bg-muted font-medium",
                        !isCurrent && isComplete && "hover:bg-muted/50",
                        !isCurrent && !isComplete && "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs",
                          isCurrent &&
                            "border-primary bg-primary text-primary-foreground",
                          isComplete && "border-primary-ink text-primary-ink",
                        )}
                      >
                        {isComplete ? (
                          <CheckIcon className="size-3" />
                        ) : (
                          index + 1
                        )}
                      </span>

                      <span className="hidden min-w-0 lg:block">
                        {step.label}
                      </span>
                    </button>
                  </li>

                  {/* The run between two steps, filled once you are past the one before it.
                  Horizontal on a phone and vertical from lg, which is why the border
                  moves from the top edge to the left one rather than the box rotating. */}
                  {index < steps.length - 1 && (
                    <li
                      aria-hidden="true"
                      className={cn(
                        "border-dotted",
                        "w-5 border-t-2",
                        "lg:ml-6 lg:h-4 lg:w-0 lg:border-t-0 lg:border-l-2",
                        isComplete ? "border-primary-ink" : "border-border",
                      )}
                    />
                  )}
                </Fragment>
              )
            })}
          </ol>

          {/* Where you are, said once, in words. */}
          <p className="text-muted-foreground mt-2 text-xs lg:hidden">
            {stepLabel} {currentStep + 1}/{steps.length} ·{" "}
            {steps[currentStep]?.label}
          </p>
        </div>

        <div
          className="min-w-0 flex-1"
          // Clears the red outline the moment they start correcting the field.
          onInput={(event) =>
            (event.target as HTMLElement).removeAttribute("aria-invalid")
          }
        >
          {steps.map((step, index) => (
            <div
              key={step.label}
              data-wizard-panel={index}
              hidden={index !== currentStep}
              className="space-y-6"
            >
              {step.content}
            </div>
          ))}

          {/* Next to the button that was pressed, because that is where the answer is
            being waited for. */}
          {refusedFields.length > 0 && (
            <div
              role="alert"
              className="border-destructive/40 bg-destructive/10 text-destructive mt-8 rounded-lg border p-3 text-sm"
            >
              <p className="font-medium">{invalidHeading}</p>

              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {refusedFields.map(([field, messages]) => (
                  <li key={field}>
                    {fieldLabels[field] ?? field}
                    {messages?.[0] ? `: ${messages[0]}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex gap-2">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((step) => step - 1)}
              >
                <ChevronLeftIcon className="size-4" />
                {backLabel}
              </Button>
            )}

            {/* Keyed apart so React swaps the element rather than rewriting the one under
              the pointer: a button that changes from "next" to "submit" mid-click is the
              whole reason the event used to create itself here.

              The press is followed by an upload, a row, a Discord message and a redirect,
              which is a second or two of nothing to look at, hence the spinner. */}
            {isLastStep ? (
              <Button
                key="submit"
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : submitIcon}
                {isSubmitting ? submittingLabel : submitLabel}
              </Button>
            ) : (
              <Button key="next" type="button" onClick={goToNextStep}>
                {nextLabel}
                <ChevronRightIcon className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

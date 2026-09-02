// A step-by-step form: one panel at a time, with a sidebar showing where you are.
//
// Every panel stays in the DOM and is only hidden, so fields keep their values and the
// whole thing submits as one form — no draft table, no partial saves. Hidden inputs still
// submit, which is what makes this work.
//
// Steps are passed as data rather than inspected from children, so nothing depends on the
// shape of the JSX handed in.

"use client"

import { Fragment, useState } from "react"

import { Button } from "@/components/ui/button"
import { CheckIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

export type WizardStep = {
  label: string
  /** Server-rendered fields, buttons, uploads — whatever the step needs. */
  content: React.ReactNode
}

export function Wizard({
  steps,
  submitLabel,
  backLabel,
  nextLabel,
  stepLabel,
}: {
  steps: WizardStep[]
  submitLabel: string
  backLabel: string
  nextLabel: string
  /** e.g. "Steg" — shown with the number in the sidebar. */
  stepLabel: string
}) {
  const [currentStep, setCurrentStep] = useState(0)

  const isLastStep = currentStep === steps.length - 1

  /**
   * Blocks advancing past a panel with invalid fields. Without this the browser would
   * refuse to submit on the last step and try to focus an input nobody can see.
   *
   * Marks fields with aria-invalid rather than calling reportValidity(): the native bubble
   * is an OS widget we can't style, and aria-invalid already turns the field's border red
   * while telling screen readers the same thing.
   */
  function goToNextStep(event: React.MouseEvent<HTMLButtonElement>) {
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

  return (
    <div className="mt-8 flex flex-col gap-8 lg:flex-row-reverse lg:items-start">
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

        <div className="mt-8 flex gap-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep((step) => step - 1)}
            >
              {backLabel}
            </Button>
          )}

          {isLastStep ? (
            <Button type="submit" size="lg">
              {submitLabel}
            </Button>
          ) : (
            <Button type="button" onClick={goToNextStep}>
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

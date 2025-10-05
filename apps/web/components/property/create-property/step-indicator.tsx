import { cn } from "@/lib/utils"

interface Step {
  id: number
  label: string
  key: string
}

interface StepIndicatorProps {
  steps: readonly Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-1 px-2">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep
        const isCurrent = step.id === currentStep
        const isUpcoming = step.id > currentStep

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1 gap-2">
              <div
                className={cn(
                  "rounded-full flex items-center justify-center transition-all relative",
                  isCompleted && "w-12 h-12 bg-primary",
                  isCurrent && "w-14 h-14 bg-primary ring-4 ring-primary/20",
                  isUpcoming && "w-10 h-10 bg-muted",
                )}
              >
                {isCompleted && (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isCurrent && <div className="w-4 h-4 bg-white rounded-full" />}
              </div>

              <span
                className={cn(
                  "text-[10px] leading-tight text-center font-medium max-w-[60px]",
                  (isCompleted || isCurrent) && "text-foreground",
                  isUpcoming && "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className={cn("h-1 flex-1 -mt-12 rounded-full", isCompleted ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

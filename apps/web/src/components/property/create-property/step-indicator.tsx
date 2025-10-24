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
            <div className={`flex flex-col items-center flex-1 gap-2`}>
              <div
                className={cn(
                  "rounded-full flex items-center justify-center transition-all relative border-2",
                  isCompleted && "w-6 h-6 bg-[#01805F] border-1 border-white",
                  isCurrent && "w-6 h-6 bg-[#01805F] border-1 border-white",
                  isUpcoming && "w-6 h-6 bg-gray-300 border-gray-300",
                )}
              >
                {isCompleted && <div className="w-4.5 h-4.5 bg-[#01805F] border-3 border-white rounded-full" />}
                {isCurrent && <div className="w-4.5 h-4.5 bg-[#01805F] border-3 border-white rounded-full" />}
                {isUpcoming && <div className="w-4.5 h-4.5 bg-gray-500 rounded-full" />}
              </div>

              <span
                className={cn(
                  "text-[10px] leading-tight text-center font-medium max-w-[60px] text-nowrap",
                  isCompleted && "text-[#01805F]",
                  isCurrent && "text-[#01805F]",
                  isUpcoming && "text-gray-500",
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 flex-1 -mt-6.5 rounded-full",
                  isCompleted ? "bg-[#01805F]" : "bg-[#E5E7EB]"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

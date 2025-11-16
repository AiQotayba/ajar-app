"use client"

import { cn } from "@/lib/utils"

interface Step {
  id: number
  label: string
  key: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between gap-1 sm:gap-2 px-1 sm:px-2 min-w-0">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep
        const isCurrent = step.id === currentStep
        const isUpcoming = step.id > currentStep

        return (
          <div key={step.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center flex-1 gap-1.5 sm:gap-2 min-w-0">
              <div
                className={cn(
                  "rounded-full flex items-center justify-center transition-all relative border-2 shrink-0",
                  isCompleted && "w-5 h-5 sm:w-6 sm:h-6 bg-[#01805F] border-1 border-white",
                  isCurrent && "w-5 h-5 sm:w-6 sm:h-6 bg-[#01805F] border-1 border-white",
                  isUpcoming && "w-5 h-5 sm:w-6 sm:h-6 bg-gray-300 border-gray-300",
                )}
              >
                {isCompleted && <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-[#01805F] border-2 sm:border-3 border-white rounded-full" />}
                {isCurrent && <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-[#01805F] border-2 sm:border-3 border-white rounded-full" />}
                {isUpcoming && <div className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 bg-gray-500 rounded-full" />}
              </div>

              <span
                className={cn(
                  "text-[9px] sm:text-[10px] leading-tight text-center font-medium max-w-full sm:max-w-[60px] text-nowrap overflow-hidden text-ellipsis px-0.5",
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
                  "h-0.5 sm:h-1 flex-1 -mt-5 sm:-mt-6.5 rounded-full shrink min-w-[8px] sm:min-w-0",
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

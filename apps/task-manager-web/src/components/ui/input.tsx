import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
          "w-full min-w-0 border border-input bg-transparent outline-none transition-colors transition-all duration-200 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-gray-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          "px-4 py-2.5 text-sm font-light rounded-md focus-visible:ring-1 focus-visible:ring-[#8AB4F8] focus-visible:border-[#8AB4F8] focus-visible:ring-offset-0",
          className
        )}
      {...props}
    />
  )
}

export { Input }

import React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  containerClassName?: string
}

export function ModernInput({ 
  label, 
  error, 
  icon, 
  className, 
  containerClassName,
  ...props 
}: ModernInputProps) {
  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          className={cn(
            "transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary",
            error && "border-destructive focus:ring-destructive/20 focus:border-destructive",
            icon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

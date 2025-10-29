import React from "react"
import { cn } from "@/lib/utils"

interface ModernCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function ModernCard({ 
  children, 
  className, 
  hover = true, 
  gradient = false 
}: ModernCardProps) {
  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-xl shadow-sm",
        "backdrop-blur-sm bg-card/80",
        hover && "hover:shadow-md hover:border-border/80 transition-all duration-200",
        gradient && "bg-gradient-to-br from-card to-card/50",
        className
      )}
    >
      {children}
    </div>
  )
}

interface ModernCardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardHeader({ children, className }: ModernCardHeaderProps) {
  return (
    <div className={cn("p-6 pb-4", className)}>
      {children}
    </div>
  )
}

interface ModernCardContentProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardContent({ children, className }: ModernCardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  )
}

interface ModernCardTitleProps {
  children: React.ReactNode
  className?: string
}

export function ModernCardTitle({ children, className }: ModernCardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h3>
  )
}

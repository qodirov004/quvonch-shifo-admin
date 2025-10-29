import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
  icon?: React.ReactNode
}

export function ModernButton({ 
  children, 
  className, 
  variant = "default", 
  size = "default", 
  loading = false,
  icon,
  disabled,
  ...props 
}: ModernButtonProps) {
  const baseClasses = "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/50",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/50",
    outline: "border border-border bg-background hover:bg-muted focus:ring-primary/50",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary/50",
    ghost: "hover:bg-muted focus:ring-muted/50",
    link: "text-primary underline-offset-4 hover:underline focus:ring-primary/50",
    gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 focus:ring-primary/50"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
    icon: "h-10 w-10"
  }
  
  return (
    <Button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && "cursor-not-allowed opacity-70",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </Button>
  )
}

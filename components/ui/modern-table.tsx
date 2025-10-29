import React from "react"
import { cn } from "@/lib/utils"

interface ModernTableProps {
  children: React.ReactNode
  className?: string
}

export function ModernTable({ children, className }: ModernTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className={cn("w-full", className)}>
          {children}
        </table>
      </div>
    </div>
  )
}

interface ModernTableHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ModernTableHeader({ children, className }: ModernTableHeaderProps) {
  return (
    <thead className={cn("bg-muted/50", className)}>
      {children}
    </thead>
  )
}

interface ModernTableBodyProps {
  children: React.ReactNode
  className?: string
}

export function ModernTableBody({ children, className }: ModernTableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-border", className)}>
      {children}
    </tbody>
  )
}

interface ModernTableRowProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function ModernTableRow({ children, className, hover = true }: ModernTableRowProps) {
  return (
    <tr className={cn(
      "transition-colors duration-150",
      hover && "hover:bg-muted/50",
      className
    )}>
      {children}
    </tr>
  )
}

interface ModernTableHeadProps {
  children: React.ReactNode
  className?: string
}

export function ModernTableHead({ children, className }: ModernTableHeadProps) {
  return (
    <th className={cn(
      "px-6 py-4 text-left text-sm font-semibold text-foreground",
      className
    )}>
      {children}
    </th>
  )
}

interface ModernTableCellProps {
  children: React.ReactNode
  className?: string
}

export function ModernTableCell({ children, className }: ModernTableCellProps) {
  return (
    <td className={cn("px-6 py-4 text-sm text-foreground", className)}>
      {children}
    </td>
  )
}

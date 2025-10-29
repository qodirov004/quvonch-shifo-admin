"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Sidebar from "./sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export default function DashboardLayout({
  children,
  user,
}: {
  children: React.ReactNode
  user: any
}) {
  const { logout } = useAuth()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  // Responsive sidebar state management
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      setSidebarOpen(true)
    }
  }, [isMobile])

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 flex flex-col h-screen ${sidebarOpen ? 'md:ml-0' : 'ml-0'}`}>
          {/* Header */}
          <header className="bg-card border-b border-border sticky top-0 z-40 flex-shrink-0">
            <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-muted-foreground hover:text-foreground p-1.5 sm:p-2 rounded-md hover:bg-muted/50 transition-colors"
                  title={sidebarOpen ? "Sidebar yopish" : "Sidebar ochish"}
                >
                  {sidebarOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
                </button>
                
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
                <ThemeToggle />

                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-foreground">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">Superuser</p>
                </div>
                <div className="text-right md:hidden">
                  <p className="text-xs font-medium text-foreground truncate max-w-20">{user?.username}</p>
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive p-1.5 sm:p-2"
                  title="Chiqish"
                >
                  <LogOut size={14} className="sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}

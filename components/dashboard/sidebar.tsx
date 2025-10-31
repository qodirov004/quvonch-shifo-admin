"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Users, Newspaper, Briefcase, LayoutDashboard, FileText, Info, Tag, Wrench } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/call-orders", label: "Qo'ng'iroq buyurtmalari", icon: "phone" },
  { href: "/dashboard/doctors", label: "Shifokorlar", icon: "users" },
  { href: "/dashboard/news", label: "Yangiliklar", icon: "newspaper" },
  { href: "/dashboard/vacancies", label: "Vakansiyalar", icon: "briefcase" },
  { href: "/dashboard/categories", label: "Kategoriyalar", icon: "tag" },
  { href: "/dashboard/work-types", label: "Ish turlari", icon: "wrench" },
  { href: "/dashboard/job-applications", label: "Ish arizalari", icon: "file-text" },
  { href: "/dashboard/aboutus", label: "Biz haqimizda", icon: "info" },
]

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  // Simplified - no language switching

  const getIcon = (icon: string) => {
    switch (icon) {
      case "dashboard":
        return <LayoutDashboard size={20} />
      case "phone":
        return <Phone size={20} />
      case "users":
        return <Users size={20} />
      case "newspaper":
        return <Newspaper size={20} />
      case "briefcase":
        return <Briefcase size={20} />
      case "file-text":
        return <FileText size={20} />
      case "info":
        return <Info size={20} />
      case "tag":
        return <Tag size={20} />
      case "wrench":
        return <Wrench size={20} />
      default:
        return null
    }
  }

  return (
    <aside
      className={`${
        isOpen ? "w-67" : "w-0"
      } bg-card border-r border-border transition-all duration-300 overflow-hidden fixed md:relative h-screen z-50 md:z-auto`}
    >
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/05-100.jpg"
              alt="Quvonch Shifo"
              className="h-24 sm:h-20 lg:h-28 w-auto object-contain"
            />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center hidden sm:block">Admin Panel</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close sidebar only on mobile when menu item is clicked
                  if (onClose && isMobile) {
                    onClose()
                  }
                }}
                className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg transition-colors text-xs sm:text-sm lg:text-base ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {getIcon(item.icon)}
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

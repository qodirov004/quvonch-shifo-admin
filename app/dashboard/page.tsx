"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import DashboardLayout from "@/components/dashboard/layout"
import DashboardOverview from "@/components/dashboard/overview"
import { LoadingPage } from "@/components/ui/loading-spinner"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [mounted, loading, isAuthenticated, router])

  if (!mounted || loading || !isAuthenticated) {
    return <LoadingPage />
  }

  return (
    <DashboardLayout user={user}>
      <DashboardOverview />
    </DashboardLayout>
  )
}

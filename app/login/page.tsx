"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Mount check
  useEffect(() => {
    setMounted(true)
    
    // Check if user is already authenticated
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('adminToken')
        const user = localStorage.getItem('user')
        if (token && user) {
          setIsAuthenticated(true)
          router.push("/dashboard")
        }
      }
    }
    
    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Simplified login - just check credentials
      if (username === "admin" && password === "admin") {
        localStorage.setItem("adminToken", "admin-token")
        localStorage.setItem("user", JSON.stringify({ username: "admin", is_superuser: true }))
        window.location.href = "/dashboard"
      } else {
        setError("Noto'g'ri foydalanuvchi nomi yoki parol")
      }
    } catch (err) {
      setError("Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while mounting
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Dashboard'ga yo'naltirilmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Quvonch Shifo Admin</CardTitle>
          <CardDescription>Superuser login required</CardDescription>
          {/* <div className="text-xs text-muted-foreground bg-muted p-2 rounded space-y-1">
            <p>Default credentials: admin / admin</p>
            <p>API server: https://api.greentraver.uz</p>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-green-600">API online</span>
            </div>
          </div> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUsername("admin")
                  setPassword("admin")
                }}
                className="px-3"
              >
                Fill Default
              </Button> */}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

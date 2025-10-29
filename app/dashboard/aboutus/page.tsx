"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Plus, Edit as EditIcon } from "lucide-react"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { AboutUsLanguage } from "@/lib/types"
import { LoadingPage } from "@/components/ui/loading-spinner"
import { Modal } from "@/components/ui/modal"

export default function AboutUsPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()
  const [aboutUs, setAboutUs] = useState<AboutUsLanguage | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    content_uz: "",
    content_ru: "",
  })
  const [formLoading, setFormLoading] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [mounted, loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAboutUs()
    }
  }, [isAuthenticated])

  const fetchAboutUs = async () => {
    try {
      setErrorMessage(null)
      const data = await api.aboutUs.get()
      // Handle three possible shapes: paginated {results: [...]}, array [...], or single object
      let record: any = null as any
      if (data && typeof data === 'object' && 'results' in (data as any) && Array.isArray((data as any).results)) {
        record = (data as any).results[0] || null
      } else if (Array.isArray(data)) {
        record = data[0] || null
      } else {
        record = data as any
      }

      setAboutUs(record || null)
      const exists = !!(record && record.id)
      setHasData(exists)
      
      // Set form data with current values (allow empty strings)
      const uz = (record?.description_uz ?? record?.content_uz ?? record?.description ?? '') as string
      const ru = (record?.description_ru ?? record?.content_ru ?? '') as string
      setFormData({
        content_uz: uz,
        content_ru: ru,
      })
    } catch (error) {
      console.error("Failed to fetch about us:", error)
      setHasData(false)
      setAboutUs(null)
      setErrorMessage("Ma'lumotni yuklashda xatolik yuz berdi")
      setFormData({
        content_uz: "",
        content_ru: "",
      })
    } finally {
      setPageLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.content_uz || !formData.content_ru) {
      alert("Barcha maydonlarni to'ldiring")
      return
    }

    setFormLoading(true)
    try {
      // Always re-check existence to respect singleton constraint
      const existingData = await api.aboutUs.get()
      const existing: any = Array.isArray(existingData) ? existingData[0] : existingData

      if (existing?.id) {
        await api.aboutUs.update(existing.id, formData)
        setIsEditModalOpen(false)
        setHasData(true)
      } else {
        try {
          await api.aboutUs.create(formData as { content_uz: string; content_ru: string })
          setHasData(true)
          setIsCreateModalOpen(false)
        } catch (e) {
          // If backend refuses due to singleton, fall back to update
          try {
            const afterPostData = await api.aboutUs.get()
            let rec: any = null as any
            if (afterPostData && typeof afterPostData === 'object' && 'results' in (afterPostData as any) && Array.isArray((afterPostData as any).results)) {
              rec = (afterPostData as any).results[0] || null
            } else if (Array.isArray(afterPostData)) {
              rec = afterPostData[0] || null
            } else {
              rec = afterPostData as any
            }
            if (rec?.id) {
              await api.aboutUs.update(rec.id, formData)
              setHasData(true)
              setIsEditModalOpen(false)
              setIsCreateModalOpen(false)
            } else {
              throw e
            }
          } catch {
            throw e
          }
        }
      }
      
      await fetchAboutUs()
      alert("Ma'lumotlar muvaffaqiyatli saqlandi")
    } catch (error) {
      console.error("Failed to save:", error)
      alert("Ma'lumotlarni saqlashda xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setFormLoading(false)
    }
  }

  if (!mounted || loading || !isAuthenticated) {
    return <LoadingPage />
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Biz haqimizda</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Kompaniya haqida ma'lumotlarni boshqarish
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          {!hasData && !errorMessage && (
            <Modal
              title="Biz haqimizda ma'lumotlarini qo'shish"
              trigger={
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Qo'shish
                </Button>
              }
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              size="lg"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="content_uz" className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                      Matn (O'zbek)
                    </Label>
                    <Textarea
                      id="content_uz"
                      value={formData.content_uz}
                      onChange={(e) => setFormData({ ...formData, content_uz: e.target.value })}
                      placeholder="Kompaniya haqida ma'lumot..."
                      rows={10}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content_ru" className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-600">🇷🇺</span>
                      Matn (Rus)
                    </Label>
                    <Textarea
                      id="content_ru"
                      value={formData.content_ru}
                      onChange={(e) => setFormData({ ...formData, content_ru: e.target.value })}
                      placeholder="Информация о компании..."
                      rows={10}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button onClick={handleSave} disabled={formLoading}>
                    {formLoading ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </div>
              </div>
            </Modal>
          )}
          {errorMessage && (
            <div className="flex items-center gap-2">
              <span className="text-destructive text-sm">{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={() => { setPageLoading(true); fetchAboutUs(); }}>
                Qayta urinish
              </Button>
            </div>
          )}
        </div>

        {pageLoading ? (
          <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
        ) : hasData && aboutUs ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                Biz haqimizda ma'lumotlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Matn (O'zbek)
                  </Label>
                  <div className="rounded-md border p-4 bg-muted/30 text-sm whitespace-pre-wrap">
                    {(aboutUs as any)?.description_uz || (aboutUs as any)?.content_uz || (aboutUs as any)?.description || '—'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Matn (Rus)
                  </Label>
                  <div className="rounded-md border p-4 bg-muted/30 text-sm whitespace-pre-wrap">
                    {(aboutUs as any)?.description_ru || (aboutUs as any)?.content_ru || '—'}
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <Label className="text-sm font-semibold">Qo'shimcha ma'lumot</Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  {aboutUs.id ? <p>• ID: #{aboutUs.id}</p> : null}
                  {aboutUs.created_at ? (
                    <p>• Yaratilgan: {new Date(aboutUs.created_at).toLocaleDateString('uz-UZ')}</p>
                  ) : null}
                  {aboutUs.updated_at ? (
                    <p>• Yangilangan: {new Date(aboutUs.updated_at).toLocaleDateString('uz-UZ')}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end">
                <Modal
                  title="Biz haqimizda ma'lumotlari (Tahrirlash)"
                  trigger={
                    <Button variant="outline">
                      <EditIcon className="w-4 h-4 mr-2" />
                      Tahrirlash
                    </Button>
                  }
                  open={isEditModalOpen}
                  onOpenChange={(open) => {
                    setIsEditModalOpen(open)
                    if (open && aboutUs) {
                      setFormData({ content_uz: (aboutUs as any).description_uz || (aboutUs as any).content_uz || "", content_ru: (aboutUs as any).description_ru || (aboutUs as any).content_ru || "" })
                    }
                  }}
                  size="lg"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit_content_uz" className="flex items-center gap-2">
                          <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                          Matn (O'zbek)
                        </Label>
                        <Textarea
                          id="edit_content_uz"
                          value={formData.content_uz}
                          onChange={(e) => setFormData({ ...formData, content_uz: e.target.value })}
                          placeholder="Kompaniya haqida ma'lumot..."
                          rows={10}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit_content_ru" className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-600">🇷🇺</span>
                          Matn (Rus)
                        </Label>
                        <Textarea
                          id="edit_content_ru"
                          value={formData.content_ru}
                          onChange={(e) => setFormData({ ...formData, content_ru: e.target.value })}
                          placeholder="Информация о компании..."
                          rows={10}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                        Bekor qilish
                      </Button>
                      <Button onClick={handleSave} disabled={formLoading}>
                        {formLoading ? "Saqlanmoqda..." : "Saqlash"}
                      </Button>
                    </div>
                  </div>
                </Modal>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-muted-foreground text-center py-8">Ma'lumot topilmadi. Qo'shish tugmasi orqali ma'lumot kiriting.</div>
        )}
      </div>
    </DashboardLayout>
  )
}

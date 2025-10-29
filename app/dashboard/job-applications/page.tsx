"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, Plus, Edit, Eye } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { VakansiyaArizasiLanguage, VakansiyaArizasi, VakansiyaLanguage } from "@/lib/types"

export default function JobApplicationsPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  // Simplified - no language switching
  const [applications, setApplications] = useState<VakansiyaArizasiLanguage[]>([])
  const [filteredApplications, setFilteredApplications] = useState<VakansiyaArizasiLanguage[]>([])
  const [vacancies, setVacancies] = useState<VakansiyaLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<VakansiyaArizasiLanguage | null>(null)

  // Form states
  const [formData, setFormData] = useState<Partial<VakansiyaArizasi>>({
    full_name_uz: "",
    diplom_id: "",
    email: "",
    phone: "",
    vakansiya: 0,
    cover_letter_uz: "",
    status: "pending"
  })
  const [formLoading, setFormLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [mounted, loading, isAuthenticated, router])

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchApplications()
      fetchVacancies()
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    const filtered = applications.filter(
      (application) => {
        const displayName = getDisplayName(application)
        const displayCoverLetter = getDisplayCoverLetter(application)
        
        return (displayName && displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (application.email && application.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (application.phone && application.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (displayCoverLetter && displayCoverLetter.toLowerCase().includes(searchTerm.toLowerCase()))
      }
    )
    setFilteredApplications(filtered)
  }, [searchTerm, applications])

  const fetchApplications = async () => {
    try {
      console.log("Fetching job applications...")
      const data = await api.jobApplications.getAll({ page: 1, lang: 'uz' })
      console.log("Job applications data:", data)
      
      // Har bir arizani tekshirib, qaysi fieldlar to'ldirilganini ko'rsatamiz
      if (data.results && data.results.length > 0) {
        console.log("First application fields analysis:")
        const firstApp = data.results[0]
        console.log("Available fields:", Object.keys(firstApp))
        console.log("Full name fields:", {
          full_name: firstApp.full_name,
          full_name_uz: firstApp.full_name_uz,
          full_name_ru: firstApp.full_name_ru
        })
        console.log("Cover letter fields:", {
          cover_letter: firstApp.cover_letter,
          cover_letter_uz: firstApp.cover_letter_uz,
          cover_letter_ru: firstApp.cover_letter_ru
        })
      }
      
      setApplications(data.results || [])
    } catch (error) {
      console.error("Failed to fetch applications:", error)
      // Set empty array on error
      setApplications([])
    } finally {
      setPageLoading(false)
    }
  }

  const fetchVacancies = async () => {
    try {
      const data = await api.vacancies.getAll({ page: 1, lang: 'uz' })
      setVacancies(data.results || [])
    } catch (error) {
      console.error("Failed to fetch vacancies:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    try {
      await api.jobApplications.delete(id)
      setApplications(applications.filter((application) => application.id !== id))
      setFilteredApplications(filteredApplications.filter((application) => application.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Failed to delete application. Please try again.")
    }
  }

  const handleCreate = async () => {
    if (!formData.full_name_uz || !formData.diplom_id || !formData.email || !formData.phone || !formData.vakansiya) {
      alert("Barcha majburiy maydonlarni to'ldiring")
      return
    }

    setFormLoading(true)
    try {
      // Ensure both language fields are sent to API
      const applicationData: VakansiyaArizasi = {
        full_name_uz: formData.full_name_uz!,
        full_name_ru: formData.full_name_ru || formData.full_name_uz!,
        diplom_id: formData.diplom_id!,
        email: formData.email!,
        phone: formData.phone!,
        vakansiya: formData.vakansiya!,
        cover_letter_uz: formData.cover_letter_uz || "",
        cover_letter_ru: formData.cover_letter_ru || "",
        status: formData.status || "pending"
      }

      const newApplication = await api.jobApplications.create(applicationData)
      console.log("Created application:", newApplication)
      fetchApplications() // Refresh the list
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create application:", error)
      alert("Failed to create application. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedApplication) {
      alert("Ariza tanlanmagan")
      return
    }

    setFormLoading(true)
    try {
      // Faqat mavjud ma'lumotlarni o'zgartirish - validation yo'q
      const applicationData: VakansiyaArizasi = {
        full_name_uz: formData.full_name_uz || selectedApplication.full_name_uz || selectedApplication.full_name || "",
        full_name_ru: formData.full_name_ru || selectedApplication.full_name_ru || "",
        diplom_id: formData.diplom_id || selectedApplication.diplom_id || "",
        email: formData.email || selectedApplication.email || "",
        phone: formData.phone || selectedApplication.phone || "",
        vakansiya: formData.vakansiya || selectedApplication.vakansiya || 0,
        cover_letter_uz: formData.cover_letter_uz || selectedApplication.cover_letter_uz || selectedApplication.cover_letter || "",
        cover_letter_ru: formData.cover_letter_ru || selectedApplication.cover_letter_ru || "",
        status: formData.status || selectedApplication.status || "pending"
      }

      await api.jobApplications.update(selectedApplication.id, applicationData)
      console.log("Updated application:", selectedApplication.id)
      fetchApplications() // Refresh the list
      setIsEditModalOpen(false)
      setSelectedApplication(null)
      resetForm()
    } catch (error) {
      console.error("Failed to update application:", error)
      alert("Failed to update application. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name_uz: "",
      diplom_id: "",
      email: "",
      phone: "",
      vakansiya: 0,
      cover_letter_uz: "",
      status: "pending"
    })
    setSelectedFile(null)
  }

  const openEditModal = (application: VakansiyaArizasiLanguage) => {
    setSelectedApplication(application)
    setFormData({
      full_name_uz: application.full_name_uz || application.full_name || "",
      full_name_ru: application.full_name_ru || "",
      diplom_id: application.diplom_id || "",
      email: application.email || "",
      phone: application.phone || "",
      vakansiya: application.vakansiya || undefined,
      cover_letter_uz: application.cover_letter_uz || application.cover_letter || "",
      cover_letter_ru: application.cover_letter_ru || "",
      status: application.status || "pending"
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (application: VakansiyaArizasiLanguage) => {
    setSelectedApplication(application)
    setIsViewModalOpen(true)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Til aniqlash funksiyasi - faqat to'ldirilgan fieldlarni tekshiradi
  const detectLanguage = (application: VakansiyaArizasiLanguage) => {
    // Agar full_name_uz va full_name_ru mavjud bo'lsa, qaysi biri to'ldirilganini tekshiramiz
    if (application.full_name_uz && application.full_name_uz.trim() && 
        application.full_name_ru && application.full_name_ru.trim()) {
      // Agar ikkalasi ham to'ldirilgan bo'lsa, uzunligini tekshiramiz
      return application.full_name_uz.length > application.full_name_ru.length ? 'uz' : 'ru'
    }
    // Agar faqat bittasi to'ldirilgan bo'lsa
    if (application.full_name_uz && application.full_name_uz.trim() && 
        (!application.full_name_ru || !application.full_name_ru.trim())) return 'uz'
    if (application.full_name_ru && application.full_name_ru.trim() && 
        (!application.full_name_uz || !application.full_name_uz.trim())) return 'ru'
    
    // Agar hech biri to'ldirilmagan bo'lsa, full_name ni tekshiramiz
    if (application.full_name && application.full_name.trim()) {
      // Bu holatda default o'zbek tiliga qaytaramiz
      return 'uz'
    }
    
    // Default o'zbek tiliga qaytaramiz
    return 'uz'
  }

  // Ma'lumotlarni til asosida ko'rsatish - faqat to'ldirilgan fieldlarni ko'rsatadi
  const getDisplayName = (application: VakansiyaArizasiLanguage) => {
    const lang = detectLanguage(application)
    let name = ''
    
    if (lang === 'ru' && application.full_name_ru && application.full_name_ru.trim()) {
      name = application.full_name_ru
    } else if (lang === 'uz' && application.full_name_uz && application.full_name_uz.trim()) {
      name = application.full_name_uz
    } else if (application.full_name && application.full_name.trim()) {
      name = application.full_name
    }
    
    return name || 'N/A'
  }

  const getDisplayCoverLetter = (application: VakansiyaArizasiLanguage) => {
    const lang = detectLanguage(application)
    let coverLetter = ''
    
    if (lang === 'ru' && application.cover_letter_ru && application.cover_letter_ru.trim()) {
      coverLetter = application.cover_letter_ru
    } else if (lang === 'uz' && application.cover_letter_uz && application.cover_letter_uz.trim()) {
      coverLetter = application.cover_letter_uz
    } else if (application.cover_letter && application.cover_letter.trim()) {
      coverLetter = application.cover_letter
    }
    
    return coverLetter
  }

  // Til badge ko'rsatish
  const getLanguageBadge = (application: VakansiyaArizasiLanguage) => {
    const lang = detectLanguage(application)
    return (
      <Badge className={lang === 'ru' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
        {lang === 'ru' ? 'RU' : 'UZ'}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Kutilmoqda', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      reviewed: { label: 'Ko\'rib chiqilgan', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      accepted: { label: 'Qabul qilingan', className: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Rad etilgan', className: 'bg-red-100 text-red-800 border-red-200' }
    }
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending
    return (
      <Badge className={`${statusInfo.className} border font-medium px-2 py-1 text-xs`}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">Ish Arizalari</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Barcha ish arizalarini boshqarish</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ism, email yoki telefon bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Modal
              title="Yangi Ariza Qo'shish"
              trigger={
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Qo'shish</span>
                  <span className="sm:hidden">Qo'shish</span>
                </Button>
              }
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              size="lg"
            >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name_uz">To'liq ism</Label>
                  <Input
                    id="full_name_uz"
                    value={formData.full_name_uz}
                    onChange={(e) => setFormData({ ...formData, full_name_uz: e.target.value })}
                    placeholder="To'liq ism"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diplom_id">Diplom seriyasi va raqami</Label>
                  <Input
                    id="diplom_id"
                    value={formData.diplom_id}
                    onChange={(e) => setFormData({ ...formData, diplom_id: e.target.value })}
                    placeholder="Diplom seriyasi va raqami"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="vakansiya">Vakansiya</Label>
                  <Select 
                    value={formData.vakansiya && formData.vakansiya > 0 ? formData.vakansiya.toString() : ""} 
                    onValueChange={(value) => setFormData({ ...formData, vakansiya: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {vacancies.map((vacancy) => (
                        <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                          {vacancy.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cover_letter_uz">Izoh xat</Label>
                  <Textarea
                    id="cover_letter_uz"
                    value={formData.cover_letter_uz}
                    onChange={(e) => setFormData({ ...formData, cover_letter_uz: e.target.value })}
                    placeholder="O'zingiz haqingizda qisqacha ma'lumot"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="cover_letter_ru">Izoh xat (Rus)</Label>
                  <Textarea
                    id="cover_letter_ru"
                    value={formData.cover_letter_ru}
                    onChange={(e) => setFormData({ ...formData, cover_letter_ru: e.target.value })}
                    placeholder="Краткая информация о себе"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handleCreate} disabled={formLoading}>
                  {formLoading ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            </div>
          </Modal>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Barcha Arizalar ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {applications.length === 0 ? "Hech qanday ariza topilmadi" : "Qidiruv natijasi yo'q"}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm language-stable-table min-w-[800px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold w-16">№</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold min-w-[150px]">Ism</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold min-w-[200px]">Email</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold min-w-[120px]">Telefon</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold w-32">Holat</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold min-w-[100px]">Sana</th>
                          <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold w-32">Amallar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((application, index) => (
                          <tr key={application.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-2 sm:px-4 text-center text-muted-foreground font-medium">{index + 1}</td>
                            <td className="py-3 px-2 sm:px-4 text-center font-medium">{getDisplayName(application)}</td>
                            <td className="py-3 px-2 sm:px-4 text-center text-muted-foreground">{application.email}</td>
                            <td className="py-3 px-2 sm:px-4 text-center text-muted-foreground">{application.phone}</td>
                            <td className="py-3 px-2 sm:px-4 text-center">
                              {getStatusBadge(application.status)}
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-center text-muted-foreground">
                              {new Date(application.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openViewModal(application)}
                                  className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 p-1 sm:p-2"
                                  title="Ko'rish"
                                >
                                  <Eye size={14} className="sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(application)}
                                  className="text-green-600 hover:text-green-600 hover:bg-green-50 p-1 sm:p-2"
                                  title="Tahrirlash"
                                >
                                  <Edit size={14} className="sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(application.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 sm:p-2"
                                  title="O'chirish"
                                >
                                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tablet Table View */}
                <div className="hidden md:block lg:hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm language-stable-table min-w-[600px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-center py-3 px-2 text-foreground font-semibold w-16">№</th>
                          <th className="text-left py-3 px-2 text-foreground font-semibold min-w-[150px]">Ism</th>
                          <th className="text-left py-3 px-2 text-foreground font-semibold min-w-[200px]">Email</th>
                          <th className="text-left py-3 px-2 text-foreground font-semibold min-w-[120px]">Telefon</th>
                          <th className="text-center py-3 px-2 text-foreground font-semibold w-32">Holat</th>
                          <th className="text-center py-3 px-2 text-foreground font-semibold w-32">Amallar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((application, index) => (
                          <tr key={application.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-2 text-center text-muted-foreground font-medium">{index + 1}</td>
                            <td className="py-3 px-2 text-center text-foreground font-medium">{getDisplayName(application)}</td>
                            <td className="py-3 px-2 text-center text-muted-foreground">{application.email}</td>
                            <td className="py-3 px-2 text-center text-muted-foreground">{application.phone}</td>
                            <td className="py-3 px-2 text-center">
                              {getStatusBadge(application.status)}
                            </td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openViewModal(application)}
                                  className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 p-1"
                                  title="Ko'rish"
                                >
                                  <Eye size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(application)}
                                  className="text-green-600 hover:text-green-600 hover:bg-green-50 p-1"
                                  title="Tahrirlash"
                                >
                                  <Edit size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(application.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1"
                                  title="O'chirish"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="space-y-3">
                    {filteredApplications.map((application, index) => (
                      <Card key={application.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                              <h3 className="font-semibold text-foreground">{getDisplayName(application)}</h3>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewModal(application)}
                                className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 p-2"
                                title="Ko'rish"
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(application)}
                                className="text-green-600 hover:text-green-600 hover:bg-green-50 p-2"
                                title="Tahrirlash"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(application.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                                title="O'chirish"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {application.email && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Email:</span>
                                <span className="text-sm text-foreground">{application.email}</span>
                              </div>
                            )}
                            
                            {application.phone && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Telefon:</span>
                                <span className="text-sm text-foreground">{application.phone}</span>
                              </div>
                            )}
                            
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Holat:</span>
                              {getStatusBadge(application.status)}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Sana:</span>
                              <span className="text-sm text-foreground">
                                {new Date(application.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Modal
          title="Arizani Tahrirlash"
          trigger={null}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          size="lg"
        >
          <div className="space-y-4">
            {/* Faqat to'ldirilgan ism fieldlarini ko'rsatish */}
            {(selectedApplication?.full_name_uz || selectedApplication?.full_name_ru || selectedApplication?.full_name) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedApplication?.full_name_uz && selectedApplication.full_name_uz.trim() && (
                  <div>
                    <Label htmlFor="edit_full_name_uz">To'liq ism (O'zbek)</Label>
                    <Input
                      id="edit_full_name_uz"
                      value={formData.full_name_uz}
                      onChange={(e) => setFormData({ ...formData, full_name_uz: e.target.value })}
                      placeholder="To'liq ism"
                    />
                  </div>
                )}
                {selectedApplication?.full_name_ru && selectedApplication.full_name_ru.trim() && (
                  <div>
                    <Label htmlFor="edit_full_name_ru">To'liq ism (Rus)</Label>
                    <Input
                      id="edit_full_name_ru"
                      value={formData.full_name_ru}
                      onChange={(e) => setFormData({ ...formData, full_name_ru: e.target.value })}
                      placeholder="Полное имя"
                    />
                  </div>
                )}
                {selectedApplication?.full_name && selectedApplication.full_name.trim() && !selectedApplication?.full_name_uz && !selectedApplication?.full_name_ru && (
                  <div>
                    <Label htmlFor="edit_full_name">To'liq ism</Label>
                    <Input
                      id="edit_full_name"
                      value={formData.full_name_uz}
                      onChange={(e) => setFormData({ ...formData, full_name_uz: e.target.value })}
                      placeholder="To'liq ism"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Faqat to'ldirilgan diplom_id va telefon fieldlarini ko'rsatish */}
            {(selectedApplication?.diplom_id || selectedApplication?.phone) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedApplication?.diplom_id && selectedApplication.diplom_id.trim() && (
                  <div>
                    <Label htmlFor="edit_diplom_id">Diplom seriyasi va raqami</Label>
                    <Input
                      id="edit_diplom_id"
                      value={formData.diplom_id}
                      onChange={(e) => setFormData({ ...formData, diplom_id: e.target.value })}
                      placeholder="Diplom seriyasi va raqami"
                    />
                  </div>
                )}
                {selectedApplication?.phone && selectedApplication.phone.trim() && (
                  <div>
                    <Label htmlFor="edit_phone">Telefon</Label>
                    <Input
                      id="edit_phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Faqat to'ldirilgan email va vakansiya fieldlarini ko'rsatish */}
            {(selectedApplication?.email || selectedApplication?.vakansiya) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedApplication?.email && selectedApplication.email.trim() && (
                  <div>
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="edit_vakansiya">Vakansiya</Label>
                  <Select 
                    value={formData.vakansiya && formData.vakansiya > 0 ? formData.vakansiya.toString() : ""} 
                    onValueChange={(value) => setFormData({ ...formData, vakansiya: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {vacancies.map((vacancy) => (
                        <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                          {vacancy.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Holat fieldi - har doim ko'rsatiladi */}
            <div>
              <Label htmlFor="edit_status">Holat</Label>
              <Select value={formData.status || ""} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Holatni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Kutilmoqda</SelectItem>
                  <SelectItem value="reviewed">Ko'rib chiqilgan</SelectItem>
                  <SelectItem value="accepted">Qabul qilingan</SelectItem>
                  <SelectItem value="rejected">Rad etilgan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Faqat to'ldirilgan cover letter fieldlarini ko'rsatish */}
            {(selectedApplication?.cover_letter_uz || selectedApplication?.cover_letter_ru || selectedApplication?.cover_letter) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedApplication?.cover_letter_uz && selectedApplication.cover_letter_uz.trim() && (
                  <div>
                    <Label htmlFor="edit_cover_letter_uz">Izoh xat (O'zbek)</Label>
                    <Textarea
                      id="edit_cover_letter_uz"
                      value={formData.cover_letter_uz}
                      onChange={(e) => setFormData({ ...formData, cover_letter_uz: e.target.value })}
                      placeholder="O'zingiz haqingizda qisqacha ma'lumot"
                      rows={4}
                    />
                  </div>
                )}
                {selectedApplication?.cover_letter_ru && selectedApplication.cover_letter_ru.trim() && (
                  <div>
                    <Label htmlFor="edit_cover_letter_ru">Izoh xat (Rus)</Label>
                    <Textarea
                      id="edit_cover_letter_ru"
                      value={formData.cover_letter_ru}
                      onChange={(e) => setFormData({ ...formData, cover_letter_ru: e.target.value })}
                      placeholder="Краткая информация о себе"
                      rows={4}
                    />
                  </div>
                )}
                {selectedApplication?.cover_letter && selectedApplication.cover_letter.trim() && !selectedApplication?.cover_letter_uz && !selectedApplication?.cover_letter_ru && (
                  <div>
                    <Label htmlFor="edit_cover_letter">Izoh xat</Label>
                    <Textarea
                      id="edit_cover_letter"
                      value={formData.cover_letter_uz}
                      onChange={(e) => setFormData({ ...formData, cover_letter_uz: e.target.value })}
                      placeholder="O'zingiz haqingizda qisqacha ma'lumot"
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Bekor qilish
              </Button>
              <Button onClick={handleEdit} disabled={formLoading}>
                {formLoading ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          title="Ariza Ma'lumotlari"
          trigger={null}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          size="lg"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>To'liq ism</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">{getDisplayName(selectedApplication)}</p>
                    {getLanguageBadge(selectedApplication)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedApplication.diplom_id && selectedApplication.diplom_id.trim() && (
                  <div>
                    <Label>Diplom seriyasi va raqami</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedApplication.diplom_id}</p>
                  </div>
                )}
                {selectedApplication.email && selectedApplication.email.trim() && (
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedApplication.email}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedApplication.phone && selectedApplication.phone.trim() && (
                  <div>
                    <Label>Telefon</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedApplication.phone}</p>
                  </div>
                )}
                <div>
                  <Label>Vakansiya</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedApplication.vakansiya_title || 'Vakansiya tanlanmagan'}
                  </p>
                </div>
              </div>

              <div className="w-full">
                <Label>Holat</Label>
                <div className="mt-1 flex justify-start">
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>

              {getDisplayCoverLetter(selectedApplication) && (
                <div className="w-full max-w-full">
                  <Label className="text-sm font-medium text-foreground mb-2">Haqida</Label>
                  <div className="p-4 bg-muted/20 rounded-lg border border-border/50 shadow-sm max-w-full overflow-hidden">
                    <div className="max-h-40 overflow-y-auto max-w-full">
                      <div className="text-sm text-foreground leading-relaxed max-w-full break-all whitespace-pre-wrap" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                        {getDisplayCoverLetter(selectedApplication)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>Yaratilgan sana</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedApplication.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Yopish
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedApplication)
                }}>
                  Tahrirlash
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
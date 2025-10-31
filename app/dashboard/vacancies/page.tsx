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
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Search, Plus, Edit, Eye, Power, PowerOff, X } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardLayout from "@/components/dashboard/layout"
import { NoSSR } from "@/components/ui/no-ssr"
import { api } from "@/lib/api-services"
import type { VakansiyaLanguage, Vakansiya, CategoryLanguage, WorkTypeLanguage } from "@/lib/types"

export default function VacanciesPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  // Simplified - no language switching
  const [vacancies, setVacancies] = useState<VakansiyaLanguage[]>([])
  const [filteredVacancies, setFilteredVacancies] = useState<VakansiyaLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedVacancy, setSelectedVacancy] = useState<VakansiyaLanguage | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<Partial<Vakansiya>>({
    title_uz: "",
    title_ru: "",
    description_uz: "",
    description_ru: "",
    requirements_uz: "",
    requirements_ru: "",
    expiring_date: "",
    category: undefined,
    work_type: undefined,
    is_active: false
  })
  const [formLoading, setFormLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryLanguage[]>([])
  const [workTypes, setWorkTypes] = useState<WorkTypeLanguage[]>([])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    // Prefer parsing plain YYYY-MM-DD to avoid TZ shifts
    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (m) {
      const [_, y, mo, d] = m
      return `${d}.${mo}.${y}`
    }
    const dte = new Date(dateStr)
    if (isNaN(dte.getTime())) return dateStr
    const d = String(dte.getDate()).padStart(2, '0')
    const mth = String(dte.getMonth() + 1).padStart(2, '0')
    const y = dte.getFullYear()
    return `${d}.${mth}.${y}`
  }

  const getCategoryName = (id?: number) => {
    if (!id) return ""
    const found = categories.find(c => c.id === id)
    return found?.name_uz || found?.name || String(id)
  }

  const getWorkTypeName = (id?: number) => {
    if (!id) return ""
    const found = workTypes.find(w => w.id === id)
    return found?.name_uz || found?.name || String(id)
  }

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
      fetchVacancies()
      fetchMeta()
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    const filtered = vacancies.filter(
      (vacancy) =>
        (vacancy.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vacancy.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredVacancies(filtered)
  }, [searchTerm, vacancies])

  const fetchVacancies = async () => {
    try {
      console.log("Fetching vacancies...")
      const data = await api.vacancies.getAll({ page: 1, lang: 'uz' })
      console.log("Vacancies data:", data)
      setVacancies(data.results || [])
    } catch (error) {
      console.error("Failed to fetch vacancies:", error)
      // Set empty array on error
      setVacancies([])
    } finally {
      setPageLoading(false)
    }
  }

  const fetchMeta = async () => {
    try {
      const [cats, wts] = await Promise.all([
        api.categories.getAll({ page: 1 }),
        api.workTypes.getAll({ page: 1 }),
      ])
      setCategories(cats.results || [])
      setWorkTypes(wts.results || [])
    } catch (e) {
      console.error('Failed to fetch categories/work types', e)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bu vakansiyani butunlay o'chirishni xohlaysizmi? Bu amal qaytarib bo'lmaydi.")) return

    try {
      await api.vacancies.delete(id)
      setVacancies(vacancies.filter((vacancy) => vacancy.id !== id))
      setFilteredVacancies(filteredVacancies.filter((vacancy) => vacancy.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Vakansiyani o'chirishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? "nofaol" : "faol"
    if (!confirm(`Bu vakansiyani ${action} qilishni xohlaysizmi?`)) return

    try {
      const newStatus = !currentStatus
      console.log(`Updating vacancy ${id}: is_active from ${currentStatus} to ${newStatus}`)
      
      const updateData = { is_active: newStatus }
      console.log("Sending data to API:", updateData)
      
      await api.vacancies.partialUpdate(id, updateData)
      
      console.log("API call successful, updating local state")
      
      // Update the vacancy in the list
      setVacancies(vacancies.map(vacancy => 
        vacancy.id === id ? { ...vacancy, is_active: newStatus } : vacancy
      ))
      setFilteredVacancies(filteredVacancies.map(vacancy => 
        vacancy.id === id ? { ...vacancy, is_active: newStatus } : vacancy
      ))
      
      console.log("Local state updated successfully")
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Vakansiya holatini o'zgartirishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  }

  const handleCreate = async () => {
    if (!formData.title_uz || !formData.title_ru || !formData.description_uz || !formData.description_ru) {
      alert("Iltimos, majburiy maydonlarni to'ldiring")
      return
    }
    if (!formData.expiring_date) {
      alert("Yakunlanish sanasi majburiy")
      return
    }
    if (!formData.category || !formData.work_type) {
      alert("Kategoriya va Ish turini tanlang")
      return
    }

    setFormLoading(true)
    try {
      // Ensure both language fields are sent to API
      const vacancyData: Vakansiya = {
        title_uz: formData.title_uz!,
        title_ru: formData.title_ru!,
        description_uz: formData.description_uz!,
        description_ru: formData.description_ru!,
        requirements_uz: formData.requirements_uz || "",
        requirements_ru: formData.requirements_ru || "",
        expiring_date: formData.expiring_date!,
        category: formData.category!,
        work_type: formData.work_type!,
        is_active: formData.is_active || false
      }
      
      const newVacancy = await api.vacancies.create(vacancyData)
      console.log("Created vacancy:", newVacancy)
      fetchVacancies() // Refresh the list
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create vacancy:", error)
      alert("Vakansiya yaratishda xatolik. Qayta urinib ko'ring.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedVacancy || !formData.title_uz || !formData.title_ru || !formData.description_uz || !formData.description_ru) {
      alert("Iltimos, majburiy maydonlarni to'ldiring")
      return
    }
    if (!formData.expiring_date) {
      alert("Yakunlanish sanasi majburiy")
      return
    }
    if (!formData.category || !formData.work_type) {
      alert("Kategoriya va Ish turini tanlang")
      return
    }

    setFormLoading(true)
    try {
      // Ensure both language fields are sent to API
      const vacancyData: Vakansiya = {
        title_uz: formData.title_uz!,
        title_ru: formData.title_ru!,
        description_uz: formData.description_uz!,
        description_ru: formData.description_ru!,
        requirements_uz: formData.requirements_uz || "",
        requirements_ru: formData.requirements_ru || "",
        expiring_date: formData.expiring_date!,
        category: formData.category!,
        work_type: formData.work_type!,
        is_active: formData.is_active || false
      }
      
      await api.vacancies.update(selectedVacancy.id, vacancyData)
      console.log("Updated vacancy:", selectedVacancy.id)
      fetchVacancies() // Refresh the list
      setIsEditModalOpen(false)
      setSelectedVacancy(null)
      resetForm()
    } catch (error) {
      console.error("Failed to update vacancy:", error)
      alert("Vakansiyani yangilashda xatolik. Qayta urinib ko'ring.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title_uz: "",
      title_ru: "",
      description_uz: "",
      description_ru: "",
      requirements_uz: "",
      requirements_ru: "",
      expiring_date: "",
      category: undefined,
      work_type: undefined,
      is_active: false
    })
  }

  const openEditModal = (vacancy: VakansiyaLanguage) => {
    setSelectedVacancy(vacancy)
    setFormData({
      title_uz: vacancy.title_uz || "",
      title_ru: vacancy.title_ru || "",
      description_uz: vacancy.description_uz || "",
      description_ru: vacancy.description_ru || "",
      requirements_uz: vacancy.requirements_uz || "",
      requirements_ru: vacancy.requirements_ru || "",
      expiring_date: (vacancy as any).expiring_date || "",
      category: (vacancy as any).category || undefined,
      work_type: (vacancy as any).work_type || (vacancy as any).working_type || undefined,
      is_active: vacancy.is_active
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (vacancy: VakansiyaLanguage) => {
    setSelectedVacancy(vacancy)
    setIsViewModalOpen(true)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (loading || !isAuthenticated) {
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
      <NoSSR fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      }>
        <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Vakansiyalar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Ish o'rinlarini boshqarish</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nomi, tavsifi yoki maosh bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted"
                title="Filterni tozalash"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Modal
            title="Yangi Vakansiya Qo'shish"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Nomi (O'zbek)
                  </Label>
                  <Input
                    id="title_uz"
                    value={formData.title_uz}
                    onChange={(e) => setFormData({...formData, title_uz: e.target.value})}
                    placeholder="Vakansiya nomi"
                  />
                </div>
                <div>
                  <Label htmlFor="title_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Nomi (Rus)
                  </Label>
                  <Input
                    id="title_ru"
                    value={formData.title_ru}
                    onChange={(e) => setFormData({...formData, title_ru: e.target.value})}
                    placeholder="Название вакансии"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Tavsif (O'zbek)
                  </Label>
                  <Textarea
                    id="description_uz"
                    value={formData.description_uz}
                    onChange={(e) => setFormData({...formData, description_uz: e.target.value})}
                    placeholder="Vakansiya tavsifi"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Tavsif (Rus)
                  </Label>
                  <Textarea
                    id="description_ru"
                    value={formData.description_ru}
                    onChange={(e) => setFormData({...formData, description_ru: e.target.value})}
                    placeholder="Описание вакансии"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requirements_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Talablar (O'zbek)
                  </Label>
                  <Textarea
                    id="requirements_uz"
                    value={formData.requirements_uz}
                    onChange={(e) => setFormData({...formData, requirements_uz: e.target.value})}
                    placeholder="Ish tajribasi va talablar"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="requirements_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Talablar (Rus)
                  </Label>
                  <Textarea
                    id="requirements_ru"
                    value={formData.requirements_ru}
                    onChange={(e) => setFormData({...formData, requirements_ru: e.target.value})}
                    placeholder="Требования и опыт работы"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Kategoriya</Label>
                  <Select
                    value={formData.category ? String(formData.category) : undefined}
                    onValueChange={(val) => setFormData({ ...formData, category: parseInt(val) })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Kategoriyani tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name_uz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="working_type">Ish turi</Label>
                  <Select
                    value={formData.work_type ? String(formData.work_type) : undefined}
                    onValueChange={(val) => setFormData({ ...formData, work_type: parseInt(val) })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ish turini tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {workTypes.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>{w.name_uz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiring_date">Yakunlanish sanasi</Label>
                  <Input
                    id="expiring_date"
                    type="date"
                    value={formData.expiring_date || ""}
                    onChange={(e) => setFormData({ ...formData, expiring_date: e.target.value })}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: !!checked})}
                />
                <Label htmlFor="is_active">Faol</Label>
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
            <CardTitle>Barcha Vakansiyalar ({filteredVacancies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
            ) : filteredVacancies.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {vacancies.length === 0 ? "Vakansiyalar topilmadi" : "Qidiruv natijasi yo'q"}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredVacancies.map((vacancy) => (
                  <div key={vacancy.id} className="border border-border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-2">{vacancy.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2">{vacancy.description}</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Yakunlanish: {formatDate((vacancy as any).expiring_date) || '-'}</span>
                          <span className={`px-2 py-1 rounded-full text-xs w-fit ${
                            vacancy.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {vacancy.is_active ? 'Faol' : 'Nofaol'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewModal(vacancy)}
                          className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 p-1 sm:p-2"
                          title="Ko'rish"
                        >
                          <Eye size={14} className="sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(vacancy)}
                          className="text-green-600 hover:text-green-600 hover:bg-green-50 p-1 sm:p-2"
                          title="Tahrirlash"
                        >
                          <Edit size={14} className="sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(vacancy.id, vacancy.is_active)}
                          className={vacancy.is_active 
                            ? "text-orange-600 hover:text-orange-600 hover:bg-orange-50 p-1 sm:p-2" 
                            : "text-green-600 hover:text-green-600 hover:bg-green-50 p-1 sm:p-2"
                          }
                          title={vacancy.is_active ? "Nofaol qilish" : "Faol qilish"}
                        >
                          {vacancy.is_active ? <PowerOff size={14} className="sm:w-4 sm:h-4" /> : <Power size={14} className="sm:w-4 sm:h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(vacancy.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 sm:p-2"
                          title="Butunlay o'chirish"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Modal
          title="Vakansiyani Tahrirlash"
          trigger={null}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_title_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Nomi (O'zbek)
                </Label>
                <Input
                  id="edit_title_uz"
                  value={formData.title_uz}
                  onChange={(e) => setFormData({...formData, title_uz: e.target.value})}
                  placeholder="Vakansiya nomi"
                />
              </div>
              <div>
                <Label htmlFor="edit_title_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Nomi (Rus)
                </Label>
                <Input
                  id="edit_title_ru"
                  value={formData.title_ru}
                  onChange={(e) => setFormData({...formData, title_ru: e.target.value})}
                  placeholder="Название вакансии"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_description_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Tavsif (O'zbek)
                </Label>
                <Textarea
                  id="edit_description_uz"
                  value={formData.description_uz}
                  onChange={(e) => setFormData({...formData, description_uz: e.target.value})}
                  placeholder="Vakansiya tavsifi"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit_description_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Tavsif (Rus)
                </Label>
                <Textarea
                  id="edit_description_ru"
                  value={formData.description_ru}
                  onChange={(e) => setFormData({...formData, description_ru: e.target.value})}
                  placeholder="Описание вакансии"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_requirements_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Talablar (O'zbek)
                </Label>
                <Textarea
                  id="edit_requirements_uz"
                  value={formData.requirements_uz}
                  onChange={(e) => setFormData({...formData, requirements_uz: e.target.value})}
                  placeholder="Ish tajribasi va talablar"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit_requirements_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Talablar (Rus)
                </Label>
                <Textarea
                  id="edit_requirements_ru"
                  value={formData.requirements_ru}
                  onChange={(e) => setFormData({...formData, requirements_ru: e.target.value})}
                  placeholder="Требования и опыт работы"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit_category">Kategoriya</Label>
                <Select
                  value={formData.category ? String(formData.category) : undefined}
                  onValueChange={(val) => setFormData({ ...formData, category: parseInt(val) })}
                >
                  <SelectTrigger className="w-full" id="edit_category">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name_uz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_working_type">Ish turi</Label>
                <Select
                  value={formData.work_type ? String(formData.work_type) : undefined}
                  onValueChange={(val) => setFormData({ ...formData, work_type: parseInt(val) })}
                >
                  <SelectTrigger className="w-full" id="edit_working_type">
                    <SelectValue placeholder="Ish turini tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>{w.name_uz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_expiring_date">Yakunlanish sanasi</Label>
                <Input
                  id="edit_expiring_date"
                  type="date"
                  value={formData.expiring_date || ""}
                  onChange={(e) => setFormData({ ...formData, expiring_date: e.target.value })}
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_active"
                checked={!!formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <Label htmlFor="edit_is_active">Faol</Label>
            </div>

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
          title="Vakansiya Ma'lumotlari"
          trigger={null}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          size="lg"
        >
          {selectedVacancy && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Nomi (O'zbek)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedVacancy.title_uz || selectedVacancy.title}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Nomi (Rus)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedVacancy.title_ru || selectedVacancy.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Tavsif (O'zbek)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedVacancy.description_uz || selectedVacancy.description}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Tavsif (Rus)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedVacancy.description_ru || selectedVacancy.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Talablar (O'zbek)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedVacancy.requirements_uz || selectedVacancy.requirements || "Kiritilmagan"}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Talablar (Rus)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedVacancy.requirements_ru || selectedVacancy.requirements || "Не указано"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Yakunlanish sanasi</Label>
                  <p className="text-sm text-muted-foreground mt-1">{formatDate((selectedVacancy as any).expiring_date) || "Kiritilmagan"}</p>
                </div>
                <div>
                  <Label>Holat</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedVacancy.is_active ? 'Faol' : 'Nofaol'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategoriya</Label>
                  <p className="text-sm text-muted-foreground mt-1">{getCategoryName((selectedVacancy as any).category)}</p>
                </div>
                <div>
                  <Label>Ish turi</Label>
                  <p className="text-sm text-muted-foreground mt-1">{getWorkTypeName((selectedVacancy as any).work_type || (selectedVacancy as any).working_type)}</p>
                </div>
              </div>

              <div>
                <Label>Yaratilgan sana</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedVacancy.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Yopish
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedVacancy)
                }}>
                  Tahrirlash
                </Button>
              </div>
            </div>
          )}
        </Modal>
        </div>
      </NoSSR>
    </DashboardLayout>
  )
}
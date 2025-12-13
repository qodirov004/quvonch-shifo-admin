"use client"

import type React from "react"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Search, Plus, Edit, Eye, X } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { ServiceLanguage, Service } from "@/lib/types"
import { SERVICE_CHOICES_UZ as choicesUz, SERVICE_CHOICES_RU as choicesRu } from "@/lib/types"

export default function ServicesPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  const [services, setServices] = useState<ServiceLanguage[]>([])
  const [filteredServices, setFilteredServices] = useState<ServiceLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [mounted, setMounted] = useState(false)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceLanguage | null>(null)

  // Form states
  const [formData, setFormData] = useState<Partial<Service>>({
    category_uz: "",
    category_ru: "",
    type_uz: "",
    type_ru: "",
    price: 0,
  })
  const [formLoading, setFormLoading] = useState(false)

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
      fetchServices()
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    const filtered = services.filter((service) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        service.type_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.type_ru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category_uz.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category_ru.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === "all" || service.category_uz === categoryFilter

      return matchesSearch && matchesCategory
    })
    setFilteredServices(filtered)
  }, [searchTerm, categoryFilter, services])

  const fetchServices = async () => {
    try {
      console.log("Fetching services...")
      const data = await api.services.getAll({ page: 1, lang: "uz" })
      console.log("Services data:", data)
      setServices(data.results || [])
    } catch (error) {
      console.error("Failed to fetch services:", error)
      setServices([])
    } finally {
      setPageLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bu xizmatni o'chirishni xohlaysizmi?")) return

    try {
      await api.services.delete(id)
      setServices(services.filter((srv) => srv.id !== id))
      setFilteredServices(filteredServices.filter((srv) => srv.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Xizmatni o'chirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
    }
  }

  const handleCreate = async () => {
    if (!formData.category_uz || !formData.category_ru || !formData.type_uz || !formData.type_ru || !formData.price) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring")
      return
    }

    setFormLoading(true)
    try {
      const payload: Service = {
        category_uz: formData.category_uz!,
        category_ru: formData.category_ru!,
        type_uz: formData.type_uz!,
        type_ru: formData.type_ru!,
        price: formData.price!,
      }

      await api.services.create(payload)
      console.log("Created service:", payload)
      fetchServices() // Refresh the list
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create service:", error)
      alert("Xizmatni yaratishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedService || !formData.category_uz || !formData.category_ru || !formData.type_uz || !formData.type_ru || !formData.price) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring")
      return
    }

    setFormLoading(true)
    try {
      const payload: Service = {
        category_uz: formData.category_uz!,
        category_ru: formData.category_ru!,
        type_uz: formData.type_uz!,
        type_ru: formData.type_ru!,
        price: formData.price!,
      }

      await api.services.update(selectedService.id, payload)
      console.log("Updated service:", selectedService.id)
      fetchServices() // Refresh the list
      setIsEditModalOpen(false)
      setSelectedService(null)
      resetForm()
    } catch (error) {
      console.error("Failed to update service:", error)
      alert("Xizmatni yangilashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      category_uz: "",
      category_ru: "",
      type_uz: "",
      type_ru: "",
      price: 0,
    })
  }

  const openEditModal = (service: ServiceLanguage) => {
    setSelectedService(service)
    setFormData({
      category_uz: service.category_uz || "",
      category_ru: service.category_ru || "",
      type_uz: service.type_uz || "",
      type_ru: service.type_ru || "",
      price: service.price || 0,
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (service: ServiceLanguage) => {
    setSelectedService(service)
    setIsViewModalOpen(true)
  }

  const getCategoryLabel = (value: string, lang: 'uz' | 'ru') => {
    const choices = lang === 'uz' ? choicesUz : choicesRu
    const choice = choices.find((c) => c.value === value)
    return choice ? choice.label : value
  }

  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Xizmatlar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Xizmatlarni boshqarish</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nomi yoki kategoriya bo'yicha qidirish..."
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
                title="Qidiruvni tozalash"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Kategoriya bo'yicha filtrlash" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha kategoriyalar</SelectItem>
              {choicesUz.map((choice) => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchTerm || categoryFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("all")
              }}
              className="w-full sm:w-auto"
              title="Barcha filtrlarni tozalash"
            >
              <X className="w-4 h-4 mr-2" />
              Tozalash
            </Button>
          )}
          <Modal
            title="Yangi Xizmat Qo'shish"
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
                  <Label htmlFor="category_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Xizmat turi (O'zbek)
                  </Label>
                  <Select
                    value={formData.category_uz || ""}
                    onValueChange={(value) => setFormData({ ...formData, category_uz: value })}
                  >
                    <SelectTrigger id="category_uz" className="w-full">
                      <SelectValue placeholder="Kategoriyani tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {choicesUz.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Xizmat turi (Rus)
                  </Label>
                  <Select
                    value={formData.category_ru || ""}
                    onValueChange={(value) => setFormData({ ...formData, category_ru: value })}
                  >
                    <SelectTrigger id="category_ru" className="w-full">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {choicesRu.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Xizmat nomi (O'zbek)
                  </Label>
                  <Input
                    id="type_uz"
                    value={formData.type_uz}
                    onChange={(e) => setFormData({ ...formData, type_uz: e.target.value })}
                    placeholder="Xizmat nomi"
                  />
                </div>
                <div>
                  <Label htmlFor="type_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Xizmat nomi (Rus)
                  </Label>
                  <Input
                    id="type_ru"
                    value={formData.type_ru}
                    onChange={(e) => setFormData({ ...formData, type_ru: e.target.value })}
                    placeholder="Название услуги"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Narx</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price === 0 ? "" : formData.price || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, price: value === "" ? 0 : Number.parseFloat(value) || 0 });
                  }}
                  placeholder="Narx"
                  min="0"
                  step="0.01"
                />
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

        {pageLoading ? (
          <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
        ) : filteredServices.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            {services.length === 0 ? "Xizmatlar topilmadi" : "Qidiruv natijasi yo'q"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-foreground mb-1">{service.type_uz}</h3>
                    <p className="text-sm text-muted-foreground">{getCategoryLabel(service.category_uz, 'uz')}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Narx:</span>
                      <span className="text-sm font-medium">{service.price?.toLocaleString('uz-UZ')} so'm</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openViewModal(service)}
                      className="flex-1 text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                      title="Ko'rish"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ko'rish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(service)}
                      className="flex-1 text-green-600 hover:text-green-600 hover:bg-green-50"
                      title="Tahrirlash"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Tahrirlash
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      O'chirish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          title="Xizmat Ma'lumotlarini Tahrirlash"
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_category_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Xizmat turi (O'zbek)
                </Label>
                <Select
                  value={formData.category_uz || ""}
                  onValueChange={(value) => setFormData({ ...formData, category_uz: value })}
                >
                  <SelectTrigger id="edit_category_uz" className="w-full">
                    <SelectValue placeholder="Kategoriyani tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {choicesUz.map((choice) => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_category_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Xizmat turi (Rus)
                </Label>
                <Select
                  value={formData.category_ru || ""}
                  onValueChange={(value) => setFormData({ ...formData, category_ru: value })}
                >
                  <SelectTrigger id="edit_category_ru" className="w-full">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {choicesRu.map((choice) => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_type_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Xizmat nomi (O'zbek)
                </Label>
                <Input
                  id="edit_type_uz"
                  value={formData.type_uz}
                  onChange={(e) => setFormData({ ...formData, type_uz: e.target.value })}
                  placeholder="Xizmat nomi"
                />
              </div>
              <div>
                <Label htmlFor="edit_type_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Xizmat nomi (Rus)
                </Label>
                <Input
                  id="edit_type_ru"
                  value={formData.type_ru}
                  onChange={(e) => setFormData({ ...formData, type_ru: e.target.value })}
                  placeholder="Название услуги"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_price">Narx</Label>
              <Input
                id="edit_price"
                type="number"
                value={formData.price === 0 ? "" : formData.price || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, price: value === "" ? 0 : Number.parseFloat(value) || 0 });
                }}
                placeholder="Narx"
                min="0"
                step="0.01"
              />
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
          title="Xizmat Ma'lumotlari"
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        >
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">ID</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">#{selectedService.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Xizmat turi (O'zbek)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{getCategoryLabel(selectedService.category_uz, 'uz')}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Xizmat turi (Rus)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{getCategoryLabel(selectedService.category_ru, 'ru')}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Xizmat nomi (O'zbek)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedService.type_uz || '—'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Xizmat nomi (Rus)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedService.type_ru || '—'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Narx</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedService.price?.toLocaleString('uz-UZ')} so'm
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Yaratilgan sana</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedService.created_at).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Yopish
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedService)
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

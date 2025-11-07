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
import { Trash2, Search, Plus, Edit, Eye, X, UserCircle2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { ServicePriceLanguage, ServicePrice, DoctorLanguage } from "@/lib/types"

export default function ServicePricePage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  const [doctors, setDoctors] = useState<DoctorLanguage[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  
  // Modal states
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorLanguage | null>(null)
  const [selectedServicePrice, setSelectedServicePrice] = useState<ServicePriceLanguage | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<Partial<ServicePrice>>({
    name_uz: "",
    name_ru: "",
    price: 0,
    is_active: false
  })
  const [formLoading, setFormLoading] = useState(false)
  const [doctorServicePrices, setDoctorServicePrices] = useState<ServicePriceLanguage[]>([])
  const [doctorServicePricesLoading, setDoctorServicePricesLoading] = useState(false)

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
      fetchDoctors()
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    const filtered = doctors.filter(
      (doc) =>
        (doc.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialty || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

  const fetchDoctors = async () => {
    try {
      const data = await api.doctors.getAll({ page: 1, lang: 'uz' })
      setDoctors(data.results || [])
      setFilteredDoctors(data.results || [])
    } catch (error) {
      console.error("Failed to fetch doctors:", error)
      setDoctors([])
      setFilteredDoctors([])
    } finally {
      setPageLoading(false)
    }
  }

  const fetchDoctorServicePrices = async (doctorId: number) => {
    setDoctorServicePricesLoading(true)
    try {
      const data = await api.servicePrice.getAll({ page: 1, lang: 'uz', doctorId })
      setDoctorServicePrices(data.results || [])
    } catch (e) {
      console.error('Failed to fetch service prices for doctor', e)
      setDoctorServicePrices([])
    } finally {
      setDoctorServicePricesLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bu xizmat narxini o'chirmoqchimisiz?")) return

    try {
      await api.servicePrice.delete(id)
      if (selectedDoctor?.id) await fetchDoctorServicePrices(selectedDoctor.id)
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Xizmat narxini o'chirishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? "nofaol" : "faol"
    if (!confirm(`Bu xizmat narxini ${action} qilmoqchimisiz?`)) return

    try {
      const newStatus = !currentStatus
      await api.servicePrice.partialUpdate(id, { is_active: newStatus })
      
      setDoctorServicePrices(prev => prev.map((item: ServicePriceLanguage) =>
        item.id === id ? { ...item, is_active: newStatus } : item
      ))
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Xizmat narxi holatini o'zgartirishda xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  }

  const handleCreate = async () => {
    if (!formData.name_uz || !formData.name_ru || !formData.price || formData.price <= 0) {
      alert("Iltimos, majburiy maydonlarni to'ldiring va narxni to'g'ri kiriting")
      return
    }

    setFormLoading(true)
    try {
      const servicePriceData: ServicePrice = {
        name_uz: formData.name_uz!,
        name_ru: formData.name_ru!,
        price: formData.price!,
        doctor: selectedDoctor?.id,
        is_active: formData.is_active || false
      }
      
      await api.servicePrice.create(servicePriceData)
      if (selectedDoctor?.id) await fetchDoctorServicePrices(selectedDoctor.id)
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create service price:", error)
      alert("Xizmat narxini yaratishda xatolik. Qayta urinib ko'ring.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedServicePrice || !formData.name_uz || !formData.name_ru || !formData.price || formData.price <= 0) {
      alert("Iltimos, majburiy maydonlarni to'ldiring va narxni to'g'ri kiriting")
      return
    }

    setFormLoading(true)
    try {
      const servicePriceData: ServicePrice = {
        name_uz: formData.name_uz!,
        name_ru: formData.name_ru!,
        price: formData.price!,
        doctor: selectedDoctor?.id,
        is_active: formData.is_active || false
      }
      
      await api.servicePrice.update(selectedServicePrice.id, servicePriceData)
      if (selectedDoctor?.id) await fetchDoctorServicePrices(selectedDoctor.id)
      setIsEditModalOpen(false)
      setSelectedServicePrice(null)
      resetForm()
    } catch (error) {
      console.error("Failed to update service price:", error)
      alert("Xizmat narxini yangilashda xatolik. Qayta urinib ko'ring.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name_uz: "",
      name_ru: "",
      price: 0,
      is_active: false
    })
  }

  const openEditModal = (servicePrice: ServicePriceLanguage) => {
    setSelectedServicePrice(servicePrice)
    setFormData({
      name_uz: servicePrice.name_uz || "",
      name_ru: servicePrice.name_ru || "",
      price: servicePrice.price,
      is_active: servicePrice.is_active
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (servicePrice: ServicePriceLanguage) => {
    setSelectedServicePrice(servicePrice)
    setIsViewModalOpen(true)
  }

  const openManageModal = async (doctor: DoctorLanguage) => {
    setSelectedDoctor(doctor)
    await fetchDoctorServicePrices(doctor.id)
    setIsManageModalOpen(true)
  }

  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Xizmat Narxlari</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Shifokorlar bo'yicha xizmat narxlarini boshqarish</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Shifokor ismi yoki mutaxassisligi bo'yicha qidirish..."
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
            title={`Yangi Xizmat Narxi Qo'shish${selectedDoctor ? ` — ${selectedDoctor.full_name}` : ''}`}
            trigger={null}
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Nomi (O'zbek)
                  </Label>
                  <Input
                    id="name_uz"
                    value={formData.name_uz}
                    onChange={(e) => setFormData({...formData, name_uz: e.target.value})}
                    placeholder="Xizmat nomi"
                  />
                </div>
                <div>
                  <Label htmlFor="name_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Nomi (Rus)
                  </Label>
                  <Input
                    id="name_ru"
                    value={formData.name_ru}
                    onChange={(e) => setFormData({...formData, name_ru: e.target.value})}
                    placeholder="Название услуги"
                  />
                </div>
              </div>
              
              

              <div>
                <Label htmlFor="price">Narx (so'm)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  placeholder="Narx"
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

        <Card>
          <CardHeader>
            <CardTitle>Shifokorlar ro'yxati ({filteredDoctors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {doctors.length === 0 ? "Shifokorlar topilmadi" : "Qidiruv natijasi yo'q"}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => openManageModal(doc)}
                    className="w-full text-left p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    title="Xizmat narxlarini boshqarish"
                  >
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {doc.image ? (
                          <img
                            src={doc.image}
                            alt={doc.full_name}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center border">
                            <UserCircle2 className="text-muted-foreground" size={22} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-foreground font-semibold text-sm sm:text-base truncate">{doc.full_name}</h3>
                          <p className="text-muted-foreground text-xs sm:text-sm truncate">{doc.specialty}</p>
                        </div>
                      </div>
                      <div>
                        <Eye size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manage Service Prices for Selected Doctor */}
        <Modal
          title={selectedDoctor ? `Xizmat narxlari — ${selectedDoctor.full_name}` : "Xizmat narxlari"}
          trigger={null}
          open={isManageModalOpen}
          onOpenChange={setIsManageModalOpen}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedDoctor?.specialty}
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Yangi xizmat
              </Button>
            </div>

            {doctorServicePricesLoading ? (
              <div className="text-muted-foreground text-center py-6">Yuklanmoqda...</div>
            ) : doctorServicePrices.length === 0 ? (
              <div className="text-muted-foreground text-center py-6">Xizmat narxlari topilmadi</div>
            ) : (
              <div className="space-y-3">
                {doctorServicePrices.map(item => (
                  <div key={item.id} className="p-3 border rounded-lg flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-sm sm:text-base">{item.name}</h3>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded w-fit flex items-center gap-1">
                          {item.price.toLocaleString('uz-UZ')} so'm
                        </span>
                        {/* is_active badge removed */}
                      </div>
                      {item.description && (
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewModal(item)}
                        className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 p-1 sm:p-2"
                        title="Ko'rish"
                      >
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(item)}
                        className="text-green-600 hover:text-green-600 hover:bg-green-50 p-1 sm:p-2"
                        title="Tahrirlash"
                      >
                        <Edit size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                      {/* is_active toggle removed from list */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Bu xizmat narxini o'chirmoqchimisiz?")) return
                          try {
                            await api.servicePrice.delete(item.id)
                            if (selectedDoctor?.id) await fetchDoctorServicePrices(selectedDoctor.id)
                          } catch (e) {
                            alert("O'chirishda xatolik")
                          }
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 sm:p-2"
                        title="O'chirish"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          title="Xizmat Narxini Tahrirlash"
          trigger={null}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Nomi (O'zbek)
                </Label>
                <Input
                  id="edit_name_uz"
                  value={formData.name_uz}
                  onChange={(e) => setFormData({...formData, name_uz: e.target.value})}
                  placeholder="Xizmat nomi"
                />
              </div>
              <div>
                <Label htmlFor="edit_name_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Nomi (Rus)
                </Label>
                <Input
                  id="edit_name_ru"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({...formData, name_ru: e.target.value})}
                  placeholder="Название услуги"
                />
              </div>
            </div>
            
            

            <div>
              <Label htmlFor="edit_price">Narx (so'm)</Label>
              <Input
                id="edit_price"
                type="number"
                min="0"
                step="1000"
                value={formData.price || 0}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                placeholder="Narx"
              />
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
          title="Xizmat Narxi Ma'lumotlari"
          trigger={null}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          size="lg"
        >
          {selectedServicePrice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Nomi (O'zbek)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedServicePrice.name_uz || selectedServicePrice.name}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Nomi (Rus)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedServicePrice.name_ru || selectedServicePrice.name}</p>
                </div>
              </div>
              
              {selectedServicePrice.description_uz || selectedServicePrice.description_ru ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                      Tavsif (O'zbek)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedServicePrice.description_uz || selectedServicePrice.description || "Kiritilmagan"}</p>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-600">🇷🇺</span>
                      Tavsif (Rus)
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedServicePrice.description_ru || selectedServicePrice.description || "Не указано"}</p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Narx</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedServicePrice.price.toLocaleString('uz-UZ')} so'm</p>
                </div>
                <div>
                  <Label>Holat</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedServicePrice.is_active ? 'Faol' : 'Nofaol'}
                  </p>
                </div>
              </div>

              <div>
                <Label>Yaratilgan sana</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(selectedServicePrice.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Yopish
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedServicePrice)
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


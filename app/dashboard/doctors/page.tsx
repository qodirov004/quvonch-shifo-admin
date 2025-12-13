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
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Search, Plus, Edit, Eye, X, Star } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { DoctorLanguage, Doctor } from "@/lib/types"

export default function DoctorsPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  // Simplified - no language switching
  const [doctors, setDoctors] = useState<DoctorLanguage[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorLanguage | null>(null)

  // Form states
  const [formData, setFormData] = useState<Partial<Doctor>>({
    full_name_uz: "",
    full_name_ru: "",
    specialty_uz: "",
    specialty_ru: "",
    description_uz: "",
    description_ru: "",
    experience: 0,
    image: undefined,
  })
  const [formLoading, setFormLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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
      (doctor) =>
        doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

  const fetchDoctors = async () => {
    try {
      console.log("Fetching doctors...")
      const data = await api.doctors.getAll({ page: 1, lang: "uz" }) // Always use Uzbek
      console.log("Doctors data:", data)
      setDoctors(data.results || [])
    } catch (error) {
      console.error("Failed to fetch doctors:", error)
      // Set empty array on error
      setDoctors([])
    } finally {
      setPageLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      await api.doctors.delete(id)
      setDoctors(doctors.filter((doc) => doc.id !== id))
      setFilteredDoctors(filteredDoctors.filter((doc) => doc.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Failed to delete doctor. Please try again.")
    }
  }

  const handleCreate = async () => {
    if (
      !formData.full_name_uz ||
      !formData.full_name_ru ||
      !formData.specialty_uz ||
      !formData.specialty_ru ||
      !formData.description_uz ||
      !formData.description_ru
    ) {
      alert("Please fill in all required fields")
      return
    }

    setFormLoading(true)
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append("full_name_uz", formData.full_name_uz!)
      formDataToSend.append("full_name_ru", formData.full_name_ru!)
      formDataToSend.append("specialty_uz", formData.specialty_uz!)
      formDataToSend.append("specialty_ru", formData.specialty_ru!)
      formDataToSend.append("description_uz", formData.description_uz!)
      formDataToSend.append("description_ru", formData.description_ru!)
      formDataToSend.append("experience", formData.experience?.toString() || "0")

      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      const newDoctor = await api.doctors.createWithImage(formDataToSend)
      console.log("Created doctor:", newDoctor)
      fetchDoctors() // Refresh the list
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create doctor:", error)
      alert("Failed to create doctor. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (
      !selectedDoctor ||
      !formData.full_name_uz ||
      !formData.full_name_ru ||
      !formData.specialty_uz ||
      !formData.specialty_ru ||
      !formData.description_uz ||
      !formData.description_ru
    ) {
      alert("Please fill in all required fields")
      return
    }

    setFormLoading(true)
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append("full_name_uz", formData.full_name_uz!)
      formDataToSend.append("full_name_ru", formData.full_name_ru!)
      formDataToSend.append("specialty_uz", formData.specialty_uz!)
      formDataToSend.append("specialty_ru", formData.specialty_ru!)
      formDataToSend.append("description_uz", formData.description_uz!)
      formDataToSend.append("description_ru", formData.description_ru!)
      formDataToSend.append("experience", formData.experience?.toString() || "0")

      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      await api.doctors.updateWithImage(selectedDoctor.id, formDataToSend)
      console.log("Updated doctor:", selectedDoctor.id)
      fetchDoctors() // Refresh the list
      setIsEditModalOpen(false)
      setSelectedDoctor(null)
      resetForm()
    } catch (error) {
      console.error("Failed to update doctor:", error)
      alert("Failed to update doctor. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name_uz: "",
      full_name_ru: "",
      specialty_uz: "",
      specialty_ru: "",
      description_uz: "",
      description_ru: "",
      experience: 0,
      image: undefined,
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openEditModal = (doctor: DoctorLanguage) => {
    setSelectedDoctor(doctor)
    setFormData({
      full_name_uz: doctor.full_name_uz || "",
      full_name_ru: doctor.full_name_ru || "",
      specialty_uz: doctor.specialty_uz || "",
      specialty_ru: doctor.specialty_ru || "",
      description_uz: doctor.description_uz || "",
      description_ru: doctor.description_ru || "",
      experience: doctor.experience,
      image: doctor.image,
    })
    // Reset image selection when opening edit modal
    setSelectedImage(null)
    setImagePreview(doctor.image || null)
    setIsEditModalOpen(true)
  }

  const openViewModal = (doctor: DoctorLanguage) => {
    setSelectedDoctor(doctor)
    setIsViewModalOpen(true)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Shifokorlar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Tibbiy mutaxassislarni boshqarish</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ism yoki mutaxassislik bo'yicha qidirish..."
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
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="w-full sm:w-auto"
              title="Filterni tozalash"
            >
              <X className="w-4 h-4 mr-2" />
              Tozalash
            </Button>
          )}
          <Modal
            title="Yangi Shifokor Qo'shish"
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
                  <Label htmlFor="full_name_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    To'liq ismi (O'zbek)
                  </Label>
                  <Input
                    id="full_name_uz"
                    value={formData.full_name_uz}
                    onChange={(e) => setFormData({ ...formData, full_name_uz: e.target.value })}
                    placeholder="To'liq ism"
                  />
                </div>
                <div>
                  <Label htmlFor="full_name_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    To'liq ismi (Rus)
                  </Label>
                  <Input
                    id="full_name_ru"
                    value={formData.full_name_ru}
                    onChange={(e) => setFormData({ ...formData, full_name_ru: e.target.value })}
                    placeholder="Полное имя"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Mutaxassislik (O'zbek)
                  </Label>
                  <Input
                    id="specialty_uz"
                    value={formData.specialty_uz}
                    onChange={(e) => setFormData({ ...formData, specialty_uz: e.target.value })}
                    placeholder="Mutaxassislik"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Mutaxassislik (Rus)
                  </Label>
                  <Input
                    id="specialty_ru"
                    value={formData.specialty_ru}
                    onChange={(e) => setFormData({ ...formData, specialty_ru: e.target.value })}
                    placeholder="Специальность"
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
                    onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                    placeholder="Shifokor haqida ma'lumot"
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
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    placeholder="Информация о враче"
                    rows={3}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Tajriba (yil)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience === 0 ? "" : formData.experience || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, experience: value === "" ? 0 : Number.parseInt(value) || 0 });
                  }}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="image">Rasm</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
                {imagePreview && (
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
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
        ) : filteredDoctors.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            {doctors.length === 0 ? "Shifokorlar topilmadi" : "Qidiruv natijasi yo'q"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
                <CardContent className="p-0">
                  {/* Profile Header */}
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 h-40">
                    {/* Profile Picture */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted">
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={doctor.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-6xl bg-muted">
                            👨‍⚕️
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Content */}
                  <div className="pt-16 pb-6 px-6 space-y-4">
                    {/* Name and Specialty */}
                    <div className="text-center">
                      <h3 className="font-bold text-xl text-foreground mb-1">{doctor.full_name}</h3>
                      <p className="text-muted-foreground">{doctor.specialty}</p>
                    </div>

                    {/* Experience and Rating */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-muted-foreground">
                          <span className="font-semibold text-foreground">{doctor.experience}</span> yil tajriba
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground text-center line-clamp-3">{doctor.description}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(doctor)}
                        className="flex-1 text-blue-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Ko'rish"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ko'rish
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(doctor)}
                        className="flex-1 text-green-600 hover:text-green-600 hover:bg-green-50"
                        title="Tahrirlash"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Tahrirlash
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doctor.id)}
                        className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        O'chirish
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Modal
          title="Shifokor Ma'lumotlarini Tahrirlash"
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_full_name_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  To'liq ismi (O'zbek)
                </Label>
                <Input
                  id="edit_full_name_uz"
                  value={formData.full_name_uz}
                  onChange={(e) => setFormData({ ...formData, full_name_uz: e.target.value })}
                  placeholder="To'liq ism"
                />
              </div>
              <div>
                <Label htmlFor="edit_full_name_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  To'liq ismi (Rus)
                </Label>
                <Input
                  id="edit_full_name_ru"
                  value={formData.full_name_ru}
                  onChange={(e) => setFormData({ ...formData, full_name_ru: e.target.value })}
                  placeholder="Полное имя"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_specialty_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Mutaxassislik (O'zbek)
                </Label>
                <Input
                  id="edit_specialty_uz"
                  value={formData.specialty_uz}
                  onChange={(e) => setFormData({ ...formData, specialty_uz: e.target.value })}
                  placeholder="Mutaxassislik"
                />
              </div>
              <div>
                <Label htmlFor="edit_specialty_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Mutaxassislik (Rus)
                </Label>
                <Input
                  id="edit_specialty_ru"
                  value={formData.specialty_ru}
                  onChange={(e) => setFormData({ ...formData, specialty_ru: e.target.value })}
                  placeholder="Специальность"
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
                  onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                  placeholder="Shifokor haqida ma'lumot"
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
                  onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                  placeholder="Информация о враче"
                  rows={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_experience">Tajriba (yil)</Label>
              <Input
                id="edit_experience"
                type="number"
                value={formData.experience === 0 ? "" : formData.experience || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, experience: value === "" ? 0 : Number.parseInt(value) || 0 });
                }}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="edit_image">Rasm</Label>
              <Input id="edit_image" type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
              {imagePreview && (
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
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
          title="Shifokor Ma'lumotlari"
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        >
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-muted">
                  {selectedDoctor.image ? (
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      👨‍⚕️
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">ID</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">#{selectedDoctor.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">To'liq ismi (O'zbek)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.full_name_uz || '—'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">To'liq ismi (Rus)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.full_name_ru || '—'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mutaxassislik (O'zbek)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.specialty_uz || '—'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mutaxassislik (Rus)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.specialty_ru || '—'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Tajriba</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.experience} yil</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold">Tavsif (O'zbek)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.description_uz || selectedDoctor.description || '—'}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-semibold">Tavsif (Rus)</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDoctor.description_ru || '—'}</p>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-sm font-semibold">Qo'shimcha ma'lumot</Label>
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <p>• ID: #{selectedDoctor.id}</p>
                  <p>• Tajriba: {selectedDoctor.experience} yil</p>
                  <p>• O'zbek ismi: {selectedDoctor.full_name_uz || selectedDoctor.full_name || 'Kiritilmagan'}</p>
                  <p>• Rus ismi: {selectedDoctor.full_name_ru || 'Kiritilmagan'}</p>
                  <p>• O'zbek mutaxassislik: {selectedDoctor.specialty_uz || selectedDoctor.specialty || 'Kiritilmagan'}</p>
                  <p>• Rus mutaxassislik: {selectedDoctor.specialty_ru || 'Kiritilmagan'}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Yopish
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedDoctor)
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

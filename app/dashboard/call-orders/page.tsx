"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Search, Plus, Edit, Eye, X } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { CallOrderLanguage, CallOrder } from "@/lib/types"

export default function CallOrdersPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  // Simplified - no language switching
  const [callOrders, setCallOrders] = useState<CallOrderLanguage[]>([])
  const [filteredOrders, setFilteredOrders] = useState<CallOrderLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<CallOrderLanguage | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<Partial<CallOrder>>({
    name_uz: "",
    name_ru: "",
    phone: ""
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
      fetchCallOrders()
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    const filtered = callOrders.filter(
      (order) => order.name.toLowerCase().includes(searchTerm.toLowerCase()) || order.phone.includes(searchTerm),
    )
    setFilteredOrders(filtered)
  }, [searchTerm, callOrders])

  const fetchCallOrders = async () => {
    try {
      console.log("Fetching call orders...")
      const data = await api.callOrders.getAll({ page: 1, lang: 'uz' })
      console.log("Call orders data:", data)
      setCallOrders(data.results || [])
    } catch (error) {
      console.error("Failed to fetch call orders:", error)
      // Set empty array on error
      setCallOrders([])
    } finally {
      setPageLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this call order?")) return

    try {
      await api.callOrders.delete(id)
      setCallOrders(callOrders.filter((order) => order.id !== id))
      setFilteredOrders(filteredOrders.filter((order) => order.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Failed to delete call order. Please try again.")
    }
  }

  const handleCreate = async () => {
    if (!formData.name_uz || !formData.phone) {
      alert("Ism (O'zbek) va telefon raqami majburiy maydonlar")
      return
    }

    setFormLoading(true)
    try {
      const newOrder = await api.callOrders.create(formData as CallOrder)
      console.log("Created call order:", newOrder)
      fetchCallOrders() // Refresh the list
      setIsCreateModalOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create call order:", error)
      alert("Failed to create call order. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedOrder || !formData.name_uz || !formData.phone) {
      alert("Ism (O'zbek) va telefon raqami majburiy maydonlar")
      return
    }

    setFormLoading(true)
    try {
      await api.callOrders.update(selectedOrder.id, formData as CallOrder)
      console.log("Updated call order:", selectedOrder.id)
      fetchCallOrders() // Refresh the list
      setIsEditModalOpen(false)
      setSelectedOrder(null)
      resetForm()
    } catch (error) {
      console.error("Failed to update call order:", error)
      alert("Failed to update call order. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name_uz: "",
      name_ru: "",
      phone: ""
    })
  }

  const openEditModal = (order: CallOrderLanguage) => {
    setSelectedOrder(order)
    setFormData({
      name_uz: order.name_uz || order.name || "",
      name_ru: order.name_ru || "",
      phone: order.phone
    })
    setIsEditModalOpen(true)
  }

  const openViewModal = (order: CallOrderLanguage) => {
    setSelectedOrder(order)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Qo'ng'iroq Buyurtmalari</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Mijozlarning qo'ng'iroq so'rovlarini boshqarish</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ism yoki telefon bo'yicha qidirish..."
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
            title="Yangi Qo'ng'iroq Buyurtmasi"
            trigger={
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Qo'shish
              </Button>
            }
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_uz">Ism (O'zbek) *</Label>
                  <Input
                    id="name_uz"
                    value={formData.name_uz}
                    onChange={(e) => setFormData({...formData, name_uz: e.target.value})}
                    placeholder="O'zbek tilida ism"
                  />
                </div>
                <div>
                  <Label htmlFor="name_ru">Ism (Rus)</Label>
                  <Input
                    id="name_ru"
                    value={formData.name_ru}
                    onChange={(e) => setFormData({...formData, name_ru: e.target.value})}
                    placeholder="Rus tilida ism"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Telefon raqami *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+998 90 123 45 67"
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
            <CardTitle>Barcha Qo'ng'iroq Buyurtmalari ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {callOrders.length === 0 ? "Qo'ng'iroq buyurtmalari topilmadi" : "Qidiruv natijasi yo'q"}
              </div>
            ) : (
              <div className="table-scroll-container">
                <table className="w-full text-sm language-stable-table">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold w-16">№</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-foreground font-semibold">Ism</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-foreground font-semibold">Telefon</th>
                      <th className="text-left py-3 px-2 sm:px-4 text-foreground font-semibold hidden sm:table-cell">Yaratilgan sana</th>
                      <th className="text-center py-3 px-2 sm:px-4 text-foreground font-semibold">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => {
                      // Qaysi tilda ma'lumot borligini aniqlash
                      const hasUzName = order.name_uz && order.name_uz.trim() !== '';
                      const hasRuName = order.name_ru && order.name_ru.trim() !== '';
                      const displayName = hasUzName ? order.name_uz : (hasRuName ? order.name_ru : (order.name || '—'));
                      
                      return (
                        <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2 sm:px-4 text-center text-muted-foreground font-medium">
                            {index + 1}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-foreground font-medium">
                            {displayName}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-muted-foreground font-mono">
                            {order.phone}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-muted-foreground hidden sm:table-cell">
                            {new Date(order.created_at).toLocaleDateString('uz-UZ', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openViewModal(order)}
                                className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 p-1 sm:p-2"
                                title="Ko'rish"
                              >
                                <Eye size={14} className="sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(order)}
                                className="text-green-600 hover:text-green-600 hover:bg-green-50 p-1 sm:p-2"
                                title="Tahrirlash"
                              >
                                <Edit size={14} className="sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(order.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 sm:p-2"
                                title="O'chirish"
                              >
                                <Trash2 size={14} className="sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Modal
          title="Qo'ng'iroq Buyurtmasini Tahrirlash"
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name_uz">Ism (O'zbek) *</Label>
                <Input
                  id="edit_name_uz"
                  value={formData.name_uz}
                  onChange={(e) => setFormData({...formData, name_uz: e.target.value})}
                  placeholder="O'zbek tilida ism"
                />
              </div>
              <div>
                <Label htmlFor="edit_name_ru">Ism (Rus)</Label>
                <Input
                  id="edit_name_ru"
                  value={formData.name_ru}
                  onChange={(e) => setFormData({...formData, name_ru: e.target.value})}
                  placeholder="Rus tilida ism"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_phone">Telefon raqami *</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+998 90 123 45 67"
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
          title="Qo'ng'iroq Buyurtmasi Ma'lumotlari"
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">ID</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">#{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Telefon raqami</Label>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">{selectedOrder.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Ism (O'zbek)</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.name_uz || selectedOrder.name || '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Ism (Rus)</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedOrder.name_ru || '—'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-sm font-semibold">Yaratilgan sana</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      weekday: 'long'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg">
                <Label className="text-sm font-semibold">Qo'shimcha ma'lumot</Label>
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <p>• ID: #{selectedOrder.id}</p>
                  <p>• Telefon: {selectedOrder.phone}</p>
                  <p>• O'zbek ismi: {selectedOrder.name_uz || selectedOrder.name || 'Kiritilmagan'}</p>
                  <p>• Rus ismi: {selectedOrder.name_ru || 'Kiritilmagan'}</p>
                  <p>• Yaratilgan: {new Date(selectedOrder.created_at).toLocaleDateString('uz-UZ')}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Yopish
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedOrder)
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

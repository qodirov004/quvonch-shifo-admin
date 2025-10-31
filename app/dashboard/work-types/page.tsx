"use client"

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Search, Plus, Edit, Eye, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { WorkTypeLanguage, WorkType, PaginatedResponse } from "@/lib/types"

export default function WorkTypesPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()

  const [items, setItems] = useState<WorkTypeLanguage[]>([])
  const [filtered, setFiltered] = useState<WorkTypeLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WorkTypeLanguage | null>(null)

  const [formData, setFormData] = useState<Partial<WorkType>>({
    name_uz: "",
    name_ru: "",
  })
  const [formLoading, setFormLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

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
      fetchItems(page)
    }
  }, [token, isAuthenticated, page])

  useEffect(() => {
    const term = searchTerm.toLowerCase()
    const f = items.filter((i) =>
      i.name_uz.toLowerCase().includes(term) || i.name_ru.toLowerCase().includes(term)
    )
    setFiltered(f)
  }, [searchTerm, items])

  const fetchItems = async (currentPage: number) => {
    setPageLoading(true)
    try {
      const res: PaginatedResponse<WorkTypeLanguage> = await api.workTypes.getAll({ page: currentPage })
      setItems(res.results)
      setFiltered(res.results)
      setHasNext(!!res.next)
      setHasPrev(!!res.previous)
      setTotalCount(res.count)
    } catch (e) {
      console.error(e)
    } finally {
      setPageLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name_uz: "", name_ru: "" })
  }

  const openCreate = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  const openEdit = (item: WorkTypeLanguage) => {
    setSelectedItem(item)
    setFormData({ name_uz: item.name_uz, name_ru: item.name_ru })
    setIsEditModalOpen(true)
  }

  const openView = (item: WorkTypeLanguage) => {
    setSelectedItem(item)
    setIsViewModalOpen(true)
  }

  const handleCreate = async () => {
    setFormLoading(true)
    try {
      await api.workTypes.create({ name_uz: formData.name_uz || "", name_ru: formData.name_ru || "" })
      setIsCreateModalOpen(false)
      await fetchItems(page)
    } catch (e) {
      console.error(e)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedItem?.id) return
    setFormLoading(true)
    try {
      await api.workTypes.update(selectedItem.id, { name_uz: formData.name_uz || "", name_ru: formData.name_ru || "" })
      setIsEditModalOpen(false)
      await fetchItems(page)
    } catch (e) {
      console.error(e)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Rostan ham o'chirmoqchimisiz?")) return
    try {
      await api.workTypes.delete(id)
      await fetchItems(page)
    } catch (e) {
      console.error(e)
    }
  }

  const goPrev = () => {
    if (hasPrev) setPage((p) => Math.max(1, p - 1))
  }
  const goNext = () => {
    if (hasNext) setPage((p) => p + 1)
  }

  if (!mounted || loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Yuklanmoqda...</div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Ish turlari</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Ish turlarini boshqarish</p>
          <p className="text-xs text-muted-foreground">Jami: {totalCount}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nomi bo'yicha qidirish..."
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
            title="Yangi Ish Turi Qo'shish"
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
              <div className="space-y-2">
                <Label htmlFor="name_uz">Nomi (UZ)</Label>
                <Input id="name_uz" value={formData.name_uz || ""} onChange={(e) => setFormData((p) => ({ ...p, name_uz: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ru">Nomi (RU)</Label>
                <Input id="name_ru" value={formData.name_ru || ""} onChange={(e) => setFormData((p) => ({ ...p, name_ru: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  <X className="h-4 w-4 mr-1" /> Bekor qilish
                </Button>
                <Button onClick={handleCreate} disabled={formLoading}>
                  Saqlash
                </Button>
              </div>
            </div>
          </Modal>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Barcha Ish Turlari ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
            ) : filtered.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">Ma'lumot topilmadi</div>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <div key={item.id} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name_uz}</div>
                        <div className="text-sm text-muted-foreground">{item.name_ru}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openView(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal title="Ish turi yaratish" open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_uz">Nomi (UZ)</Label>
            <Input id="name_uz" value={formData.name_uz || ""} onChange={(e) => setFormData((p) => ({ ...p, name_uz: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_ru">Nomi (RU)</Label>
            <Input id="name_ru" value={formData.name_ru || ""} onChange={(e) => setFormData((p) => ({ ...p, name_ru: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              <X className="h-4 w-4 mr-1" /> Bekor qilish
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              Saqlash
            </Button>
          </div>
        </div>
      </Modal>

      <Modal title="Ish turini tahrirlash" open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name_uz_e">Nomi (UZ)</Label>
            <Input id="name_uz_e" value={formData.name_uz || ""} onChange={(e) => setFormData((p) => ({ ...p, name_uz: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_ru_e">Nomi (RU)</Label>
            <Input id="name_ru_e" value={formData.name_ru || ""} onChange={(e) => setFormData((p) => ({ ...p, name_ru: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              <X className="h-4 w-4 mr-1" /> Bekor qilish
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading}>
              Saqlash
            </Button>
          </div>
        </div>
      </Modal>

      <Modal title="Ish turi" open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        {selectedItem && (
          <div className="space-y-2">
            <div>
              <div className="text-sm text-muted-foreground">Nomi (UZ)</div>
              <div className="font-medium">{selectedItem.name_uz}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Nomi (RU)</div>
              <div className="font-medium">{selectedItem.name_ru}</div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}



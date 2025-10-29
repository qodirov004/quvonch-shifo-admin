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
import { Trash2, Search, Plus, Edit, Eye, Upload, Image, X } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import DashboardLayout from "@/components/dashboard/layout"
import { api } from "@/lib/api-services"
import type { NewsLanguage, News } from "@/lib/types"

export default function NewsPage() {
  const router = useRouter()
  const { user, token, loading, isAuthenticated } = useAuth()
  // Simplified - no language switching
  const [news, setNews] = useState<NewsLanguage[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsLanguage[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [mounted, setMounted] = useState(false)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsLanguage | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<Partial<News>>({
    title_uz: "",
    title_ru: "",
    content_uz: "",
    content_ru: "",
    is_published: false
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
      fetchNews()
    }
  }, [token, isAuthenticated])

  useEffect(() => {
    const filtered = news.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredNews(filtered)
  }, [searchTerm, news])

  const fetchNews = async () => {
    try {
      const data = await api.news.getAll({ page: 1, lang: 'uz' })
      setNews(data.results || [])
    } catch (error) {
      console.error("Failed to fetch news:", error)
    } finally {
      setPageLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this news?")) return

    try {
      await api.news.delete(id)
      setNews(news.filter((item) => item.id !== id))
      setFilteredNews(filteredNews.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
      alert("Failed to delete news. Please try again.")
    }
  }

  const handleCreate = async () => {
    if (!formData.title_uz || !formData.title_ru || !formData.content_uz || !formData.content_ru) {
      alert("Please fill in all required fields")
      return
    }

    setFormLoading(true)
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title_uz', formData.title_uz!)
      formDataToSend.append('title_ru', formData.title_ru!)
      formDataToSend.append('content_uz', formData.content_uz!)
      formDataToSend.append('content_ru', formData.content_ru!)
      formDataToSend.append('is_published', formData.is_published ? 'true' : 'false')
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }
      
      const newNews = await api.news.createWithImage(formDataToSend)
      console.log("Created news:", newNews)
      fetchNews() // Refresh the list
      setIsCreateModalOpen(false)
      resetForm()
      resetImage()
    } catch (error) {
      console.error("Failed to create news:", error)
      alert("Failed to create news. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedNews || !formData.title_uz || !formData.title_ru || !formData.content_uz || !formData.content_ru) {
      alert("Please fill in all required fields")
      return
    }

    setFormLoading(true)
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('title_uz', formData.title_uz!)
      formDataToSend.append('title_ru', formData.title_ru!)
      formDataToSend.append('content_uz', formData.content_uz!)
      formDataToSend.append('content_ru', formData.content_ru!)
      formDataToSend.append('is_published', formData.is_published ? 'true' : 'false')
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }
      
      await api.news.updateWithImage(selectedNews.id, formDataToSend)
      console.log("Updated news:", selectedNews.id)
      fetchNews() // Refresh the list
      setIsEditModalOpen(false)
      setSelectedNews(null)
      resetForm()
      resetImage()
    } catch (error) {
      console.error("Failed to update news:", error)
      alert("Failed to update news. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title_uz: "",
      title_ru: "",
      content_uz: "",
      content_ru: "",
      is_published: false
    })
  }

  const openEditModal = (newsItem: NewsLanguage) => {
    setSelectedNews(newsItem)
    setFormData({
      title_uz: newsItem.title_uz || "",
      title_ru: newsItem.title_ru || "",
      content_uz: newsItem.content_uz || "",
      content_ru: newsItem.content_ru || "",
      is_published: newsItem.is_published
    })
    // Reset image selection when opening edit modal
    setSelectedImage(null)
    setImagePreview(newsItem.image || null)
    setIsEditModalOpen(true)
  }

  const openViewModal = (newsItem: NewsLanguage) => {
    setSelectedNews(newsItem)
    setIsViewModalOpen(true)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Yangiliklar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Tibbiy markaz yangiliklari</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sarlavha yoki mazmun bo'yicha qidirish..."
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
            title="Yangi Yangilik Qo'shish"
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
                    Sarlavha (O'zbek)
                  </Label>
                  <Input
                    id="title_uz"
                    value={formData.title_uz}
                    onChange={(e) => setFormData({...formData, title_uz: e.target.value})}
                    placeholder="Sarlavha"
                  />
                </div>
                <div>
                  <Label htmlFor="title_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Sarlavha (Rus)
                  </Label>
                  <Input
                    id="title_ru"
                    value={formData.title_ru}
                    onChange={(e) => setFormData({...formData, title_ru: e.target.value})}
                    placeholder="Заголовок"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="content_uz" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Mazmun (O'zbek)
                  </Label>
                  <Textarea
                    id="content_uz"
                    value={formData.content_uz}
                    onChange={(e) => setFormData({...formData, content_uz: e.target.value})}
                    placeholder="Yangilik mazmuni"
                    rows={4}
                    className="w-full break-words"
                  />
                </div>
                <div>
                  <Label htmlFor="content_ru" className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Mazmun (Rus)
                  </Label>
                  <Textarea
                    id="content_ru"
                    value={formData.content_ru}
                    onChange={(e) => setFormData({...formData, content_ru: e.target.value})}
                    placeholder="Содержание новости"
                    rows={4}
                    className="w-full break-words"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Rasm</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {selectedImage ? selectedImage.name : "Rasm yuklash"}
                  </Button>
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={resetImage}
                        className="absolute top-2 right-2"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: !!checked})}
                  className="border-foreground"
                />
                <Label htmlFor="is_published" className="text-foreground">
                  Nashr etish
                </Label>
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
            <CardTitle>Barcha Yangiliklar ({filteredNews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pageLoading ? (
              <div className="text-muted-foreground text-center py-8">Yuklanmoqda...</div>
            ) : filteredNews.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {news.length === 0 ? "Yangiliklar topilmadi" : "Qidiruv natijasi yo'q"}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredNews.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="text-foreground font-semibold text-sm sm:text-base line-clamp-2">{item.title}</h3>
                          {item.is_published && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded w-fit">Nashr etilgan</span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-2">{item.content}</p>
                        <p className="text-muted-foreground/60 text-xs mt-2">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 sm:p-2"
                          title="O'chirish"
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
          title="Yangilikni Tahrirlash"
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
                  Sarlavha (O'zbek)
                </Label>
                <Input
                  id="edit_title_uz"
                  value={formData.title_uz}
                  onChange={(e) => setFormData({...formData, title_uz: e.target.value})}
                  placeholder="Sarlavha"
                />
              </div>
              <div>
                <Label htmlFor="edit_title_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Sarlavha (Rus)
                </Label>
                <Input
                  id="edit_title_ru"
                  value={formData.title_ru}
                  onChange={(e) => setFormData({...formData, title_ru: e.target.value})}
                  placeholder="Заголовок"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="edit_content_uz" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                  Mazmun (O'zbek)
                </Label>
                <Textarea
                  id="edit_content_uz"
                  value={formData.content_uz}
                  onChange={(e) => setFormData({...formData, content_uz: e.target.value})}
                  placeholder="Yangilik mazmuni"
                  rows={4}
                  className="w-full break-words"
                />
              </div>
              <div>
                <Label htmlFor="edit_content_ru" className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">🇷🇺</span>
                  Mazmun (Rus)
                </Label>
                <Textarea
                  id="edit_content_ru"
                  value={formData.content_ru}
                  onChange={(e) => setFormData({...formData, content_ru: e.target.value})}
                  placeholder="Содержание новости"
                  rows={4}
                  className="w-full break-words"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_image">Rasm</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="edit_image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('edit_image')?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedImage ? selectedImage.name : "Rasm yuklash"}
                </Button>
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={resetImage}
                      className="absolute top-2 right-2"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit_is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({...formData, is_published: !!checked})}
                className="border-foreground"
              />
              <Label htmlFor="edit_is_published" className="text-foreground">
                Nashr etish
              </Label>
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
          title="Yangilik Ma'lumotlari"
          trigger={null}
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          size="lg"
        >
          {selectedNews && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Sarlavha (O'zbek)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedNews.title_uz || selectedNews.title}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Sarlavha (Rus)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedNews.title_ru || selectedNews.title}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">🇺🇿</span>
                    Mazmun (O'zbek)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 w-80 break-words">{selectedNews.content_uz || selectedNews.content}</p>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-red-600">🇷🇺</span>
                    Mazmun (Rus)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 w-80 break-words">{selectedNews.content_ru || selectedNews.content}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Holat</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedNews.is_published ? "Nashr etilgan" : "Nashr etilmagan"}
                  </p>
                </div>
                <div>
                  <Label>Yaratilgan sana</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedNews.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedNews.image && (
                <div>
                  <Label>Rasm</Label>
                  <img 
                    src={selectedNews.image} 
                    alt={selectedNews.title}
                    className="mt-2 w-full max-w-md h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Yopish
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  openEditModal(selectedNews)
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

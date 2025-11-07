"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Phone, Users, Newspaper, Briefcase, Activity, ArrowUpRight, ArrowDownRight, Calendar as CalendarIcon, X } from "lucide-react"
import { api } from "@/lib/api-services"
import PieChartTemplate from "@/components/pie-chart-template"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DashboardOverview() {
  // Simplified - no language switching
  const [stats, setStats] = useState({
    callOrders: 0,
    doctors: 0,
    news: 0,
    vacancies: 0,
  })
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState({
    callOrdersByMonth: [] as any[],
    doctorsBySpecialty: [] as any[],
    newsByMonth: [] as any[],
    applicationsByStatus: [] as any[],
  })
  
  // Simple date filter state
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [allCallOrdersData, setAllCallOrdersData] = useState<any[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simplified API calls with better error handling
        const [callOrders, doctors, news, vacancies, jobApplications] = await Promise.allSettled([
          api.callOrders.getAll({ page: 1, lang: "uz" }),
          api.doctors.getAll({ page: 1, lang: "uz" }),
          api.news.getAll({ page: 1, lang: "uz" }),
          // Backend is returning 500 due to serializer misconfig; hard-fail safe here
          api.vacancies
            .getAll({ page: 1, lang: "uz" })
            .catch(() => ({ count: 0, results: [] } as any)),
          api.jobApplications.getAll({ page: 1, lang: "uz" }),
        ])

        // Handle each result safely
        const callOrdersData = callOrders.status === "fulfilled" ? callOrders.value : { count: 0, results: [] }
        const doctorsData = doctors.status === "fulfilled" ? doctors.value : { count: 0, results: [] }
        const newsData = news.status === "fulfilled" ? news.value : { count: 0, results: [] }
        const vacanciesData = vacancies.status === "fulfilled" ? vacancies.value : { count: 0, results: [] }
        const jobApplicationsData =
          jobApplications.status === "fulfilled" ? jobApplications.value : { count: 0, results: [] }

        setStats({
          callOrders: callOrdersData.count || 0,
          doctors: doctorsData.count || 0,
          news: newsData.count || 0,
          vacancies: vacanciesData.count || 0,
        })

        // Store all call orders data for filtering
        setAllCallOrdersData(callOrdersData.results || [])
        
        // Generate chart data
        let callOrdersChartData = generateCallOrdersChartData(callOrdersData.results || [], "", "")
        let doctorsChartData = generateDoctorsChartData(doctorsData.results || [])
        let newsChartData = generateNewsChartData(newsData.results || [])
        let applicationsChartData = generateApplicationsChartData(jobApplicationsData.results || [])

        // Agar ma'lumot yo'q bo'lsa, test ma'lumotlar qo'shish - 1 oy davomida
        if (callOrdersChartData.length === 0 || callOrdersChartData.every((item) => item.count === 0)) {
          const today = new Date()
          callOrdersChartData = []
          // Oxirgi 30 kun uchun test ma'lumotlar (1 oy davomida)
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            // Har kuni 5-25 orasida tasodifiy qo'ng'iroq soni
            const count = Math.floor(Math.random() * 21) + 5 // 5-25 orasida tasodifiy son
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            callOrdersChartData.push({
              label: `${day}.${month}`,
              count: count,
            })
          }
          
          // Test ma'lumotlarni ham allCallOrdersData ga qo'shish
          const testOrders = []
          for (let i = 29; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const count = Math.floor(Math.random() * 21) + 5
            for (let j = 0; j < count; j++) {
              testOrders.push({
                id: `test-${i}-${j}`,
                name: `Test Order ${i}-${j}`,
                phone: `+99890123456${j}`,
                created_at: date.toISOString(),
                name_uz: `Test Order ${i}-${j}`,
                name_ru: `Test Order ${i}-${j}`,
              })
            }
          }
          setAllCallOrdersData(testOrders)
        }

        if (newsChartData.length === 0 || newsChartData.every((item) => item.count === 0)) {
          newsChartData = [
            { label: "Bugun", count: 3, date: "2024-01-15" },
            { label: "Kecha", count: 7, date: "2024-01-14" },
            { label: "2 kun oldin", count: 4, date: "2024-01-13" },
            { label: "3 kun oldin", count: 11, date: "2024-01-12" },
            { label: "4 kun oldin", count: 8, date: "2024-01-11" },
            { label: "5 kun oldin", count: 6, date: "2024-01-10" },
          ]
        }

        if (doctorsChartData.length === 0) {
          doctorsChartData = [
            { specialty: "Kardiologiya", count: 3 },
            { specialty: "Nevrologiya", count: 2 },
            { specialty: "Pediatriya", count: 4 },
            { specialty: "Terapiya", count: 5 },
          ]
        }

        if (applicationsChartData.length === 0) {
          applicationsChartData = [
            { label: "Kutilmoqda", count: 8 },
            { label: "Ko'rib chiqilgan", count: 5 },
            { label: "Qabul qilingan", count: 3 },
            { label: "Rad etilgan", count: 2 },
          ]
        }

        setChartData({
          callOrdersByMonth: callOrdersChartData,
          doctorsBySpecialty: doctorsChartData,
          newsByMonth: newsChartData,
          applicationsByStatus: applicationsChartData,
        })

        // Debug: Console da ma'lumotlarni ko'rsatish
        console.log("Chart Data:", {
          callOrdersByMonth: callOrdersChartData,
          doctorsBySpecialty: doctorsChartData,
          newsByMonth: newsChartData,
          applicationsByStatus: applicationsChartData,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Set default values on error
        setStats({
          callOrders: 0,
          doctors: 0,
          news: 0,
          vacancies: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Simple date filter function
  const filterCallOrdersByDates = (orders: any[], start: string, end: string) => {
    if (!start && !end) return orders
    
    return orders.filter(order => {
      if (!order.created_at) return false
      const orderDate = new Date(order.created_at)
      const orderDateStr = orderDate.toISOString().split('T')[0] // YYYY-MM-DD format
      
      // Agar faqat start berilgan bo'lsa
      if (start && !end) {
        return orderDateStr >= start
      }
      
      // Agar faqat end berilgan bo'lsa
      if (!start && end) {
        return orderDateStr <= end
      }
      
      // Agar ikkalasi ham berilgan bo'lsa
      if (start && end) {
        return orderDateStr >= start && orderDateStr <= end
      }
      
      return true
    })
  }

  // Filter button handler
  const handleFilter = () => {
    if (allCallOrdersData.length > 0) {
      const filtered = filterCallOrdersByDates(allCallOrdersData, startDate, endDate)
      const chartData = generateCallOrdersChartData(filtered, startDate, endDate)
      setChartData(prev => ({
        ...prev,
        callOrdersByMonth: chartData
      }))
    }
  }

  // Clear filter button handler
  const handleClearFilter = () => {
    setStartDate("")
    setEndDate("")
    const chartData = generateCallOrdersChartData(allCallOrdersData, "", "")
    setChartData(prev => ({
      ...prev,
      callOrdersByMonth: chartData
    }))
  }


  // Chart data generation functions
  const generateCallOrdersChartData = (orders: any[], startDate: string, endDate: string) => {
    // Faqat filterda kiritilgan ma'lumotlarni ko'rsatish
    const dailyCounts: { [key: string]: number } = {}

    // Agar start va end berilgan bo'lsa, faqat o'sha oraliqdagi kunlarni ko'rsatish
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      // Har bir kun uchun bo'sh ma'lumotlar yaratish
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const dateString = `${day}.${month}`
        dailyCounts[dateString] = 0
      }
    } else if (startDate) {
      // Faqat start berilgan bo'lsa, bugungacha
      const start = new Date(startDate)
      const today = new Date()
      
      for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const dateString = `${day}.${month}`
        dailyCounts[dateString] = 0
      }
    } else if (endDate) {
      // Faqat end berilgan bo'lsa, o'sha kungacha
      const end = new Date(endDate)
      const start = new Date(end)
      start.setDate(start.getDate() - 30) // Oxirgi 30 kun
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const dateString = `${day}.${month}`
        dailyCounts[dateString] = 0
      }
    } else {
      // Agar hech narsa berilmagan bo'lsa, oxirgi 30 kun
      const today = new Date()
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const dateString = `${day}.${month}`
        dailyCounts[dateString] = 0
      }
    }

    // Haqiqiy ma'lumotlarni qo'shish
    orders.forEach((order) => {
      if (order.created_at) {
        const orderDate = new Date(order.created_at)
        const day = orderDate.getDate().toString().padStart(2, '0')
        const month = (orderDate.getMonth() + 1).toString().padStart(2, '0')
        const dateString = `${day}.${month}`
        if (dailyCounts.hasOwnProperty(dateString)) {
          dailyCounts[dateString] = (dailyCounts[dateString] || 0) + 1
        }
      }
    })

    // Barcha kunlarni ko'rsatish (0 qiymatli kunlar ham)
    const data = Object.entries(dailyCounts)
      .map(([date, count]) => ({
        label: date,
        count: count,
      }))
      .sort((a, b) => {
        // Sana bo'yicha tartiblash
        const dateA = new Date(`2024-${a.label.split('.')[1]}-${a.label.split('.')[0]}`)
        const dateB = new Date(`2024-${b.label.split('.')[1]}-${b.label.split('.')[0]}`)
        return dateA.getTime() - dateB.getTime()
      })

    return data
  }

  const generateDoctorsChartData = (doctors: any[]) => {
    const specialtyCount: { [key: string]: number } = {}
    doctors.forEach((doctor) => {
      const specialty = doctor.specialty || "Unknown"
      specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1
    })
    return Object.entries(specialtyCount).map(([specialty, count]) => ({
      specialty: specialty.length > 15 ? specialty.substring(0, 15) + "..." : specialty,
      count,
    }))
  }

  const generateNewsChartData = (news: any[]) => {
    // Haqiqiy ma'lumotlar bo'yicha o'sish-kamayish
    const data = news.slice(0, 6).map((item, index) => ({
      label: `Yangilik ${index + 1}`,
      count: 1,
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : `Item ${index + 1}`,
    }))
    return data
  }

  const generateApplicationsChartData = (applications: any[]) => {
    const statusCount: { [key: string]: number } = {}
    applications.forEach((app) => {
      const status = app.status || "pending"
      statusCount[status] = (statusCount[status] || 0) + 1
    })

    // Status bo'yicha o'zbek tilida nomlar va ranglar
    const statusLabels: { [key: string]: string } = {
      pending: "Kutilmoqda",
      reviewed: "Ko'rib chiqilgan",
      accepted: "Qabul qilingan",
      rejected: "Rad etilgan",
    }

    return Object.entries(statusCount).map(([status, count]) => ({
      label: statusLabels[status] || status,
      count,
    }))
  }

  const statCards = [
    {
      label: "Qo'ng'iroq buyurtmalari",
      value: stats.callOrders,
      icon: Phone,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Shifokorlar",
      value: stats.doctors,
      icon: Users,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Yangiliklar",
      value: stats.news,
      icon: Newspaper,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Vakansiyalar",
      value: stats.vacancies,
      icon: Briefcase,
      color: "from-orange-500 to-orange-600",
    },
  ]

  // Simple line chart component
  const SimpleLineChart = ({ data, title, color = "bg-blue-500" }: { data: any[]; title: string; color?: string }) => {
    const maxValue = Math.max(...data.map((d) => d.count), 1)
    const maxHeight = 60

    // Agar ma'lumot yo'q bo'lsa, default qiymatlar ko'rsatish
    if (!data || data.length === 0 || maxValue === 0) {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="flex items-end gap-1 h-20 pb-6">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 flex-1 min-h-0">
              <div
                className={`w-full rounded-t-sm ${color} min-h-[4px]`}
                style={{ height: `${Math.max((item.count / maxValue) * maxHeight, 4)}px` }}
              />
              <span className="text-xs text-muted-foreground truncate w-full text-center">
                {item.month || item.specialty || item.status || item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const SimplePieChart = ({ data, title }: { data: any[]; title: string }) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>
        </div>
      )
    }

    const total = data.reduce((sum, item) => sum + item.count, 0)
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500"]

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="space-y-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.specialty || item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className={`h-full ${colors[index % colors.length]}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Quvonch Shifo Admin boshqaruv paneli</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="relative overflow-hidden hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`bg-gradient-to-r ${stat.color} p-3 rounded-xl shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-foreground">{loading ? "..." : stat.value} ta</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Orders Chart */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Qo'ng'iroq buyurtmalari</CardTitle>
                <CardDescription>Kun bo'yicha qo'ng'iroq buyurtmalari taqsimlash</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    <div>
                      <Label htmlFor="startDate">Boshlanish sanasi</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-[150px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Tugash sanasi</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-[150px]"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button onClick={handleFilter} className="h-10">
                        Filter
                      </Button>
                      {(startDate || endDate) && (
                        <Button variant="outline" onClick={handleClearFilter} className="h-10">
                          <X className="w-4 h-4 mr-2" />
                          Tozalash
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Check if selected month has no data */}
            {chartData.callOrdersByMonth.every(item => item.count === 0) ? (
              <div className="h-[450px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                  <Phone className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {(startDate || endDate) 
                      ? "Tanlangan sana oralig'ida qo'ng'iroq buyurtmalari yo'q"
                      : "Qo'ng'iroq buyurtmalari yo'q"
                    }
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {(startDate || endDate) 
                      ? "Tanlangan sana oralig'ida hech qanday qo'ng'iroq buyurtmasi qabul qilinmagan. Boshqa sana oralig'ini sinab ko'ring."
                      : "Hozircha hech qanday qo'ng'iroq buyurtmasi qabul qilinmagan. Ma'lumotlar kelganda grafik avtomatik ravishda yangilanadi."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <ChartContainer
                config={chartData.callOrdersByMonth.reduce(
                  (acc, item, index) => {
                    acc[item.label] = {
                      label: item.label,
                      color: `hsl(${index * 60}, 70%, 50%)`,
                    }
                    return acc
                  },
                  {} as Record<string, { label: string; color: string }>,
                )}
                className="h-[450px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="text-lg font-medium"
                          formatter={(value, name) => {
                            return [`${name} `, `: ${value} ta`]
                          }}
                        />
                      }
                    />
                    <Pie
                      data={chartData.callOrdersByMonth.filter(item => item.count > 0).map((item, index) => {
                        const dateParts = item.label.split(".")
                        let displayName = item.label
                        if (dateParts.length === 2) {
                          const day = dateParts[0]
                          const month = dateParts[1]
                          const monthNames = [
                            "Yan",
                            "Fev",
                            "Mar",
                            "Apr",
                            "May",
                            "Iyun",
                            "Iyul",
                            "Avg",
                            "Sen",
                            "Okt",
                            "Noy",
                            "Dek",
                          ]
                          const monthName = monthNames[Number.parseInt(month) - 1] || month
                          displayName = `${day} ${monthName}`
                        }
                        return {
                          name: displayName,
                          value: item.count,
                          fill: `hsl(${index * 60}, 70%, 50%)`,
                        }
                      })}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} - ${value} ta`}
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.callOrdersByMonth.filter(item => item.count > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>


        {/* Job Applications Chart */}
        <PieChartTemplate
          title="Ish arizalari"
          description="Status bo'yicha ish arizalari taqsimlash"
          data={chartData.applicationsByStatus.map((item, index) => ({
            name: item.label,
            value: item.count,
            fill:
              item.label === "Kutilmoqda"
                ? "hsl(45, 70%, 50%)"
                : item.label === "Ko'rib chiqilgan"
                  ? "hsl(200, 70%, 50%)"
                  : item.label === "Qabul qilingan"
                    ? "hsl(120, 70%, 50%)"
                    : item.label === "Rad etilgan"
                      ? "hsl(0, 70%, 50%)"
                      : `hsl(${index * 90}, 70%, 50%)`,
          }))}
        />
      </div>

      {/* Recent Activity */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            So'nggi faoliyat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="p-2 bg-blue-500 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Yangi qo'ng'iroq buyurtmasi</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Bugun - {stats.callOrders} ta</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="p-2 bg-green-500 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">Shifokorlar</p>
                <p className="text-xs text-green-700 dark:text-green-300">Jami - {stats.doctors} ta</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="p-2 bg-purple-500 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">Yangiliklar</p>
                <p className="text-xs text-purple-700 dark:text-purple-300">Nashr etilgan - {stats.news} ta</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

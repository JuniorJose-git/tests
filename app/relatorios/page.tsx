"use client"

import { useState, useEffect, useRef } from "react"
import {
  FileText,
  Download,
  Calendar,
  Building2,
  Users,
  Clock,
  Filter,
  Printer,
  BarChart3,
  PieChart,
  Table,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { rooms, initialBookings, timeSlots, type Booking, type Room } from "@/lib/booking-data"
import { cn } from "@/lib/utils"

// Dias da semana
const weekDays = [
  { key: "dom", label: "Dom" },
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
]

// Tipos de relatório
const reportTypes = [
  { id: "mapa-semanal", label: "Mapa Semanal de Ocupação", icon: Calendar },
  { id: "ocupacao-sala", label: "Ocupação por Sala", icon: Building2 },
  { id: "reservas-usuario", label: "Reservas por Usuário", icon: Users },
  { id: "estatisticas", label: "Estatísticas Gerais", icon: BarChart3 },
]

export default function RelatoriosPage() {
  const { user, canApprove } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [selectedReport, setSelectedReport] = useState("mapa-semanal")
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date())
  const [selectedRoom, setSelectedRoom] = useState<string>("all")
  const [selectedBuilding, setSelectedBuilding] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    // Ajustar para início da semana (segunda)
    const today = new Date()
    const day = today.getDay()
    const diff = today.getDate() - day + (day === 0 ? -6 : 1)
    setSelectedWeek(new Date(today.setDate(diff)))
  }, [])

  // Navegar semanas
  const goToPreviousWeek = () => {
    const newDate = new Date(selectedWeek)
    newDate.setDate(newDate.getDate() - 7)
    setSelectedWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(selectedWeek)
    newDate.setDate(newDate.getDate() + 7)
    setSelectedWeek(newDate)
  }

  // Obter datas da semana
  const getWeekDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeek)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Filtrar reservas por semana
  const getWeekBookings = () => {
    const weekDates = getWeekDates()
    const startDate = weekDates[0].toISOString().split("T")[0]
    const endDate = weekDates[6].toISOString().split("T")[0]
    
    return initialBookings.filter((booking) => {
      const bookingDate = booking.date
      const matchDate = bookingDate >= startDate && bookingDate <= endDate
      const matchRoom = selectedRoom === "all" || booking.roomId === selectedRoom
      const matchBuilding = selectedBuilding === "all" || 
        rooms.find(r => r.id === booking.roomId)?.building === selectedBuilding
      return matchDate && matchRoom && matchBuilding && booking.status === "aprovada"
    })
  }

  // Obter reservas para uma sala e dia específico
  const getBookingsForRoomAndDate = (roomId: string, date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return initialBookings.filter(
      (b) => b.roomId === roomId && b.date === dateStr && b.status === "aprovada"
    )
  }

  // Obter prédios únicos
  const buildings = [...new Set(rooms.map(r => r.building))]

  // Filtrar salas
  const filteredRooms = rooms.filter(
    r => selectedBuilding === "all" || r.building === selectedBuilding
  )

  // Estatísticas
  const getStats = () => {
    const weekBookings = getWeekBookings()
    const totalSlots = filteredRooms.length * 7 * timeSlots.length
    const occupiedSlots = weekBookings.length
    const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0

    const byStatus = {
      aprovada: initialBookings.filter(b => b.status === "aprovada").length,
      pendente: initialBookings.filter(b => b.status === "pendente").length,
      rejeitada: initialBookings.filter(b => b.status === "rejeitada").length,
      cancelada: initialBookings.filter(b => b.status === "cancelada").length,
    }

    const byRoom = rooms.map(room => ({
      room,
      count: initialBookings.filter(b => b.roomId === room.id && b.status === "aprovada").length
    })).sort((a, b) => b.count - a.count)

    const byUser = Object.values(
      initialBookings.reduce((acc, b) => {
        if (!acc[b.userId]) {
          acc[b.userId] = { userName: b.userName, count: 0, approved: 0, pending: 0 }
        }
        acc[b.userId].count++
        if (b.status === "aprovada") acc[b.userId].approved++
        if (b.status === "pendente") acc[b.userId].pending++
        return acc
      }, {} as Record<string, { userName: string; count: number; approved: number; pending: number }>)
    ).sort((a, b) => b.count - a.count)

    return { occupancyRate, byStatus, byRoom, byUser, weekBookings }
  }

  // Gerar PDF usando window.print()
  const generatePDF = () => {
    setIsGenerating(true)
    setTimeout(() => {
      window.print()
      setIsGenerating(false)
    }, 500)
  }

  // Exportar CSV
  const exportCSV = () => {
    const stats = getStats()
    let csv = ""

    if (selectedReport === "mapa-semanal") {
      csv = "Sala,Data,Horário,Título,Responsável,Participantes\n"
      stats.weekBookings.forEach(b => {
        const room = rooms.find(r => r.id === b.roomId)
        csv += `"${room?.name}","${b.date}","${b.startTime}-${b.endTime}","${b.title}","${b.userName}",${b.participants || 0}\n`
      })
    } else if (selectedReport === "ocupacao-sala") {
      csv = "Sala,Prédio,Capacidade,Reservas Aprovadas\n"
      stats.byRoom.forEach(({ room, count }) => {
        csv += `"${room.name}","${room.building}",${room.capacity},${count}\n`
      })
    } else if (selectedReport === "reservas-usuario") {
      csv = "Usuário,Total,Aprovadas,Pendentes\n"
      stats.byUser.forEach(u => {
        csv += `"${u.userName}",${u.count},${u.approved},${u.pending}\n`
      })
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `relatorio-${selectedReport}-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  if (!mounted) return null

  const stats = getStats()
  const weekDates = getWeekDates()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              <h1 className="text-lg font-semibold">Relatórios</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <FileSpreadsheet className="mr-2 size-4" />
                Exportar CSV
              </Button>
              <Button size="sm" onClick={generatePDF} disabled={isGenerating}>
                <Download className="mr-2 size-4" />
                {isGenerating ? "Gerando..." : "Exportar PDF"}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="size-4" />
                Filtros do Relatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Relatório</label>
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <type.icon className="size-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prédio</label>
                  <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {buildings.map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sala</label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Salas</SelectItem>
                      {filteredRooms.map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedReport === "mapa-semanal" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semana</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                        <ChevronLeft className="size-4" />
                      </Button>
                      <div className="min-w-[200px] text-center text-sm font-medium">
                        {weekDates[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} 
                        {" - "}
                        {weekDates[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <Button variant="outline" size="icon" onClick={goToNextWeek}>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo do Relatório (área de impressão) */}
          <div ref={printRef} className="print:p-8">
            {/* Cabeçalho do relatório para impressão */}
            <div className="hidden print:block print:mb-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h1 className="text-2xl font-bold">SalaBook - Sistema de Reservas</h1>
                  <p className="text-muted-foreground">
                    {reportTypes.find(r => r.id === selectedReport)?.label}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Gerado em: {new Date().toLocaleDateString("pt-BR", { 
                    day: "2-digit", 
                    month: "long", 
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</p>
                  <p>Por: {user?.name}</p>
                </div>
              </div>
            </div>

            {/* Mapa Semanal de Ocupação */}
            {selectedReport === "mapa-semanal" && (
              <Card className="print:shadow-none print:border-none">
                <CardHeader className="print:pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="size-5 text-primary print:text-black" />
                    Mapa Semanal de Ocupação
                  </CardTitle>
                  <CardDescription>
                    {weekDates[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} 
                    {" a "}
                    {weekDates[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="border bg-muted p-2 text-left font-medium min-w-[150px]">
                            Sala
                          </th>
                          {weekDates.map((date, i) => (
                            <th key={i} className="border bg-muted p-2 text-center font-medium min-w-[120px]">
                              <div>{weekDays[date.getDay()].label}</div>
                              <div className="text-xs font-normal text-muted-foreground">
                                {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRooms.map((room) => (
                          <tr key={room.id}>
                            <td className="border p-2">
                              <div className="font-medium">{room.name}</div>
                              <div className="text-xs text-muted-foreground">{room.building}</div>
                            </td>
                            {weekDates.map((date, i) => {
                              const dayBookings = getBookingsForRoomAndDate(room.id, date)
                              return (
                                <td key={i} className="border p-1 align-top">
                                  {dayBookings.length > 0 ? (
                                    <div className="space-y-1">
                                      {dayBookings.map((booking) => (
                                        <div
                                          key={booking.id}
                                          className="rounded p-1 text-xs"
                                          style={{
                                            backgroundColor: `${booking.color}20`,
                                            borderLeft: `3px solid ${booking.color}`,
                                          }}
                                        >
                                          <div className="font-medium truncate">{booking.title}</div>
                                          <div className="text-muted-foreground">
                                            {booking.startTime}-{booking.endTime}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-xs text-muted-foreground text-center py-2">
                                      Livre
                                    </div>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Legenda */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm print:mt-6">
                    <div className="font-medium">Legenda:</div>
                    {[...new Set(stats.weekBookings.map(b => b.userName))].slice(0, 5).map((userName, i) => {
                      const booking = stats.weekBookings.find(b => b.userName === userName)
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="size-3 rounded"
                            style={{ backgroundColor: booking?.color }}
                          />
                          <span>{userName}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ocupação por Sala */}
            {selectedReport === "ocupacao-sala" && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="print:shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="size-5 text-primary print:text-black" />
                      Ocupação por Sala
                    </CardTitle>
                    <CardDescription>
                      Total de reservas aprovadas por ambiente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.byRoom.map(({ room, count }, i) => {
                        const maxCount = stats.byRoom[0]?.count || 1
                        const percentage = (count / maxCount) * 100
                        return (
                          <div key={room.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{room.name}</span>
                              <span className="text-muted-foreground">{count} reservas</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {room.building} - Cap. {room.capacity} pessoas
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="print:shadow-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="size-5 text-primary print:text-black" />
                      Taxa de Ocupação
                    </CardTitle>
                    <CardDescription>
                      Visão geral do uso dos ambientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-8">
                      <div className="relative size-48">
                        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className="text-muted stroke-current"
                            strokeWidth="10"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-primary stroke-current"
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            strokeDasharray={`${stats.occupancyRate * 2.51} 251`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold">
                            {stats.occupancyRate.toFixed(1)}%
                          </span>
                          <span className="text-sm text-muted-foreground">Ocupação</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="rounded-lg bg-muted p-3">
                        <div className="text-2xl font-bold">{filteredRooms.length}</div>
                        <div className="text-xs text-muted-foreground">Salas Disponíveis</div>
                      </div>
                      <div className="rounded-lg bg-muted p-3">
                        <div className="text-2xl font-bold">{stats.weekBookings.length}</div>
                        <div className="text-xs text-muted-foreground">Reservas na Semana</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reservas por Usuário */}
            {selectedReport === "reservas-usuario" && (
              <Card className="print:shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="size-5 text-primary print:text-black" />
                    Reservas por Usuário
                  </CardTitle>
                  <CardDescription>
                    Detalhamento de reservas por solicitante
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="border bg-muted p-3 text-left font-medium">Usuário</th>
                          <th className="border bg-muted p-3 text-center font-medium">Total</th>
                          <th className="border bg-muted p-3 text-center font-medium">Aprovadas</th>
                          <th className="border bg-muted p-3 text-center font-medium">Pendentes</th>
                          <th className="border bg-muted p-3 text-center font-medium">Taxa Aprovação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byUser.map((user, i) => {
                          const approvalRate = user.count > 0 
                            ? ((user.approved / user.count) * 100).toFixed(0) 
                            : 0
                          return (
                            <tr key={i}>
                              <td className="border p-3 font-medium">{user.userName}</td>
                              <td className="border p-3 text-center">{user.count}</td>
                              <td className="border p-3 text-center">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                  {user.approved}
                                </Badge>
                              </td>
                              <td className="border p-3 text-center">
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                                  {user.pending}
                                </Badge>
                              </td>
                              <td className="border p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="h-2 w-16 rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full bg-emerald-500"
                                      style={{ width: `${approvalRate}%` }}
                                    />
                                  </div>
                                  <span className="text-xs">{approvalRate}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estatísticas Gerais */}
            {selectedReport === "estatisticas" && (
              <div className="space-y-6">
                {/* Cards de resumo */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="print:shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-emerald-500/10 p-3">
                          <CheckCircle className="size-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.byStatus.aprovada}</div>
                          <div className="text-sm text-muted-foreground">Aprovadas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="print:shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-amber-500/10 p-3">
                          <Clock className="size-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.byStatus.pendente}</div>
                          <div className="text-sm text-muted-foreground">Pendentes</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="print:shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-red-500/10 p-3">
                          <XCircle className="size-6 text-red-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.byStatus.rejeitada}</div>
                          <div className="text-sm text-muted-foreground">Rejeitadas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="print:shadow-none">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-500/10 p-3">
                          <AlertCircle className="size-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.byStatus.cancelada}</div>
                          <div className="text-sm text-muted-foreground">Canceladas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabela detalhada */}
                <Card className="print:shadow-none">
                  <CardHeader>
                    <CardTitle>Resumo Detalhado</CardTitle>
                    <CardDescription>Visão completa do sistema de reservas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-3 font-medium">Por Tipo de Ambiente</h4>
                        <div className="space-y-2">
                          {[
                            { type: "sala_aula", label: "Salas de Aula" },
                            { type: "laboratorio", label: "Laboratórios" },
                            { type: "auditorio", label: "Auditórios" },
                            { type: "sala_reuniao", label: "Salas de Reunião" },
                          ].map(({ type, label }) => {
                            const roomsOfType = rooms.filter(r => r.type === type)
                            const count = initialBookings.filter(
                              b => roomsOfType.some(r => r.id === b.roomId) && b.status === "aprovada"
                            ).length
                            return (
                              <div key={type} className="flex items-center justify-between rounded-lg bg-muted p-2">
                                <span className="text-sm">{label}</span>
                                <Badge variant="secondary">{count} reservas</Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-3 font-medium">Por Prédio</h4>
                        <div className="space-y-2">
                          {buildings.map(building => {
                            const buildingRooms = rooms.filter(r => r.building === building)
                            const count = initialBookings.filter(
                              b => buildingRooms.some(r => r.id === b.roomId) && b.status === "aprovada"
                            ).length
                            return (
                              <div key={building} className="flex items-center justify-between rounded-lg bg-muted p-2">
                                <span className="text-sm">{building}</span>
                                <Badge variant="secondary">{count} reservas</Badge>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Top 5 Salas */}
                <Card className="print:shadow-none">
                  <CardHeader>
                    <CardTitle>Top 5 Salas Mais Utilizadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.byRoom.slice(0, 5).map(({ room, count }, i) => (
                        <div key={room.id} className="flex items-center gap-4">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{room.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {room.building} - {room.type.replace("_", " ")}
                            </div>
                          </div>
                          <Badge>{count} reservas</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Rodapé do relatório para impressão */}
            <div className="hidden print:block print:mt-8 print:pt-4 print:border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>SalaBook - Sistema de Reservas Acadêmicas</span>
                <span>Documento gerado automaticamente - {new Date().toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>

      {/* Estilos de impressão */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          aside, header, [data-slot="sidebar"] {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>
    </SidebarProvider>
  )
}

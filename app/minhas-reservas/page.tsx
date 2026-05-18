"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  XCircle,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  RefreshCw,
  Plus,
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/components/auth-provider"
import { 
  Booking, 
  BookingStatus, 
  rooms, 
  initialBookings, 
  getStatusName, 
  getStatusColor,
  getRoomTypeName,
} from "@/lib/booking-data"
import { cn } from "@/lib/utils"
import { format, isAfter, isBefore, isToday, parseISO, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function MinhasReservasPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date_asc")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  useEffect(() => {
    setMounted(true)
    // Filtrar reservas do usuário atual
    if (user) {
      const userBookings = initialBookings.filter(b => b.userId === user.id)
      setBookings(userBookings)
    }
  }, [user])

  // Estatísticas das reservas
  const stats = useMemo(() => {
    const today = startOfDay(new Date())
    return {
      total: bookings.length,
      pendentes: bookings.filter(b => b.status === "pendente").length,
      aprovadas: bookings.filter(b => b.status === "aprovada").length,
      proximas: bookings.filter(b => 
        b.status === "aprovada" && 
        isAfter(parseISO(b.date), today) || isToday(parseISO(b.date))
      ).length,
    }
  }, [bookings])

  // Filtrar e ordenar reservas
  const filteredBookings = useMemo(() => {
    let result = [...bookings]

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(b => 
        b.title.toLowerCase().includes(term) ||
        rooms.find(r => r.id === b.roomId)?.name.toLowerCase().includes(term)
      )
    }

    // Filtro de status
    if (statusFilter !== "all") {
      result = result.filter(b => b.status === statusFilter)
    }

    // Filtro de data
    const today = startOfDay(new Date())
    if (dateFilter === "today") {
      result = result.filter(b => isToday(parseISO(b.date)))
    } else if (dateFilter === "upcoming") {
      result = result.filter(b => isAfter(parseISO(b.date), today) || isToday(parseISO(b.date)))
    } else if (dateFilter === "past") {
      result = result.filter(b => isBefore(parseISO(b.date), today))
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortBy === "date_asc") {
        return parseISO(a.date).getTime() - parseISO(b.date).getTime()
      } else if (sortBy === "date_desc") {
        return parseISO(b.date).getTime() - parseISO(a.date).getTime()
      } else if (sortBy === "status") {
        return a.status.localeCompare(b.status)
      }
      return 0
    })

    return result
  }, [bookings, searchTerm, statusFilter, dateFilter, sortBy])

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setViewDialogOpen(true)
  }

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setCancelReason("")
    setCancelDialogOpen(true)
  }

  const confirmCancelBooking = () => {
    if (selectedBooking) {
      setBookings(prev => prev.map(b => 
        b.id === selectedBooking.id 
          ? { ...b, status: "cancelada" as BookingStatus }
          : b
      ))
      setCancelDialogOpen(false)
      setSelectedBooking(null)
    }
  }

  const getRoomInfo = (roomId: string) => {
    return rooms.find(r => r.id === roomId)
  }

  const formatBookingDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) {
      return "Hoje"
    }
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })
  }

  if (!mounted) {
    return null
  }

  if (!user) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <Card className="w-96">
              <CardHeader className="text-center">
                <CardTitle>Acesso Restrito</CardTitle>
                <CardDescription>
                  Faça login para visualizar suas reservas
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button asChild>
                  <a href="/login">Fazer Login</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">Minhas Reservas</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie suas reservas de salas
              </p>
            </div>
            <Button asChild>
              <a href="/grade">
                <Plus className="mr-2 size-4" />
                Nova Reserva
              </a>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Cards de estatísticas */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Reservas</p>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <AlertCircle className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-foreground">{stats.pendentes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aprovadas</p>
                    <p className="text-2xl font-bold text-foreground">{stats.aprovadas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Clock className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Próximas</p>
                    <p className="text-2xl font-bold text-foreground">{stats.proximas}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título ou sala..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="aprovada">Aprovada</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="upcoming">Próximas</SelectItem>
                    <SelectItem value="past">Passadas</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <ArrowUpDown className="mr-2 size-4" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_asc">Data (mais próxima)</SelectItem>
                    <SelectItem value="date_desc">Data (mais distante)</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de reservas */}
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {filteredBookings.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarDays className="size-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Nenhuma reserva encontrada
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                        ? "Tente ajustar os filtros"
                        : "Você ainda não possui reservas"}
                    </p>
                    <Button asChild className="mt-4">
                      <a href="/grade">Fazer uma reserva</a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((booking) => {
                    const room = getRoomInfo(booking.roomId)
                    return (
                      <Card key={booking.id} className="overflow-hidden">
                        <div className="flex">
                          {/* Barra de cor do status */}
                          <div 
                            className={cn(
                              "w-1.5 shrink-0",
                              booking.status === "aprovada" && "bg-emerald-500",
                              booking.status === "pendente" && "bg-amber-500",
                              booking.status === "rejeitada" && "bg-red-500",
                              booking.status === "cancelada" && "bg-gray-500",
                            )}
                          />
                          <CardContent className="flex-1 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground">
                                    {booking.title}
                                  </h3>
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs", getStatusColor(booking.status))}
                                  >
                                    {getStatusName(booking.status)}
                                  </Badge>
                                  {booking.recurrence !== "none" && (
                                    <Badge variant="outline" className="text-xs">
                                      <RefreshCw className="mr-1 size-3" />
                                      Recorrente
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="size-4" />
                                    {formatBookingDate(booking.date)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="size-4" />
                                    {booking.startTime} - {booking.endTime}
                                  </span>
                                  {room && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="size-4" />
                                      {room.name} ({room.code})
                                    </span>
                                  )}
                                  {booking.participants && (
                                    <span className="flex items-center gap-1">
                                      <Users className="size-4" />
                                      {booking.participants} participantes
                                    </span>
                                  )}
                                </div>
                                {booking.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {booking.description}
                                  </p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
<DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/reserva/${booking.id}`)}>
                              <Eye className="mr-2 size-4" />
                              Ver Detalhes
                            </DropdownMenuItem>
                                  {booking.status === "pendente" && (
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 size-4" />
                                      Editar
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {(booking.status === "pendente" || booking.status === "aprovada") && (
                                    <DropdownMenuItem 
                                      onClick={() => handleCancelBooking(booking)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <XCircle className="mr-2 size-4" />
                                      Cancelar Reserva
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-center">
                    <CalendarComponent
                      mode="multiple"
                      selected={filteredBookings
                        .filter(b => b.status === "aprovada" || b.status === "pendente")
                        .map(b => parseISO(b.date))
                      }
                      className="rounded-md border"
                      locale={ptBR}
                    />
                  </div>
                  <div className="mt-4 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-emerald-500" />
                      <span>Aprovadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-amber-500" />
                      <span>Pendentes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Dialog de detalhes */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalhes da Reserva</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedBooking.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(selectedBooking.status)}
                  >
                    {getStatusName(selectedBooking.status)}
                  </Badge>
                </div>
                
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium">
                        {format(parseISO(selectedBooking.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Horário</p>
                      <p className="font-medium">
                        {selectedBooking.startTime} - {selectedBooking.endTime}
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const room = getRoomInfo(selectedBooking.roomId)
                    return room ? (
                      <div className="flex items-center gap-3">
                        <MapPin className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Local</p>
                          <p className="font-medium">
                            {room.name} ({room.code})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {room.building} - {getRoomTypeName(room.type)}
                          </p>
                        </div>
                      </div>
                    ) : null
                  })()}
                  {selectedBooking.participants && (
                    <div className="flex items-center gap-3">
                      <Users className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Participantes</p>
                        <p className="font-medium">{selectedBooking.participants} pessoas</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedBooking.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                    <p className="text-sm">{selectedBooking.description}</p>
                  </div>
                )}

                {selectedBooking.recurrence !== "none" && (
                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCw className="size-4 text-muted-foreground" />
                    <span>
                      Reserva recorrente ({selectedBooking.recurrence === "weekly" ? "semanal" : selectedBooking.recurrence === "daily" ? "diária" : "mensal"})
                    </span>
                  </div>
                )}

                {selectedBooking.approvedBy && (
                  <div className="rounded-lg bg-emerald-500/10 p-3">
                    <p className="text-sm">
                      <span className="font-medium">Aprovada</span> em{" "}
                      {selectedBooking.approvedAt && format(
                        new Date(selectedBooking.approvedAt), 
                        "dd/MM/yyyy 'às' HH:mm", 
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                )}

                {selectedBooking.rejectionReason && (
                  <div className="rounded-lg bg-red-500/10 p-3">
                    <p className="text-sm font-medium text-red-600">Motivo da rejeição:</p>
                    <p className="text-sm">{selectedBooking.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Fechar
              </Button>
              {selectedBooking && (selectedBooking.status === "pendente" || selectedBooking.status === "aprovada") && (
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setViewDialogOpen(false)
                    handleCancelBooking(selectedBooking)
                  }}
                >
                  Cancelar Reserva
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de cancelamento */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedBooking && (
              <div className="rounded-lg border border-border p-3 my-2">
                <p className="font-medium">{selectedBooking.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedBooking.date), "dd/MM/yyyy", { locale: ptBR })} - {selectedBooking.startTime} às {selectedBooking.endTime}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo do cancelamento (opcional)</label>
              <Textarea
                placeholder="Informe o motivo do cancelamento..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelBooking}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Confirmar Cancelamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

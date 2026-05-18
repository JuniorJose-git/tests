"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { StatsCard } from "@/components/stats-card"
import { RoomCard, type Room } from "@/components/room-card"
import { BookingTable, type Booking } from "@/components/booking-table"
import { BookingDialog } from "@/components/booking-dialog"
import { DoorOpen, Users, Clock, CalendarCheck } from "lucide-react"

// Mock data
const rooms: Room[] = [
  {
    id: "1",
    name: "Sala Executiva",
    capacity: 12,
    floor: "3º Andar",
    status: "available",
    amenities: ["wifi", "monitor", "projector"],
    nextBooking: "Hoje às 15:00",
  },
  {
    id: "2",
    name: "Sala de Reuniões A",
    capacity: 8,
    floor: "2º Andar",
    status: "occupied",
    amenities: ["wifi", "monitor"],
  },
  {
    id: "3",
    name: "Sala de Treinamento",
    capacity: 30,
    floor: "1º Andar",
    status: "available",
    amenities: ["wifi", "projector"],
    nextBooking: "Amanhã às 09:00",
  },
  {
    id: "4",
    name: "Sala de Conferência",
    capacity: 20,
    floor: "3º Andar",
    status: "maintenance",
    amenities: ["wifi", "monitor", "projector"],
  },
  {
    id: "5",
    name: "Sala Criativa",
    capacity: 6,
    floor: "2º Andar",
    status: "available",
    amenities: ["wifi", "monitor"],
  },
  {
    id: "6",
    name: "Sala de Brainstorm",
    capacity: 10,
    floor: "2º Andar",
    status: "occupied",
    amenities: ["wifi", "projector"],
  },
]

const bookings: Booking[] = [
  {
    id: "1",
    room: "Sala Executiva",
    user: "João Silva",
    userInitials: "JS",
    date: "10/03/2026",
    time: "14:00",
    duration: "2 horas",
    status: "confirmed",
  },
  {
    id: "2",
    room: "Sala de Reuniões A",
    user: "Maria Santos",
    userInitials: "MS",
    date: "10/03/2026",
    time: "09:00",
    duration: "1 hora",
    status: "pending",
  },
  {
    id: "3",
    room: "Sala de Treinamento",
    user: "Pedro Costa",
    userInitials: "PC",
    date: "11/03/2026",
    time: "10:00",
    duration: "3 horas",
    status: "confirmed",
  },
  {
    id: "4",
    room: "Sala Criativa",
    user: "Ana Oliveira",
    userInitials: "AO",
    date: "11/03/2026",
    time: "15:00",
    duration: "1h 30min",
    status: "pending",
  },
  {
    id: "5",
    room: "Sala de Conferência",
    user: "Lucas Ferreira",
    userInitials: "LF",
    date: "09/03/2026",
    time: "11:00",
    duration: "2 horas",
    status: "cancelled",
  },
]

interface DashboardContentProps {
  bookingDialogOpen: boolean
  setBookingDialogOpen: (open: boolean) => void
}

export function DashboardContent({
  bookingDialogOpen,
  setBookingDialogOpen,
}: DashboardContentProps) {
  const [selectedRoom, setSelectedRoom] = React.useState<Room | undefined>()
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room)
    setBookingDialogOpen(true)
  }

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do sistema de agendamento de salas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Salas"
          value={rooms.length}
          description="Cadastradas no sistema"
          icon={DoorOpen}
        />
        <StatsCard
          title="Salas Disponíveis"
          value={rooms.filter((r) => r.status === "available").length}
          description="Prontas para reserva"
          icon={CalendarCheck}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Reservas Hoje"
          value={12}
          description="Agendamentos confirmados"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Usuários Ativos"
          value={48}
          description="Últimos 7 dias"
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="rooms" className="space-y-4">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="rooms">Salas</TabsTrigger>
              <TabsTrigger value="bookings">Reservas Recentes</TabsTrigger>
            </TabsList>
            <TabsContent value="rooms" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onBook={handleBookRoom}
                    onEdit={(r) => console.log("Edit", r)}
                    onDelete={(r) => console.log("Delete", r)}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="bookings">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Reservas Recentes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <BookingTable
                    bookings={bookings}
                    onApprove={(b) => console.log("Approve", b)}
                    onReject={(b) => console.log("Reject", b)}
                    onView={(b) => console.log("View", b)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Calendar & Quick Info */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Calendário</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Próximas Reservas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings
                .filter((b) => b.status === "confirmed")
                .slice(0, 3)
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="size-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{booking.room}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.date} às {booking.time}
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status das Salas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-success" />
                    <span className="text-sm">Disponíveis</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {rooms.filter((r) => r.status === "available").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-destructive" />
                    <span className="text-sm">Ocupadas</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {rooms.filter((r) => r.status === "occupied").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-warning" />
                    <span className="text-sm">Manutenção</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {rooms.filter((r) => r.status === "maintenance").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        room={selectedRoom}
        rooms={rooms}
      />
    </div>
  )
}

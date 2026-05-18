"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  Clock,
  Users,
  DoorOpen,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { initialBookings, rooms, formatDate } from "@/lib/booking-data"

export default function DashboardPage() {
  const { user, isLoading, canApprove } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const myBookings = initialBookings.filter((b) => b.userId === user.id)
  const pendingBookings = initialBookings.filter((b) => b.status === "pendente")
  const approvedBookings = initialBookings.filter((b) => b.status === "aprovada")

  const stats = [
    {
      title: "Total de Salas",
      value: rooms.length,
      icon: DoorOpen,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Minhas Reservas",
      value: myBookings.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Reservas Aprovadas",
      value: approvedBookings.length,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Pendentes",
      value: pendingBookings.length,
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Bem-vindo, {user.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie suas reservas de salas
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-5 text-primary" />
                  Grade de Horários
                </CardTitle>
                <CardDescription>
                  Visualize todas as salas e suas reservas em uma grade interativa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/grade">
                    Acessar Grade
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-blue-600" />
                  Minhas Reservas
                </CardTitle>
                <CardDescription>
                  Acompanhe suas solicitações e reservas aprovadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/minhas-reservas">
                    Ver Reservas
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {canApprove && (
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-amber-600" />
                    Solicitações
                    {pendingBookings.length > 0 && (
                      <Badge className="ml-auto">{pendingBookings.length}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Aprove ou rejeite solicitações de reserva
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/solicitacoes">
                      Gerenciar
                      <ArrowRight className="size-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Reservas Recentes</CardTitle>
              <CardDescription>Suas últimas reservas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {myBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não possui reservas</p>
                  <Button asChild className="mt-4">
                    <Link href="/grade">Fazer primeira reserva</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.slice(0, 5).map((booking) => {
                    const room = rooms.find((r) => r.id === booking.roomId)
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="size-2 rounded-full"
                            style={{ backgroundColor: booking.color }}
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              {booking.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {room?.name} | {formatDate(booking.date)} | {booking.startTime}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            booking.status === "aprovada"
                              ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                              : booking.status === "pendente"
                              ? "bg-amber-500/20 text-amber-600 border-amber-500/30"
                              : "bg-red-500/20 text-red-600 border-red-500/30"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

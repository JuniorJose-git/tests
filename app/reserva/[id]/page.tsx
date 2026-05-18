"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User,
  Mail,
  Building2,
  Repeat,
  FileText,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  AlertTriangle,
  History,
  Loader2
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { 
  Booking, 
  BookingHistoryItem,
  rooms, 
  getStatusName, 
  getStatusColor,
  getRoomTypeName,
  initialBookings,
  generateId
} from "@/lib/booking-data"
import { cn } from "@/lib/utils"

// Mapeamento de cores do status para a barra lateral
const statusBarColors: Record<string, string> = {
  pendente: "bg-amber-500",
  aprovada: "bg-emerald-500",
  rejeitada: "bg-red-500",
  cancelada: "bg-gray-500",
  em_andamento: "bg-blue-500",
  concluida: "bg-gray-400",
}

// Mapeamento de ícones para ações do histórico
const actionIcons: Record<string, typeof CheckCircle2> = {
  criada: FileText,
  aprovada: CheckCircle2,
  rejeitada: XCircle,
  cancelada: AlertTriangle,
  editada: Edit,
  comentario: MessageSquare,
}

const actionColors: Record<string, string> = {
  criada: "text-blue-500 bg-blue-500/10",
  aprovada: "text-emerald-500 bg-emerald-500/10",
  rejeitada: "text-red-500 bg-red-500/10",
  cancelada: "text-gray-500 bg-gray-500/10",
  editada: "text-amber-500 bg-amber-500/10",
  comentario: "text-primary bg-primary/10",
}

const actionLabels: Record<string, string> = {
  criada: "Reserva Criada",
  aprovada: "Reserva Aprovada",
  rejeitada: "Reserva Rejeitada",
  cancelada: "Reserva Cancelada",
  editada: "Reserva Editada",
  comentario: "Comentário",
}

const recurrenceLabels: Record<string, string> = {
  none: "Única",
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
}

export default function ReservaDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const { user, canApprove, isLoading: authLoading } = useAuth()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Simula carregamento da reserva
    const id = params.id as string
    const found = initialBookings.find(b => b.id === id)
    
    setTimeout(() => {
      setBooking(found || null)
      setIsLoading(false)
    }, 300)
  }, [params.id, user, authLoading, router])

  const room = booking ? rooms.find(r => r.id === booking.roomId) : null

  const formatDateTime = (date: string, time: string) => {
    const d = new Date(date)
    return {
      date: d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      time,
    }
  }

  const formatHistoryDate = (timestamp: string) => {
    const d = new Date(timestamp)
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleAddComment = () => {
    if (!comment.trim() || !booking || !user) return

    const newHistoryItem: BookingHistoryItem = {
      id: generateId(),
      action: "comentario",
      userId: user.id,
      userName: user.name,
      userRole: user.role === "admin" ? "Administrador" : 
                user.role === "coordenador" ? "Coordenador" : 
                user.role === "professor" ? "Professor" : "Funcionário",
      timestamp: new Date().toISOString(),
      message: comment,
    }

    setBooking({
      ...booking,
      history: [...(booking.history || []), newHistoryItem],
    })
    setComment("")
  }

  const handleApprove = async () => {
    if (!booking || !user) return
    setIsSubmitting(true)

    // Simula aprovação
    await new Promise(resolve => setTimeout(resolve, 500))

    const newHistoryItem: BookingHistoryItem = {
      id: generateId(),
      action: "aprovada",
      userId: user.id,
      userName: user.name,
      userRole: user.role === "admin" ? "Administrador" : "Coordenador",
      timestamp: new Date().toISOString(),
      message: comment || "Reserva aprovada.",
    }

    setBooking({
      ...booking,
      status: "aprovada",
      approvedBy: user.id,
      approvedAt: new Date().toISOString(),
      history: [...(booking.history || []), newHistoryItem],
    })

    setIsSubmitting(false)
    setShowApproveDialog(false)
    setComment("")
  }

  const handleReject = async () => {
    if (!booking || !user || !rejectionReason.trim()) return
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    const newHistoryItem: BookingHistoryItem = {
      id: generateId(),
      action: "rejeitada",
      userId: user.id,
      userName: user.name,
      userRole: user.role === "admin" ? "Administrador" : "Coordenador",
      timestamp: new Date().toISOString(),
      message: rejectionReason,
    }

    setBooking({
      ...booking,
      status: "rejeitada",
      rejectionReason: rejectionReason,
      history: [...(booking.history || []), newHistoryItem],
    })

    setIsSubmitting(false)
    setShowRejectDialog(false)
    setRejectionReason("")
  }

  const handleCancel = async () => {
    if (!booking || !user) return
    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    const newHistoryItem: BookingHistoryItem = {
      id: generateId(),
      action: "cancelada",
      userId: user.id,
      userName: user.name,
      userRole: user.role === "admin" ? "Administrador" : 
                user.role === "coordenador" ? "Coordenador" : 
                user.role === "professor" ? "Professor" : "Funcionário",
      timestamp: new Date().toISOString(),
      message: "Reserva cancelada pelo usuário.",
    }

    setBooking({
      ...booking,
      status: "cancelada",
      history: [...(booking.history || []), newHistoryItem],
    })

    setIsSubmitting(false)
    setShowCancelDialog(false)
  }

  const canModify = booking && user && (
    booking.userId === user.id || 
    canApprove
  )

  const canCancelBooking = booking && user && (
    (booking.userId === user.id && ["pendente", "aprovada"].includes(booking.status)) ||
    canApprove
  )

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!booking) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen flex-col items-center justify-center gap-4">
            <AlertTriangle className="size-16 text-muted-foreground" />
            <h1 className="text-2xl font-semibold text-foreground">Reserva não encontrada</h1>
            <p className="text-muted-foreground">A reserva que você está procurando não existe ou foi removida.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const { date, time: startTime } = formatDateTime(booking.date, booking.startTime)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 size-4" />
            Voltar
          </Button>
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Detalhes da Reserva</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Status Banner */}
            <Card className={cn(
              "relative overflow-hidden border-l-4",
              statusBarColors[booking.status]
            )}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Badge className={cn("text-sm", getStatusColor(booking.status))}>
                    {getStatusName(booking.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ID da Reserva: #{booking.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canApprove && booking.status === "pendente" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-emerald-500 text-emerald-600 hover:bg-emerald-500/10"
                        onClick={() => setShowApproveDialog(true)}
                      >
                        <CheckCircle2 className="mr-2 size-4" />
                        Aprovar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-red-500 text-red-600 hover:bg-red-500/10"
                        onClick={() => setShowRejectDialog(true)}
                      >
                        <XCircle className="mr-2 size-4" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  {canCancelBooking && !["cancelada", "rejeitada", "concluida"].includes(booking.status) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Informações Principais */}
              <div className="space-y-6 lg:col-span-2">
                {/* Detalhes da Reserva */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{booking.title}</CardTitle>
                    {booking.description && (
                      <CardDescription className="text-base">
                        {booking.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Calendar className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Data</p>
                        <p className="capitalize text-foreground">{date}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Clock className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Horário</p>
                        <p className="text-foreground">{booking.startTime} - {booking.endTime}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Users className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Participantes</p>
                        <p className="text-foreground">{booking.participants || "Não informado"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Repeat className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Recorrência</p>
                        <p className="text-foreground">{recurrenceLabels[booking.recurrence]}</p>
                        {booking.recurrenceEndDate && (
                          <p className="text-sm text-muted-foreground">
                            Até {new Date(booking.recurrenceEndDate).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações da Sala */}
                {room && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Building2 className="size-5 text-primary" />
                        Informações da Sala
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-secondary p-2">
                          <MapPin className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Local</p>
                          <p className="text-foreground">{room.name}</p>
                          <p className="text-sm text-muted-foreground">{room.code} - {room.building}, Andar {room.floor}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-secondary p-2">
                          <Users className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Capacidade</p>
                          <p className="text-foreground">{room.capacity} pessoas</p>
                          <p className="text-sm text-muted-foreground">{getRoomTypeName(room.type)}</p>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="mb-2 text-sm font-medium text-muted-foreground">Recursos</p>
                        <div className="flex flex-wrap gap-2">
                          {room.resources.map((resource) => (
                            <Badge key={resource} variant="secondary">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Motivo de Rejeição */}
                {booking.status === "rejeitada" && booking.rejectionReason && (
                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                        <XCircle className="size-5" />
                        Motivo da Rejeição
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground">{booking.rejectionReason}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Histórico */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="size-5 text-primary" />
                      Histórico de Ações
                    </CardTitle>
                    <CardDescription>
                      Acompanhe todas as atualizações desta reserva
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-4">
                      {/* Timeline line */}
                      <div className="absolute left-5 top-0 h-full w-px bg-border" />
                      
                      {(booking.history && booking.history.length > 0) ? (
                        [...booking.history].reverse().map((item, index) => {
                          const Icon = actionIcons[item.action] || MessageSquare
                          return (
                            <div key={item.id} className="relative flex gap-4 pl-2">
                              <div className={cn(
                                "relative z-10 flex size-8 items-center justify-center rounded-full",
                                actionColors[item.action]
                              )}>
                                <Icon className="size-4" />
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">
                                      {actionLabels[item.action]}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      por {item.userName}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {item.userRole}
                                    </Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {formatHistoryDate(item.timestamp)}
                                  </span>
                                </div>
                                {item.message && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {item.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <History className="mx-auto mb-2 size-8 opacity-50" />
                          <p>Nenhuma atividade registrada ainda.</p>
                        </div>
                      )}
                    </div>

                    {/* Adicionar Comentário */}
                    {canModify && (
                      <div className="mt-6 border-t border-border pt-4">
                        <Label className="mb-2 block text-sm font-medium">Adicionar Comentário</Label>
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Escreva um comentário sobre esta reserva..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button 
                            size="sm" 
                            onClick={handleAddComment}
                            disabled={!comment.trim()}
                          >
                            <Send className="mr-2 size-4" />
                            Enviar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Solicitante */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="size-5 text-primary" />
                      Solicitante
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {booking.userName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{booking.userName}</p>
                        <p className="text-sm text-muted-foreground">{booking.userEmail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Datas Importantes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informações do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Criada em</p>
                      <p className="text-foreground">
                        {new Date(booking.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Última atualização</p>
                      <p className="text-foreground">
                        {new Date(booking.updatedAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {booking.approvedBy && booking.approvedAt && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aprovada em</p>
                        <p className="text-foreground">
                          {new Date(booking.approvedAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Dialog de Aprovação */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aprovar Reserva</DialogTitle>
              <DialogDescription>
                Você está prestes a aprovar esta solicitação de reserva.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="approve-comment">Comentário (opcional)</Label>
              <Textarea
                id="approve-comment"
                placeholder="Adicione um comentário sobre a aprovação..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleApprove} 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 size-4" />
                )}
                Aprovar Reserva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Rejeição */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Reserva</DialogTitle>
              <DialogDescription>
                Você está prestes a rejeitar esta solicitação de reserva. Por favor, informe o motivo.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="rejection-reason">Motivo da Rejeição *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Explique o motivo da rejeição..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                required
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleReject} 
                disabled={isSubmitting || !rejectionReason.trim()}
                variant="destructive"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 size-4" />
                )}
                Rejeitar Reserva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Cancelamento */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancel}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                Cancelar Reserva
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

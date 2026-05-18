"use client"

import * as React from "react"
import { CalendarIcon, Clock, Users, MapPin, Repeat, FileText, AlertTriangle, ChevronLeft, Calendar as CalendarIcon2, Info, CheckCircle2, XCircle } from "lucide-react"
import { format, addDays, addWeeks, addMonths, eachDayOfInterval, isSameDay, getDay, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/components/auth-provider"
import {
  BookingConflictResolver,
  type ConflictResolution,
} from "@/components/booking-conflict-resolver"
import {
  rooms,
  timeSlots,
  initialBookings,
  type Room,
  type Booking,
  type RecurrenceType,
  generateId,
  getUserColor,
} from "@/lib/booking-data"

interface NewBookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (booking: Booking, resolutions?: ConflictResolution[], skippedDates?: string[]) => void
  preselectedRoom?: string
  preselectedDate?: Date
  existingBookings?: Booking[]
}

export function NewBookingDialog({
  open,
  onOpenChange,
  onSubmit,
  preselectedRoom,
  preselectedDate,
  existingBookings = initialBookings,
}: NewBookingDialogProps) {
  const { user, canCreateBookingForOthers } = useAuth()
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedRoom, setSelectedRoom] = React.useState(preselectedRoom || "")
  const [date, setDate] = React.useState<Date | undefined>(preselectedDate)
  const [startTime, setStartTime] = React.useState("")
  const [endTime, setEndTime] = React.useState("")
  const [participants, setParticipants] = React.useState("")
  const [recurrence, setRecurrence] = React.useState<RecurrenceType>("none")
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState<Date | undefined>()
  const [isMultipleDays, setIsMultipleDays] = React.useState(false)
  const [selectedDays, setSelectedDays] = React.useState<Date[]>([])
  
  // Estados para cronjob (dias da semana)
  const [selectedWeekdays, setSelectedWeekdays] = React.useState<number[]>([])
  const [recurrenceInterval, setRecurrenceInterval] = React.useState(1) // a cada N semanas/meses
  const [showPreview, setShowPreview] = React.useState(false)
  
  // Estado para resolucao de conflitos
  const [showConflictResolver, setShowConflictResolver] = React.useState(false)
  const [hasConflicts, setHasConflicts] = React.useState(false)

  // Dias da semana
  const weekdays = [
    { id: 0, label: "Dom", fullLabel: "Domingo" },
    { id: 1, label: "Seg", fullLabel: "Segunda-feira" },
    { id: 2, label: "Ter", fullLabel: "Terca-feira" },
    { id: 3, label: "Qua", fullLabel: "Quarta-feira" },
    { id: 4, label: "Qui", fullLabel: "Quinta-feira" },
    { id: 5, label: "Sex", fullLabel: "Sexta-feira" },
    { id: 6, label: "Sab", fullLabel: "Sabado" },
  ]

  // Reset form when dialog opens with preselected values
  React.useEffect(() => {
    if (open) {
      setSelectedRoom(preselectedRoom || "")
      setDate(preselectedDate)
      if (preselectedDate) {
        setSelectedDays([preselectedDate])
      }
    }
  }, [open, preselectedRoom, preselectedDate])

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom)

  // Gerar datas de recorrencia como cronjob
  const generateRecurringDates = React.useCallback(() => {
    if (!date || recurrence === "none" || !recurrenceEndDate) {
      return date ? [date] : []
    }

    const dates: Date[] = []
    const startDate = new Date(date)
    const endDate = new Date(recurrenceEndDate)

    if (recurrence === "daily") {
      // Diario - todos os dias uteis ou todos os dias
      let current = new Date(startDate)
      while (current <= endDate) {
        dates.push(new Date(current))
        current = addDays(current, recurrenceInterval)
      }
    } else if (recurrence === "weekly") {
      // Semanal - nos dias da semana selecionados
      if (selectedWeekdays.length === 0) {
        // Se nenhum dia selecionado, usa o dia da data inicial
        const dayOfWeek = getDay(startDate)
        let current = new Date(startDate)
        while (current <= endDate) {
          dates.push(new Date(current))
          current = addWeeks(current, recurrenceInterval)
        }
      } else {
        // Para cada semana no intervalo
        let weekStart = new Date(startDate)
        while (weekStart <= endDate) {
          // Adiciona cada dia da semana selecionado
          for (const dayOfWeek of selectedWeekdays) {
            const daysUntilTarget = (dayOfWeek - getDay(weekStart) + 7) % 7
            const targetDate = addDays(weekStart, daysUntilTarget)
            if (targetDate >= startDate && targetDate <= endDate) {
              // Evita duplicatas
              if (!dates.some(d => isSameDay(d, targetDate))) {
                dates.push(targetDate)
              }
            }
          }
          weekStart = addWeeks(weekStart, recurrenceInterval)
        }
        // Ordena por data
        dates.sort((a, b) => a.getTime() - b.getTime())
      }
    } else if (recurrence === "monthly") {
      // Mensal - mesmo dia do mes
      let current = new Date(startDate)
      while (current <= endDate) {
        dates.push(new Date(current))
        current = addMonths(current, recurrenceInterval)
      }
    }

    return dates
  }, [date, recurrence, recurrenceEndDate, selectedWeekdays, recurrenceInterval])

  // Verificar conflitos para cada data gerada
  const checkConflictsForDates = React.useCallback((dates: Date[]) => {
    if (!user || !selectedRoom || !startTime || !endTime) {
      return { conflictDates: [], freeDates: [] }
    }

    const timesOverlap = (s1: string, e1: string, s2: string, e2: string) => {
      const toMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number)
        return h * 60 + m
      }
      return toMinutes(s1) < toMinutes(e2) && toMinutes(e1) > toMinutes(s2)
    }

    const conflictDates: { date: Date; conflictingBooking: Booking }[] = []
    const freeDates: Date[] = []

    for (const checkDate of dates) {
      const dateStr = format(checkDate, "yyyy-MM-dd")
      
      const conflict = existingBookings.find((booking) => {
        if (
          booking.userId === user.id ||
          booking.status === "cancelada" ||
          booking.status === "rejeitada"
        ) {
          return false
        }

        // Verificar se a reserva ocorre nesse dia
        let occursOnDate = booking.date === dateStr
        
        if (booking.recurrence !== "none" && booking.recurrenceEndDate) {
          const bStartD = new Date(booking.date)
          const bEndD = new Date(booking.recurrenceEndDate)
          
          if (checkDate >= bStartD && checkDate <= bEndD) {
            if (booking.recurrence === "daily") {
              occursOnDate = true
            } else if (booking.recurrence === "weekly") {
              occursOnDate = getDay(bStartD) === getDay(checkDate)
            } else if (booking.recurrence === "monthly") {
              occursOnDate = bStartD.getDate() === checkDate.getDate()
            }
          }
        }

        return (
          occursOnDate &&
          booking.roomId === selectedRoom &&
          timesOverlap(startTime, endTime, booking.startTime, booking.endTime)
        )
      })

      if (conflict) {
        conflictDates.push({ date: checkDate, conflictingBooking: conflict })
      } else {
        freeDates.push(checkDate)
      }
    }

    return { conflictDates, freeDates }
  }, [user, selectedRoom, startTime, endTime, existingBookings])

  // Dados de preview
  const recurringDates = React.useMemo(() => generateRecurringDates(), [generateRecurringDates])
  const { conflictDates, freeDates } = React.useMemo(
    () => checkConflictsForDates(recurringDates),
    [checkConflictsForDates, recurringDates]
  )

  // Verificar conflitos considerando recorrencia
  React.useEffect(() => {
    setHasConflicts(conflictDates.length > 0)
  }, [conflictDates])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !date || !selectedRoom || !startTime || !endTime || !title) {
      return
    }

    // Se ha conflitos e nao estamos no modo de resolucao, mostrar o resolver
    if (hasConflicts && !showConflictResolver) {
      setShowConflictResolver(true)
      return
    }

    createBooking()
  }

  const createBooking = (resolutions?: ConflictResolution[], skippedDates?: string[]) => {
    if (!user || !date || !selectedRoom || !startTime || !endTime || !title) {
      return
    }

    // Calcula as datas a pular (conflitos nao resolvidos)
    const datesToSkip = skippedDates || conflictDates.map(c => format(c.date, "yyyy-MM-dd"))

    const booking: Booking = {
      id: generateId(),
      roomId: selectedRoom,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      title,
      description: description + (
        recurrence !== "none" && selectedWeekdays.length > 0
          ? `\n[Recorrente: ${selectedWeekdays.map(d => weekdays.find(w => w.id === d)?.label).join(", ")}]`
          : ""
      ),
      date: format(date, "yyyy-MM-dd"),
      startTime,
      endTime,
      status: canCreateBookingForOthers ? "aprovada" : "pendente",
      participants: participants ? parseInt(participants, 10) : undefined,
      recurrence,
      recurrenceEndDate: recurrenceEndDate
        ? format(recurrenceEndDate, "yyyy-MM-dd")
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: getUserColor(user.id),
    }

    // Passa as datas livres e os conflitos resolvidos
    onSubmit(booking, resolutions, datesToSkip)
    resetForm()
    onOpenChange(false)
  }

  const handleConflictResolved = (resolutions: ConflictResolution[], skippedDates: string[]) => {
    createBooking(resolutions, skippedDates)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedRoom("")
    setDate(undefined)
    setStartTime("")
    setEndTime("")
    setParticipants("")
    setRecurrence("none")
    setRecurrenceEndDate(undefined)
    setIsMultipleDays(false)
    setSelectedDays([])
    setSelectedWeekdays([])
    setRecurrenceInterval(1)
    setShowPreview(false)
    setShowConflictResolver(false)
    setHasConflicts(false)
  }

  const toggleDay = (day: Date) => {
    setSelectedDays((prev) => {
      const dateStr = format(day, "yyyy-MM-dd")
      const exists = prev.some((d) => format(d, "yyyy-MM-dd") === dateStr)
      if (exists) {
        return prev.filter((d) => format(d, "yyyy-MM-dd") !== dateStr)
      }
      return [...prev, day]
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {showConflictResolver ? (
            <>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowConflictResolver(false)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <DialogTitle>Resolver Conflitos</DialogTitle>
              </div>
              <DialogDescription>
                Foram detectados conflitos com reservas existentes. Escolha como deseja resolver cada um.
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Nova Solicitacao de Reserva</DialogTitle>
              <DialogDescription>
                {canCreateBookingForOthers
                  ? "Como coordenador/admin, sua reserva sera aprovada automaticamente."
                  : "Sua solicitacao sera enviada para aprovacao do coordenador."}
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {showConflictResolver && user && date ? (
          <BookingConflictResolver
            roomId={selectedRoom}
            startDate={date}
            startTime={startTime}
            endTime={endTime}
            recurrence={recurrence}
            recurrenceEndDate={recurrenceEndDate}
            existingBookings={existingBookings}
            currentUserId={user.id}
            onResolve={handleConflictResolved}
            onCancel={() => setShowConflictResolver(false)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          <FieldGroup>
            {/* Título */}
            <Field>
              <FieldLabel htmlFor="title">Título da Reserva *</FieldLabel>
              <Input
                id="title"
                placeholder="Ex: Aula de Engenharia de Software"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Field>

            {/* Sala */}
            <Field>
              <FieldLabel>Sala *</FieldLabel>
              <Select value={selectedRoom} onValueChange={setSelectedRoom} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma sala" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <span>{room.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {room.capacity} lugares
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoomData && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{selectedRoomData.building}, {selectedRoomData.floor}º andar</span>
                  <span className="mx-1">|</span>
                  <span>{selectedRoomData.resources.join(", ")}</span>
                </div>
              )}
            </Field>

            {/* Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Data *</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode={isMultipleDays ? "multiple" : "single"}
                      selected={isMultipleDays ? selectedDays : date}
                      onSelect={(value) => {
                        if (isMultipleDays && value instanceof Date) {
                          toggleDay(value)
                        } else if (!isMultipleDays) {
                          setDate(value as Date | undefined)
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              <Field>
                <FieldLabel>Múltiplos dias</FieldLabel>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={isMultipleDays}
                    onCheckedChange={setIsMultipleDays}
                  />
                  <span className="text-sm text-muted-foreground">
                    Agendar em vários dias
                  </span>
                </div>
              </Field>
            </div>

            {isMultipleDays && selectedDays.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedDays.map((day) => (
                  <Badge key={format(day, "yyyy-MM-dd")} variant="secondary">
                    {format(day, "dd/MM")}
                  </Badge>
                ))}
              </div>
            )}

            {/* Horários */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Horário Inicial *</FieldLabel>
                <Select value={startTime} onValueChange={setStartTime} required>
                  <SelectTrigger>
                    <Clock className="mr-2 size-4 text-muted-foreground" />
                    <SelectValue placeholder="Início" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.startTime}>
                        {slot.startTime} - {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Horário Final *</FieldLabel>
                <Select value={endTime} onValueChange={setEndTime} required>
                  <SelectTrigger>
                    <Clock className="mr-2 size-4 text-muted-foreground" />
                    <SelectValue placeholder="Fim" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.endTime}>
                        {slot.endTime} - {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {/* Participantes */}
            <Field>
              <FieldLabel htmlFor="participants">Número de Participantes</FieldLabel>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="participants"
                  type="number"
                  placeholder="Ex: 30"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="pl-10"
                  min={1}
                  max={selectedRoomData?.capacity}
                />
              </div>
              {selectedRoomData && participants && parseInt(participants) > selectedRoomData.capacity && (
                <p className="text-xs text-destructive mt-1">
                  A sala tem capacidade máxima de {selectedRoomData.capacity} pessoas.
                </p>
              )}
            </Field>

            {/* Recorrencia - Cronjob */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
              <div className="flex items-center gap-2">
                <Repeat className="size-4 text-primary" />
                <span className="text-sm font-medium">Agendamento Recorrente</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Frequencia</FieldLabel>
                  <Select
                    value={recurrence}
                    onValueChange={(v) => {
                      setRecurrence(v as RecurrenceType)
                      if (v === "none") {
                        setSelectedWeekdays([])
                        setRecurrenceEndDate(undefined)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Apenas uma vez</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="monthly">Mensalmente</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {recurrence !== "none" && (
                  <Field>
                    <FieldLabel>A cada</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Select
                        value={String(recurrenceInterval)}
                        onValueChange={(v) => setRecurrenceInterval(parseInt(v))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">
                        {recurrence === "daily" && (recurrenceInterval === 1 ? "dia" : "dias")}
                        {recurrence === "weekly" && (recurrenceInterval === 1 ? "semana" : "semanas")}
                        {recurrence === "monthly" && (recurrenceInterval === 1 ? "mes" : "meses")}
                      </span>
                    </div>
                  </Field>
                )}
              </div>

              {/* Dias da semana (para recorrencia semanal) */}
              {recurrence === "weekly" && (
                <Field>
                  <FieldLabel>Dias da Semana</FieldLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {weekdays.map((day) => (
                      <TooltipProvider key={day.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedWeekdays((prev) =>
                                  prev.includes(day.id)
                                    ? prev.filter((d) => d !== day.id)
                                    : [...prev, day.id].sort()
                                )
                              }}
                              className={cn(
                                "size-10 rounded-full text-sm font-medium transition-colors",
                                selectedWeekdays.includes(day.id)
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                              )}
                            >
                              {day.label}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{day.fullLabel}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                  {selectedWeekdays.length === 0 && date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Nenhum dia selecionado. Sera usado: {weekdays.find(d => d.id === getDay(date))?.fullLabel}
                    </p>
                  )}
                </Field>
              )}

              {/* Data final */}
              {recurrence !== "none" && (
                <Field>
                  <FieldLabel>Repetir ate</FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !recurrenceEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {recurrenceEndDate
                          ? format(recurrenceEndDate, "PPP", { locale: ptBR })
                          : "Selecione a data final"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={recurrenceEndDate}
                        onSelect={setRecurrenceEndDate}
                        disabled={(d) => d < (date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              )}

              {/* Preview das datas */}
              {recurrence !== "none" && recurrenceEndDate && recurringDates.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon2 className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {recurringDates.length} ocorrencia(s)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? "Ocultar" : "Ver datas"}
                    </Button>
                  </div>

                  {/* Resumo de conflitos */}
                  {conflictDates.length > 0 && (
                    <div className="flex items-start gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/30">
                      <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-medium text-amber-600">
                          {conflictDates.length} conflito(s) detectado(s)
                        </span>
                        <p className="text-muted-foreground mt-0.5">
                          {freeDates.length} data(s) estao livres. Voce podera resolver os conflitos ao criar.
                        </p>
                      </div>
                    </div>
                  )}

                  {showPreview && (
                    <ScrollArea className="h-48 rounded-md border">
                      <div className="p-2 space-y-1">
                        {recurringDates.map((d, i) => {
                          const conflict = conflictDates.find(c => isSameDay(c.date, d))
                          return (
                            <div
                              key={i}
                              className={cn(
                                "flex items-center justify-between px-2 py-1.5 rounded text-sm",
                                conflict ? "bg-amber-500/10" : "bg-muted/50"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {conflict ? (
                                  <XCircle className="size-4 text-amber-500" />
                                ) : (
                                  <CheckCircle2 className="size-4 text-emerald-500" />
                                )}
                                <span>{format(d, "EEEE, dd/MM/yyyy", { locale: ptBR })}</span>
                              </div>
                              {conflict && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600">
                                        Conflito
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-xs">
                                        {conflict.conflictingBooking.userName}: {conflict.conflictingBooking.title}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}
            </div>

            {/* Descrição */}
            <Field>
              <FieldLabel htmlFor="description">Descrição / Justificativa</FieldLabel>
              <div className="relative">
                <FileText className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Descreva o motivo da reserva..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </Field>
          </FieldGroup>

          {/* Aviso de conflito */}
          {hasConflicts && recurrence === "none" && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-600">
                  Conflito detectado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  O horario solicitado conflita com uma reserva existente. 
                  Ao continuar, voce podera escolher como resolver o conflito.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {hasConflicts ? (
              <Button type="submit" variant="default" className="bg-amber-600 hover:bg-amber-700">
                <AlertTriangle className="size-4 mr-2" />
                Resolver {conflictDates.length} Conflito(s)
              </Button>
            ) : (
              <Button type="submit">
                {recurrence !== "none" && recurringDates.length > 1 ? (
                  <>
                    <Repeat className="size-4 mr-2" />
                    Criar {recurringDates.length} Agendamentos
                  </>
                ) : (
                  canCreateBookingForOthers ? "Criar Reserva" : "Enviar Solicitacao"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

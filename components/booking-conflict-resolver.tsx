"use client"

import * as React from "react"
import { format, addDays, addWeeks, addMonths, isBefore, isAfter, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRightLeft,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Repeat,
  SkipForward,
  Building2,
  Zap,
  Info,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  type Booking,
  type Room,
  type RecurrenceType,
  rooms,
} from "@/lib/booking-data"

// Tipos para o resolver de conflitos
export interface ConflictInfo {
  date: string
  conflictingBooking: Booking
  isRecurring: boolean
  conflictType: "same_room" | "user_overlap"
}

export interface ConflictResolution {
  date: string
  action: "skip" | "change_room" | "request_swap" | "override"
  newRoomId?: string
  swapMessage?: string
}

export interface ConflictGroup {
  conflictingUserId: string
  conflictingUserName: string
  isRecurring: boolean
  conflicts: ConflictInfo[]
  resolution?: "skip_all" | "change_room_all" | "request_swap" | "individual"
  newRoomId?: string
  swapMessage?: string
}

interface BookingConflictResolverProps {
  // Dados do novo agendamento
  roomId: string
  startDate: Date
  endDate?: Date
  startTime: string
  endTime: string
  recurrence: RecurrenceType
  recurrenceEndDate?: Date
  
  // Bookings existentes para checar conflitos
  existingBookings: Booking[]
  
  // Callbacks
  onResolve: (resolutions: ConflictResolution[], skippedDates: string[]) => void
  onCancel: () => void
  
  // Info do usuario atual
  currentUserId: string
}

// Funcao para gerar datas de ocorrencia baseado na recorrencia
function generateOccurrences(
  startDate: Date,
  recurrence: RecurrenceType,
  endDate?: Date
): Date[] {
  const dates: Date[] = [startDate]
  
  if (recurrence === "none" || !endDate) {
    return dates
  }
  
  let current = startDate
  const maxIterations = 365 // Limite de seguranca
  let iterations = 0
  
  while (isBefore(current, endDate) && iterations < maxIterations) {
    let next: Date
    
    switch (recurrence) {
      case "daily":
        next = addDays(current, 1)
        break
      case "weekly":
        next = addWeeks(current, 1)
        break
      case "monthly":
        next = addMonths(current, 1)
        break
      default:
        return dates
    }
    
    if (isAfter(next, endDate)) break
    
    dates.push(next)
    current = next
    iterations++
  }
  
  return dates
}

// Funcao para verificar se dois horarios se sobrepoem
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }
  
  const s1 = toMinutes(start1)
  const e1 = toMinutes(end1)
  const s2 = toMinutes(start2)
  const e2 = toMinutes(end2)
  
  return s1 < e2 && e1 > s2
}

// Funcao para encontrar salas alternativas disponiveis
function findAvailableRooms(
  date: string,
  startTime: string,
  endTime: string,
  excludeRoomId: string,
  existingBookings: Booking[],
  originalRoom: Room
): Room[] {
  const bookingsOnDate = existingBookings.filter(
    (b) => b.date === date && b.status !== "cancelada" && b.status !== "rejeitada"
  )
  
  return rooms.filter((room) => {
    // Excluir sala original
    if (room.id === excludeRoomId) return false
    
    // Sala deve estar ativa
    if (!room.isActive) return false
    
    // Verificar capacidade similar (+-20%)
    const minCapacity = originalRoom.capacity * 0.8
    if (room.capacity < minCapacity) return false
    
    // Verificar se nao ha conflito de horario
    const hasConflict = bookingsOnDate.some(
      (b) =>
        b.roomId === room.id &&
        timesOverlap(startTime, endTime, b.startTime, b.endTime)
    )
    
    return !hasConflict
  })
}

export function BookingConflictResolver({
  roomId,
  startDate,
  endDate,
  startTime,
  endTime,
  recurrence,
  recurrenceEndDate,
  existingBookings,
  onResolve,
  onCancel,
  currentUserId,
}: BookingConflictResolverProps) {
  const [conflictGroups, setConflictGroups] = React.useState<ConflictGroup[]>([])
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set())
  const [individualResolutions, setIndividualResolutions] = React.useState<Map<string, ConflictResolution>>(new Map())
  const [globalSwapMessage, setGlobalSwapMessage] = React.useState("")
  
  const selectedRoom = rooms.find((r) => r.id === roomId)
  
  // Detectar conflitos
  React.useEffect(() => {
    const occurrences = generateOccurrences(
      startDate,
      recurrence,
      recurrenceEndDate
    )
    
    const conflicts: ConflictInfo[] = []
    
    occurrences.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      
      existingBookings.forEach((booking) => {
        // Ignorar reservas do proprio usuario, canceladas ou rejeitadas
        if (
          booking.userId === currentUserId ||
          booking.status === "cancelada" ||
          booking.status === "rejeitada"
        ) {
          return
        }
        
        // Verificar se a reserva existente ocorre nessa data
        let bookingOccursOnDate = booking.date === dateStr
        
        // Se a reserva existente e recorrente, verificar as ocorrencias
        if (booking.recurrence !== "none" && booking.recurrenceEndDate) {
          const bookingOccurrences = generateOccurrences(
            new Date(booking.date),
            booking.recurrence,
            new Date(booking.recurrenceEndDate)
          )
          bookingOccursOnDate = bookingOccurrences.some(
            (d) => format(d, "yyyy-MM-dd") === dateStr
          )
        }
        
        if (!bookingOccursOnDate) return
        
        // Verificar se e na mesma sala e horario sobrepoe
        if (
          booking.roomId === roomId &&
          timesOverlap(startTime, endTime, booking.startTime, booking.endTime)
        ) {
          conflicts.push({
            date: dateStr,
            conflictingBooking: booking,
            isRecurring: booking.recurrence !== "none",
            conflictType: "same_room",
          })
        }
      })
    })
    
    // Agrupar conflitos por usuario
    const groupsMap = new Map<string, ConflictGroup>()
    
    conflicts.forEach((conflict) => {
      const key = conflict.conflictingBooking.userId
      
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          conflictingUserId: conflict.conflictingBooking.userId,
          conflictingUserName: conflict.conflictingBooking.userName,
          isRecurring: conflict.isRecurring,
          conflicts: [],
        })
      }
      
      const group = groupsMap.get(key)!
      group.conflicts.push(conflict)
      if (conflict.isRecurring) {
        group.isRecurring = true
      }
    })
    
    setConflictGroups(Array.from(groupsMap.values()))
    
    // Expandir todos os grupos por padrao
    setExpandedGroups(new Set(Array.from(groupsMap.keys())))
  }, [roomId, startDate, endDate, startTime, endTime, recurrence, recurrenceEndDate, existingBookings, currentUserId])
  
  const toggleGroup = (userId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }
  
  const setGroupResolution = (
    userId: string,
    resolution: ConflictGroup["resolution"],
    newRoomId?: string
  ) => {
    setConflictGroups((prev) =>
      prev.map((g) =>
        g.conflictingUserId === userId
          ? { ...g, resolution, newRoomId }
          : g
      )
    )
  }
  
  const setIndividualResolution = (
    date: string,
    resolution: ConflictResolution
  ) => {
    setIndividualResolutions((prev) => {
      const next = new Map(prev)
      next.set(date, resolution)
      return next
    })
  }
  
  const handleConfirm = () => {
    const resolutions: ConflictResolution[] = []
    const skippedDates: string[] = []
    
    conflictGroups.forEach((group) => {
      if (group.resolution === "skip_all") {
        group.conflicts.forEach((c) => {
          skippedDates.push(c.date)
          resolutions.push({
            date: c.date,
            action: "skip",
          })
        })
      } else if (group.resolution === "change_room_all" && group.newRoomId) {
        group.conflicts.forEach((c) => {
          resolutions.push({
            date: c.date,
            action: "change_room",
            newRoomId: group.newRoomId,
          })
        })
      } else if (group.resolution === "request_swap") {
        group.conflicts.forEach((c) => {
          resolutions.push({
            date: c.date,
            action: "request_swap",
            swapMessage: group.swapMessage || globalSwapMessage,
          })
        })
      } else if (group.resolution === "individual") {
        group.conflicts.forEach((c) => {
          const individual = individualResolutions.get(c.date)
          if (individual) {
            if (individual.action === "skip") {
              skippedDates.push(c.date)
            }
            resolutions.push(individual)
          }
        })
      }
    })
    
    onResolve(resolutions, skippedDates)
  }
  
  const totalConflicts = conflictGroups.reduce(
    (acc, g) => acc + g.conflicts.length,
    0
  )
  
  const allResolved = conflictGroups.every((g) => g.resolution)
  
  if (totalConflicts === 0) {
    return null
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {totalConflicts} conflito(s) detectado(s)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {recurrence !== "none"
              ? "Sua reserva recorrente conflita com agendamentos existentes em algumas datas. Escolha como resolver cada conflito."
              : "O horario solicitado conflita com uma reserva existente. Escolha como resolver."}
          </p>
        </div>
      </div>
      
      {/* Lista de conflitos agrupados */}
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-3 pr-4">
          {conflictGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.conflictingUserId)
            const availableRooms = selectedRoom
              ? findAvailableRooms(
                  group.conflicts[0].date,
                  startTime,
                  endTime,
                  roomId,
                  existingBookings,
                  selectedRoom
                )
              : []
            
            return (
              <div
                key={group.conflictingUserId}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                {/* Header do grupo */}
                <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.conflictingUserId)}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left">
                      {isExpanded ? (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      )}
                      <User className="size-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {group.conflictingUserName}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {group.conflicts.length} conflito(s)
                          </Badge>
                          {group.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              <Repeat className="size-3 mr-1" />
                              Recorrente
                            </Badge>
                          )}
                        </div>
                      </div>
                      {group.resolution && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            group.resolution === "skip_all" && "border-amber-500/50 text-amber-600",
                            group.resolution === "change_room_all" && "border-blue-500/50 text-blue-600",
                            group.resolution === "request_swap" && "border-purple-500/50 text-purple-600"
                          )}
                        >
                          <Check className="size-3 mr-1" />
                          Resolvido
                        </Badge>
                      )}
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="px-3 pb-3 pt-0 space-y-4">
                      {/* Detalhes dos conflitos */}
                      <div className="p-3 rounded-md bg-muted/50 space-y-2">
                        <div className="text-xs font-medium text-muted-foreground uppercase">
                          Datas com conflito
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.conflicts.slice(0, 10).map((conflict) => (
                            <TooltipProvider key={conflict.date}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs cursor-help">
                                    <Calendar className="size-3 mr-1" />
                                    {format(new Date(conflict.date), "dd/MM", { locale: ptBR })}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{conflict.conflictingBooking.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {conflict.conflictingBooking.startTime} - {conflict.conflictingBooking.endTime}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {group.conflicts.length > 10 && (
                            <Badge variant="secondary" className="text-xs">
                              +{group.conflicts.length - 10} mais
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                          <Clock className="size-3" />
                          <span>
                            {group.conflicts[0].conflictingBooking.startTime} - {group.conflicts[0].conflictingBooking.endTime}
                          </span>
                          <span className="mx-1">|</span>
                          <span>{group.conflicts[0].conflictingBooking.title}</span>
                        </div>
                      </div>
                      
                      {/* Opcoes de resolucao */}
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Como deseja resolver?</div>
                        
                        <RadioGroup
                          value={group.resolution || ""}
                          onValueChange={(v) => setGroupResolution(group.conflictingUserId, v as ConflictGroup["resolution"])}
                          className="space-y-2"
                        >
                          {/* Opcao 1: Pular datas */}
                          <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-muted/30 transition-colors">
                            <RadioGroupItem value="skip_all" id={`skip-${group.conflictingUserId}`} className="mt-0.5" />
                            <Label htmlFor={`skip-${group.conflictingUserId}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <SkipForward className="size-4 text-amber-500" />
                                <span className="font-medium">Pular essas datas</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Sua reserva nao sera criada nos dias com conflito. 
                                {group.conflicts.length > 1 && ` (${group.conflicts.length} datas serao ignoradas)`}
                              </p>
                            </Label>
                          </div>
                          
                          {/* Opcao 2: Trocar de sala */}
                          {availableRooms.length > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-muted/30 transition-colors">
                              <RadioGroupItem value="change_room_all" id={`room-${group.conflictingUserId}`} className="mt-0.5" />
                              <Label htmlFor={`room-${group.conflictingUserId}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Building2 className="size-4 text-blue-500" />
                                  <span className="font-medium">Usar sala alternativa</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Nos dias com conflito, sua reserva sera em outra sala.
                                </p>
                                {group.resolution === "change_room_all" && (
                                  <Select
                                    value={group.newRoomId || ""}
                                    onValueChange={(v) => setGroupResolution(group.conflictingUserId, "change_room_all", v)}
                                  >
                                    <SelectTrigger className="mt-2 h-8">
                                      <SelectValue placeholder="Selecione a sala alternativa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableRooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id}>
                                          <div className="flex items-center gap-2">
                                            <span>{room.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                              ({room.capacity} lugares)
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </Label>
                            </div>
                          )}
                          
                          {/* Opcao 3: Solicitar troca */}
                          <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-muted/30 transition-colors">
                            <RadioGroupItem value="request_swap" id={`swap-${group.conflictingUserId}`} className="mt-0.5" />
                            <Label htmlFor={`swap-${group.conflictingUserId}`} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2">
                                <ArrowRightLeft className="size-4 text-purple-500" />
                                <span className="font-medium">Solicitar troca de sala</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Enviar solicitacao para {group.conflictingUserName} trocar de sala nesses dias.
                                {group.isRecurring && " (A reserva dele tambem e recorrente)"}
                              </p>
                              {group.resolution === "request_swap" && (
                                <Textarea
                                  placeholder="Mensagem para o professor (opcional)..."
                                  className="mt-2 min-h-[60px] text-sm"
                                  value={group.swapMessage || ""}
                                  onChange={(e) => {
                                    setConflictGroups((prev) =>
                                      prev.map((g) =>
                                        g.conflictingUserId === group.conflictingUserId
                                          ? { ...g, swapMessage: e.target.value }
                                          : g
                                      )
                                    )
                                  }}
                                />
                              )}
                            </Label>
                          </div>
                          
                          {/* Opcao 4: Resolver individualmente */}
                          {group.conflicts.length > 1 && (
                            <div className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-muted/30 transition-colors">
                              <RadioGroupItem value="individual" id={`individual-${group.conflictingUserId}`} className="mt-0.5" />
                              <Label htmlFor={`individual-${group.conflictingUserId}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <Zap className="size-4 text-emerald-500" />
                                  <span className="font-medium">Resolver cada data individualmente</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Escolher uma solucao diferente para cada dia com conflito.
                                </p>
                              </Label>
                            </div>
                          )}
                        </RadioGroup>
                        
                        {/* Resolucao individual por data */}
                        {group.resolution === "individual" && (
                          <div className="mt-3 space-y-2 pl-4 border-l-2 border-border">
                            {group.conflicts.map((conflict) => {
                              const dateAvailableRooms = selectedRoom
                                ? findAvailableRooms(
                                    conflict.date,
                                    startTime,
                                    endTime,
                                    roomId,
                                    existingBookings,
                                    selectedRoom
                                  )
                                : []
                              const resolution = individualResolutions.get(conflict.date)
                              
                              return (
                                <div
                                  key={conflict.date}
                                  className="p-3 rounded-md bg-muted/30 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                      <Calendar className="size-4 text-muted-foreground" />
                                      {format(new Date(conflict.date), "EEEE, dd/MM", { locale: ptBR })}
                                    </div>
                                    {resolution && (
                                      <Badge variant="outline" className="text-xs">
                                        <Check className="size-3 mr-1" />
                                        {resolution.action === "skip" && "Pular"}
                                        {resolution.action === "change_room" && "Trocar sala"}
                                        {resolution.action === "request_swap" && "Solicitar"}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={resolution?.action === "skip" ? "default" : "outline"}
                                      className="h-7 text-xs"
                                      onClick={() => setIndividualResolution(conflict.date, {
                                        date: conflict.date,
                                        action: "skip",
                                      })}
                                    >
                                      <SkipForward className="size-3 mr-1" />
                                      Pular
                                    </Button>
                                    
                                    {dateAvailableRooms.length > 0 && (
                                      <Select
                                        value={resolution?.action === "change_room" ? resolution.newRoomId : ""}
                                        onValueChange={(v) => setIndividualResolution(conflict.date, {
                                          date: conflict.date,
                                          action: "change_room",
                                          newRoomId: v,
                                        })}
                                      >
                                        <SelectTrigger className="h-7 text-xs w-auto">
                                          <Building2 className="size-3 mr-1" />
                                          <SelectValue placeholder="Sala alternativa" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {dateAvailableRooms.map((room) => (
                                            <SelectItem key={room.id} value={room.id}>
                                              {room.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={resolution?.action === "request_swap" ? "default" : "outline"}
                                      className="h-7 text-xs"
                                      onClick={() => setIndividualResolution(conflict.date, {
                                        date: conflict.date,
                                        action: "request_swap",
                                      })}
                                    >
                                      <ArrowRightLeft className="size-3 mr-1" />
                                      Solicitar troca
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      
      {/* Info sobre conflitos recorrentes */}
      {conflictGroups.some((g) => g.isRecurring) && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-blue-500/10 border border-blue-500/30 text-sm">
          <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-blue-600">Conflito com reserva recorrente:</span>
            <span className="text-muted-foreground ml-1">
              Ao solicitar troca, o outro professor recebera uma notificacao e podera aceitar ou recusar a mudanca para os dias especificos.
            </span>
          </div>
        </div>
      )}
      
      {/* Acoes */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={!allResolved}
        >
          <Check className="size-4 mr-2" />
          Confirmar Resolucoes
        </Button>
      </div>
    </div>
  )
}

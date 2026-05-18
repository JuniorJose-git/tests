"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format, addDays, eachWeekOfInterval, parseISO, isSameDay, isWithinInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Plus,
  Save,
  Trash2,
  Calendar,
  Clock,
  User,
  Building2,
  Edit2,
  Copy,
  ChevronDown,
  Check,
  X,
  AlertCircle,
  Settings,
  GraduationCap,
  CalendarDays,
  Repeat,
  Play,
  Pause,
  MoreHorizontal,
  Filter,
  Search,
  ChevronRight,
  Layers,
  FileText,
  RefreshCw,
  Zap,
  AlertTriangle,
  Info,
  Link2,
  ExternalLink,
  Eye,
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { 
  rooms, 
  timeSlots, 
  getRoomTypeName, 
  bookingColors, 
  generateId,
  initialBookings,
  type Booking,
} from "@/lib/booking-data"

// ============================================================================
// TIPOS
// ============================================================================

interface AcademicYear {
  id: string
  year: number
  isActive: boolean
  semesterCount: number
  semesters: Semester[]
}

interface Semester {
  id: string
  yearId: string
  name: string
  number: number
  startDate: string
  endDate: string
  isActive: boolean
}

// Template de grade - define o padrao semanal
interface ScheduleTemplate {
  id: string
  roomId: string
  userId: string
  userName: string
  discipline: string
  dayOfWeek: number // 0=dom, 1=seg, ..., 6=sab
  startTime: string
  endTime: string
  semesterId: string
  isActive: boolean
  color: string
  notes?: string
  recurrenceId?: string // Se faz parte de um cronjob
}

// CronJob para gerar bookings em massa
interface RecurringSchedule {
  id: string
  name: string
  description?: string
  template: Omit<ScheduleTemplate, "id" | "semesterId" | "recurrenceId">
  frequency: "weekly" | "biweekly"
  semesterIds: string[]
  isActive: boolean
  createdAt: string
  generatedBookings: number
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface ConflictInfo {
  type: "override" | "conflict"
  date: string
  booking: Booking
  reason: string
}

// ============================================================================
// DADOS MOCK
// ============================================================================

const mockUsers: User[] = [
  { id: "1", name: "Prof. Carlos Silva", email: "carlos@edu.br", role: "professor" },
  { id: "2", name: "Prof. Ana Paula Santos", email: "ana@edu.br", role: "professor" },
  { id: "3", name: "Prof. Ricardo Oliveira", email: "ricardo@edu.br", role: "professor" },
  { id: "4", name: "Prof. Maria Fernandes", email: "maria@edu.br", role: "professor" },
  { id: "5", name: "Prof. Jose Lima", email: "jose@edu.br", role: "professor" },
  { id: "6", name: "Prof. Patricia Costa", email: "patricia@edu.br", role: "professor" },
]

const daysOfWeek = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Segunda-feira", short: "Seg" },
  { value: 2, label: "Terca-feira", short: "Ter" },
  { value: 3, label: "Quarta-feira", short: "Qua" },
  { value: 4, label: "Quinta-feira", short: "Qui" },
  { value: 5, label: "Sexta-feira", short: "Sex" },
  { value: 6, label: "Sabado", short: "Sab" },
]

const workDays = daysOfWeek.filter(d => d.value >= 1 && d.value <= 6)

const initialAcademicYears: AcademicYear[] = [
  {
    id: "2025",
    year: 2025,
    isActive: false,
    semesterCount: 2,
    semesters: [
      { id: "2025-1", yearId: "2025", name: "1o Semestre 2025", number: 1, startDate: "2025-02-10", endDate: "2025-06-30", isActive: false },
      { id: "2025-2", yearId: "2025", name: "2o Semestre 2025", number: 2, startDate: "2025-08-04", endDate: "2025-12-15", isActive: false },
    ],
  },
  {
    id: "2026",
    year: 2026,
    isActive: true,
    semesterCount: 2,
    semesters: [
      { id: "2026-1", yearId: "2026", name: "1o Semestre 2026", number: 1, startDate: "2026-02-09", endDate: "2026-06-30", isActive: true },
      { id: "2026-2", yearId: "2026", name: "2o Semestre 2026", number: 2, startDate: "2026-08-03", endDate: "2026-12-15", isActive: false },
    ],
  },
  {
    id: "2027",
    year: 2027,
    isActive: false,
    semesterCount: 2,
    semesters: [
      { id: "2027-1", yearId: "2027", name: "1o Semestre 2027", number: 1, startDate: "2027-02-08", endDate: "2027-06-30", isActive: false },
      { id: "2027-2", yearId: "2027", name: "2o Semestre 2027", number: 2, startDate: "2027-08-02", endDate: "2027-12-15", isActive: false },
    ],
  },
]

// Templates iniciais - representam a grade padrao
const initialTemplates: ScheduleTemplate[] = [
  {
    id: "t1",
    roomId: "a-101",
    userId: "1",
    userName: "Prof. Carlos Silva",
    discipline: "Engenharia de Software I",
    dayOfWeek: 1,
    startTime: "07:00",
    endTime: "08:40",
    semesterId: "2026-1",
    isActive: true,
    color: bookingColors[0],
  },
  {
    id: "t2",
    roomId: "a-101",
    userId: "2",
    userName: "Prof. Ana Paula Santos",
    discipline: "Banco de Dados II",
    dayOfWeek: 1,
    startTime: "08:55",
    endTime: "10:35",
    semesterId: "2026-1",
    isActive: true,
    color: bookingColors[1],
  },
  {
    id: "t3",
    roomId: "b-101",
    userId: "1",
    userName: "Prof. Carlos Silva",
    discipline: "Laboratorio de Programacao",
    dayOfWeek: 2,
    startTime: "10:50",
    endTime: "12:30",
    semesterId: "2026-1",
    isActive: true,
    color: bookingColors[0],
  },
  {
    id: "t4",
    roomId: "a-102",
    userId: "3",
    userName: "Prof. Ricardo Oliveira",
    discipline: "Calculo III",
    dayOfWeek: 3,
    startTime: "07:00",
    endTime: "08:40",
    semesterId: "2026-1",
    isActive: true,
    color: bookingColors[2],
  },
]

const initialRecurringSchedules: RecurringSchedule[] = [
  {
    id: "rec-1",
    name: "Aulas de Engenharia de Software",
    description: "Reserva automatica semanal para todas as aulas de ES no semestre",
    template: {
      roomId: "a-101",
      userId: "1",
      userName: "Prof. Carlos Silva",
      discipline: "Engenharia de Software I",
      dayOfWeek: 1,
      startTime: "07:00",
      endTime: "08:40",
      isActive: true,
      color: bookingColors[0],
    },
    frequency: "weekly",
    semesterIds: ["2026-1", "2026-2"],
    isActive: true,
    createdAt: "2026-01-15T10:00:00Z",
    generatedBookings: 18,
  },
]

// ============================================================================
// HELPERS
// ============================================================================

function getSemesterTypeName(count: number): string {
  switch (count) {
    case 1: return "Anual"
    case 2: return "Semestral"
    case 3: return "Trimestral"
    case 4: return "Bimestral"
    default: return `${count} periodos`
  }
}

function generateSemesters(yearId: string, year: number, count: number): Semester[] {
  const semesters: Semester[] = []
  const monthsPerSemester = Math.floor(10 / count)
  
  for (let i = 1; i <= count; i++) {
    const startMonth = 2 + (i - 1) * monthsPerSemester
    const endMonth = Math.min(startMonth + monthsPerSemester - 1, 12)
    
    let periodName = ""
    switch (count) {
      case 1: periodName = `Ano Letivo ${year}`; break
      case 2: periodName = `${i}o Semestre ${year}`; break
      case 3: periodName = `${i}o Trimestre ${year}`; break
      case 4: periodName = `${i}o Bimestre ${year}`; break
      default: periodName = `${i}o Periodo ${year}`
    }
    
    semesters.push({
      id: `${yearId}-${i}`,
      yearId,
      name: periodName,
      number: i,
      startDate: `${year}-${String(startMonth).padStart(2, "0")}-01`,
      endDate: `${year}-${String(endMonth).padStart(2, "0")}-28`,
      isActive: i === 1 && year === 2026,
    })
  }
  
  return semesters
}

function getFrequencyLabel(freq: string): string {
  switch (freq) {
    case "weekly": return "Semanal"
    case "biweekly": return "Quinzenal"
    default: return freq
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function MontarGradePage() {
  const router = useRouter()
  const { user, canApprove, canManageUsers } = useAuth()
  const [mounted, setMounted] = React.useState(false)
  
  // Dados compartilhados com /grade
  const [bookings, setBookings] = React.useState<Booking[]>(initialBookings)
  
  // Dados locais de montar grade
  const [academicYears, setAcademicYears] = React.useState<AcademicYear[]>(initialAcademicYears)
  const [templates, setTemplates] = React.useState<ScheduleTemplate[]>(initialTemplates)
  const [recurringSchedules, setRecurringSchedules] = React.useState<RecurringSchedule[]>(initialRecurringSchedules)
  
  // Filtros
  const [selectedYearId, setSelectedYearId] = React.useState("2026")
  const [selectedSemesterId, setSelectedSemesterId] = React.useState("2026-1")
  const [selectedRoom, setSelectedRoom] = React.useState<string>("all")
  const [searchTerm, setSearchTerm] = React.useState("")
  
  // UI State
  const [activeTab, setActiveTab] = React.useState<"grid" | "list" | "recurring" | "conflicts">("grid")
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState<ScheduleTemplate | null>(null)
  const [yearSettingsOpen, setYearSettingsOpen] = React.useState(false)
  const [recurringDialogOpen, setRecurringDialogOpen] = React.useState(false)
  const [editingRecurring, setEditingRecurring] = React.useState<RecurringSchedule | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<{ type: "template" | "recurring" | "year", id: string } | null>(null)
  const [generateDialogOpen, setGenerateDialogOpen] = React.useState(false)
  const [conflictPreviewOpen, setConflictPreviewOpen] = React.useState(false)
  const [selectedConflicts, setSelectedConflicts] = React.useState<ConflictInfo[]>([])
  
  // Form state - Template
  const [formRoom, setFormRoom] = React.useState("")
  const [formUser, setFormUser] = React.useState("")
  const [formDiscipline, setFormDiscipline] = React.useState("")
  const [formDay, setFormDay] = React.useState<number>(1)
  const [formStartTime, setFormStartTime] = React.useState("")
  const [formEndTime, setFormEndTime] = React.useState("")
  const [formNotes, setFormNotes] = React.useState("")
  const [formIsActive, setFormIsActive] = React.useState(true)
  
  // Form state - Ano Academico
  const [newYearValue, setNewYearValue] = React.useState("")
  const [newYearSemesterCount, setNewYearSemesterCount] = React.useState(2)
  
  // Form state - Recurring
  const [recName, setRecName] = React.useState("")
  const [recDescription, setRecDescription] = React.useState("")
  const [recFrequency, setRecFrequency] = React.useState<"weekly" | "biweekly">("weekly")
  const [recDays, setRecDays] = React.useState<number[]>([1])
  const [recRoom, setRecRoom] = React.useState("")
  const [recUser, setRecUser] = React.useState("")
  const [recDiscipline, setRecDiscipline] = React.useState("")
  const [recStartTime, setRecStartTime] = React.useState("")
  const [recEndTime, setRecEndTime] = React.useState("")
  const [recSemesters, setRecSemesters] = React.useState<string[]>([])
  
  // Derived state
  const selectedYear = academicYears.find(y => y.id === selectedYearId)
  const selectedSemester = selectedYear?.semesters.find(s => s.id === selectedSemesterId)
  
  // Filtra templates pelo semestre selecionado
  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => {
      if (t.semesterId !== selectedSemesterId) return false
      if (selectedRoom !== "all" && t.roomId !== selectedRoom) return false
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        if (!t.discipline.toLowerCase().includes(search) && 
            !t.userName.toLowerCase().includes(search)) {
          return false
        }
      }
      return true
    })
  }, [templates, selectedSemesterId, selectedRoom, searchTerm])
  
  // Encontra conflitos entre templates e bookings existentes
  const conflicts = React.useMemo(() => {
    if (!selectedSemester) return []
    
    const conflictList: ConflictInfo[] = []
    const semesterStart = parseISO(selectedSemester.startDate)
    const semesterEnd = parseISO(selectedSemester.endDate)
    
    // Para cada template, verifica se ha bookings que conflitam
    filteredTemplates.forEach(template => {
      // Pega todas as datas do semestre que caem no dia da semana do template
      const weeks = eachWeekOfInterval({ start: semesterStart, end: semesterEnd }, { weekStartsOn: 0 })
      
      weeks.forEach(weekStart => {
        const targetDate = addDays(weekStart, template.dayOfWeek)
        
        if (!isWithinInterval(targetDate, { start: semesterStart, end: semesterEnd })) return
        
        const dateStr = format(targetDate, "yyyy-MM-dd")
        
        // Verifica se ha booking nesse dia/sala/horario
        const conflictingBooking = bookings.find(b => {
          if (b.date !== dateStr) return false
          if (b.roomId !== template.roomId) return false
          // Verifica sobreposicao de horario
          const bStart = b.startTime
          const bEnd = b.endTime
          const tStart = template.startTime
          const tEnd = template.endTime
          
          return (tStart < bEnd && tEnd > bStart)
        })
        
        if (conflictingBooking) {
          // Verifica se e uma excecao (mesmo professor, mesma disciplina = alteracao aprovada)
          // ou um conflito real (outro professor/disciplina)
          const isException = conflictingBooking.userId === template.userId && 
                             conflictingBooking.title === template.discipline
          
          conflictList.push({
            type: isException ? "override" : "conflict",
            date: dateStr,
            booking: conflictingBooking,
            reason: isException 
              ? "Alteracao pontual aprovada" 
              : `Conflito com: ${conflictingBooking.title} - ${conflictingBooking.userName}`,
          })
        }
      })
    })
    
    return conflictList
  }, [filteredTemplates, bookings, selectedSemester])
  
  const realConflicts = conflicts.filter(c => c.type === "conflict")
  const overrides = conflicts.filter(c => c.type === "override")
  
  // Effects
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  React.useEffect(() => {
    if (!mounted) return
    if (!user || (!canApprove && !canManageUsers)) {
      router.push("/")
    }
  }, [user, canApprove, canManageUsers, router, mounted])
  
  React.useEffect(() => {
    const year = academicYears.find(y => y.id === selectedYearId)
    if (year && year.semesters.length > 0) {
      const activeSemester = year.semesters.find(s => s.isActive) || year.semesters[0]
      setSelectedSemesterId(activeSemester.id)
    }
  }, [selectedYearId, academicYears])
  
  // ============================================================================
  // HANDLERS - Template
  // ============================================================================
  
  const openNewTemplateDialog = (day?: number, time?: string) => {
    setEditingTemplate(null)
    setFormRoom("")
    setFormUser("")
    setFormDiscipline("")
    setFormDay(day ?? 1)
    setFormStartTime(time ?? "07:00")
    setFormEndTime(time ?? "08:40")
    setFormNotes("")
    setFormIsActive(true)
    setTemplateDialogOpen(true)
  }
  
  const openEditTemplateDialog = (template: ScheduleTemplate) => {
    setEditingTemplate(template)
    setFormRoom(template.roomId)
    setFormUser(template.userId)
    setFormDiscipline(template.discipline)
    setFormDay(template.dayOfWeek)
    setFormStartTime(template.startTime)
    setFormEndTime(template.endTime)
    setFormNotes(template.notes || "")
    setFormIsActive(template.isActive)
    setTemplateDialogOpen(true)
  }
  
  const handleSaveTemplate = () => {
    const selectedUser = mockUsers.find((u) => u.id === formUser)
    if (!selectedUser || !formRoom || !formDiscipline) return
    
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                roomId: formRoom,
                userId: formUser,
                userName: selectedUser.name,
                discipline: formDiscipline,
                dayOfWeek: formDay,
                startTime: formStartTime,
                endTime: formEndTime,
                notes: formNotes,
                isActive: formIsActive,
              }
            : t
        )
      )
    } else {
      const newTemplate: ScheduleTemplate = {
        id: generateId(),
        roomId: formRoom,
        userId: formUser,
        userName: selectedUser.name,
        discipline: formDiscipline,
        dayOfWeek: formDay,
        startTime: formStartTime,
        endTime: formEndTime,
        semesterId: selectedSemesterId,
        isActive: formIsActive,
        color: bookingColors[templates.length % bookingColors.length],
        notes: formNotes,
      }
      setTemplates((prev) => [...prev, newTemplate])
    }
    setTemplateDialogOpen(false)
  }
  
  const handleDuplicateTemplate = (template: ScheduleTemplate) => {
    const nextDay = template.dayOfWeek === 6 ? 1 : template.dayOfWeek + 1
    const newTemplate: ScheduleTemplate = {
      ...template,
      id: generateId(),
      dayOfWeek: nextDay,
    }
    setTemplates((prev) => [...prev, newTemplate])
  }
  
  const toggleTemplateActive = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    )
  }
  
  // ============================================================================
  // HANDLERS - Ano Academico
  // ============================================================================
  
  const handleAddYear = () => {
    const year = parseInt(newYearValue)
    if (isNaN(year) || year < 2020 || year > 2050) return
    if (academicYears.find(y => y.year === year)) return
    
    const newYear: AcademicYear = {
      id: String(year),
      year,
      isActive: false,
      semesterCount: newYearSemesterCount,
      semesters: generateSemesters(String(year), year, newYearSemesterCount),
    }
    
    setAcademicYears(prev => [...prev, newYear].sort((a, b) => a.year - b.year))
    setNewYearValue("")
  }
  
  const handleUpdateYearSemesterCount = (yearId: string, count: number) => {
    setAcademicYears(prev => prev.map(y => {
      if (y.id !== yearId) return y
      return {
        ...y,
        semesterCount: count,
        semesters: generateSemesters(yearId, y.year, count),
      }
    }))
  }
  
  const handleSetActiveYear = (yearId: string) => {
    setAcademicYears(prev => prev.map(y => ({
      ...y,
      isActive: y.id === yearId,
    })))
  }
  
  // ============================================================================
  // HANDLERS - Recurring Schedule
  // ============================================================================
  
  const openNewRecurringDialog = () => {
    setEditingRecurring(null)
    setRecName("")
    setRecDescription("")
    setRecFrequency("weekly")
    setRecDays([1])
    setRecRoom("")
    setRecUser("")
    setRecDiscipline("")
    setRecStartTime("07:00")
    setRecEndTime("08:40")
    setRecSemesters([selectedSemesterId])
    setRecurringDialogOpen(true)
  }
  
  const openEditRecurringDialog = (rec: RecurringSchedule) => {
    setEditingRecurring(rec)
    setRecName(rec.name)
    setRecDescription(rec.description || "")
    setRecFrequency(rec.frequency)
    setRecDays([rec.template.dayOfWeek])
    setRecRoom(rec.template.roomId)
    setRecUser(rec.template.userId)
    setRecDiscipline(rec.template.discipline)
    setRecStartTime(rec.template.startTime)
    setRecEndTime(rec.template.endTime)
    setRecSemesters(rec.semesterIds)
    setRecurringDialogOpen(true)
  }
  
  const handleSaveRecurring = () => {
    const selectedUser = mockUsers.find(u => u.id === recUser)
    if (!selectedUser || !recName || !recRoom || recDays.length === 0) return
    
    if (editingRecurring) {
      setRecurringSchedules(prev => prev.map(r => 
        r.id === editingRecurring.id
          ? { 
              ...r, 
              name: recName, 
              description: recDescription,
              frequency: recFrequency,
              template: {
                ...r.template,
                roomId: recRoom,
                userId: recUser,
                userName: selectedUser.name,
                discipline: recDiscipline,
                dayOfWeek: recDays[0],
                startTime: recStartTime,
                endTime: recEndTime,
              },
              semesterIds: recSemesters,
            }
          : r
      ))
    } else {
      const newRecurring: RecurringSchedule = {
        id: generateId(),
        name: recName,
        description: recDescription,
        template: {
          roomId: recRoom,
          userId: recUser,
          userName: selectedUser.name,
          discipline: recDiscipline,
          dayOfWeek: recDays[0],
          startTime: recStartTime,
          endTime: recEndTime,
          isActive: true,
          color: bookingColors[recurringSchedules.length % bookingColors.length],
        },
        frequency: recFrequency,
        semesterIds: recSemesters,
        isActive: true,
        createdAt: new Date().toISOString(),
        generatedBookings: 0,
      }
      setRecurringSchedules(prev => [...prev, newRecurring])
    }
    setRecurringDialogOpen(false)
  }
  
  const toggleRecurringActive = (id: string) => {
    setRecurringSchedules(prev => prev.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ))
  }
  
  // Gera bookings a partir de um template para todo o semestre
  const generateBookingsFromTemplate = (template: ScheduleTemplate, skipConflicts: boolean = true) => {
    if (!selectedSemester) return { generated: 0, skipped: 0 }
    
    const semesterStart = parseISO(selectedSemester.startDate)
    const semesterEnd = parseISO(selectedSemester.endDate)
    const weeks = eachWeekOfInterval({ start: semesterStart, end: semesterEnd }, { weekStartsOn: 0 })
    
    const newBookings: Booking[] = []
    let skipped = 0
    
    weeks.forEach(weekStart => {
      const targetDate = addDays(weekStart, template.dayOfWeek)
      
      if (!isWithinInterval(targetDate, { start: semesterStart, end: semesterEnd })) return
      
      const dateStr = format(targetDate, "yyyy-MM-dd")
      
      // Verifica se ja existe booking nesse dia/sala/horario
      const existingBooking = bookings.find(b => {
        if (b.date !== dateStr) return false
        if (b.roomId !== template.roomId) return false
        return (template.startTime < b.endTime && template.endTime > b.startTime)
      })
      
      if (existingBooking) {
        if (skipConflicts) {
          skipped++
          return
        }
      }
      
      // Verifica se ja foi gerado antes
      const alreadyGenerated = bookings.find(b => 
        b.date === dateStr && 
        b.roomId === template.roomId && 
        b.startTime === template.startTime &&
        b.userId === template.userId
      )
      
      if (alreadyGenerated) return
      
      newBookings.push({
        id: generateId(),
        roomId: template.roomId,
        userId: template.userId,
        userName: template.userName,
        userEmail: `${template.userId}@edu.br`,
        title: template.discipline,
        description: `Aula regular - ${template.discipline}`,
        date: dateStr,
        startTime: template.startTime,
        endTime: template.endTime,
        status: "aprovada",
        participants: 30,
        recurrence: "weekly",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: template.color,
      })
    })
    
    if (newBookings.length > 0) {
      setBookings(prev => [...prev, ...newBookings])
    }
    
    return { generated: newBookings.length, skipped }
  }
  
  const generateAllBookings = () => {
    let totalGenerated = 0
    let totalSkipped = 0
    
    filteredTemplates.filter(t => t.isActive).forEach(template => {
      const result = generateBookingsFromTemplate(template, true)
      totalGenerated += result.generated
      totalSkipped += result.skipped
    })
    
    setGenerateDialogOpen(false)
    alert(`Gerados ${totalGenerated} agendamentos. ${totalSkipped} ignorados por conflito.`)
  }
  
  // ============================================================================
  // HANDLERS - Delete
  // ============================================================================
  
  const confirmDelete = () => {
    if (!itemToDelete) return
    
    if (itemToDelete.type === "template") {
      setTemplates(prev => prev.filter(t => t.id !== itemToDelete.id))
    } else if (itemToDelete.type === "recurring") {
      setRecurringSchedules(prev => prev.filter(r => r.id !== itemToDelete.id))
    } else if (itemToDelete.type === "year") {
      const year = academicYears.find(y => y.id === itemToDelete.id)
      if (year) {
        const semesterIds = year.semesters.map(s => s.id)
        setTemplates(prev => prev.filter(t => !semesterIds.includes(t.semesterId)))
      }
      setAcademicYears(prev => prev.filter(y => y.id !== itemToDelete.id))
    }
    
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }
  
  // ============================================================================
  // HELPERS
  // ============================================================================
  
  const getTimeSlotFromTime = (time: string) => {
    return timeSlots.find(s => s.startTime === time)
  }
  
  const checkTemplateConflict = (template: ScheduleTemplate): boolean => {
    return templates.some((t) => {
      if (t.id === template.id) return false
      if (t.semesterId !== template.semesterId) return false
      if (t.roomId !== template.roomId) return false
      if (t.dayOfWeek !== template.dayOfWeek) return false
      
      return (template.startTime < t.endTime && template.endTime > t.startTime)
    })
  }
  
  const toggleRecDay = (day: number) => {
    setRecDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    )
  }
  
  const toggleRecSemester = (semesterId: string) => {
    setRecSemesters(prev => 
      prev.includes(semesterId) 
        ? prev.filter(s => s !== semesterId)
        : [...prev, semesterId]
    )
  }
  
  if (!mounted) {
    return null
  }
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Montar Grade de Horarios</h1>
              <p className="text-sm text-muted-foreground">
                Defina a grade padrao e gere agendamentos em massa para o semestre
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Indicador de conflitos */}
              {realConflicts.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive border-destructive/50"
                        onClick={() => setActiveTab("conflicts")}
                      >
                        <AlertTriangle className="size-4 mr-2" />
                        {realConflicts.length} conflito(s)
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Existem conflitos entre a grade e agendamentos existentes
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {overrides.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="gap-1">
                        <Info className="size-3" />
                        {overrides.length} excecao(oes)
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Alteracoes pontuais aprovadas que diferem da grade
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <Button variant="outline" size="sm" onClick={() => setYearSettingsOpen(true)}>
                <Settings className="size-4 mr-2" />
                Anos Academicos
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setGenerateDialogOpen(true)}
                disabled={filteredTemplates.filter(t => t.isActive).length === 0}
              >
                <Zap className="size-4 mr-2" />
                Gerar Agendamentos
              </Button>
              
              <Button onClick={() => openNewTemplateDialog()}>
                <Plus className="mr-2 size-4" />
                Nova Alocacao
              </Button>
            </div>
          </div>
        </header>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-4 p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Ano:</Label>
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      <div className="flex items-center gap-2">
                        {year.year}
                        {year.isActive && (
                          <Badge variant="secondary" className="text-[10px] px-1">Atual</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Periodo:</Label>
              <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedYear?.semesters.map((sem) => (
                    <SelectItem key={sem.id} value={sem.id}>
                      <div className="flex items-center gap-2">
                        {sem.name}
                        {sem.isActive && (
                          <Badge variant="secondary" className="text-[10px] px-1">Ativo</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Sala:</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas as salas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as salas</SelectItem>
                  {rooms.slice(0, 30).map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar disciplina ou professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline">{filteredTemplates.length} alocacoes</Badge>
              <Button variant="ghost" size="sm" asChild>
                <a href="/grade" className="gap-2">
                  <Link2 className="size-4" />
                  Ver Grade de Horarios
                </a>
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1 flex flex-col">
            <div className="border-b px-4">
              <TabsList className="h-10">
                <TabsTrigger value="grid" className="gap-2">
                  <Layers className="size-4" />
                  Grade Visual
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <FileText className="size-4" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="recurring" className="gap-2">
                  <Repeat className="size-4" />
                  Recorrentes
                </TabsTrigger>
                <TabsTrigger value="conflicts" className="gap-2">
                  <AlertTriangle className="size-4" />
                  Conflitos
                  {realConflicts.length > 0 && (
                    <Badge variant="destructive" className="ml-1 text-[10px] px-1.5">
                      {realConflicts.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Tab: Grade Visual */}
            <TabsContent value="grid" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[1000px]">
                      <thead>
                        <tr>
                          <th className="sticky left-0 z-10 bg-card min-w-[150px] px-3 py-2 text-left text-sm font-medium border-b border-r">
                            Horario
                          </th>
                          {workDays.map((day) => (
                            <th
                              key={day.value}
                              className="min-w-[180px] px-3 py-2 text-center text-sm font-medium border-b"
                            >
                              {day.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.slice(0, 12).map((slot) => (
                          <tr key={slot.id}>
                            <td className="sticky left-0 z-10 bg-card px-3 py-1 text-xs border-b border-r">
                              <div className="font-medium">{slot.label}</div>
                              <div className="text-muted-foreground">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            </td>
                            {workDays.map((day) => {
                              // Encontra templates que cobrem este slot
                              const dayTemplates = filteredTemplates.filter(
                                (t) =>
                                  t.dayOfWeek === day.value &&
                                  t.startTime <= slot.startTime &&
                                  t.endTime > slot.startTime
                              )
                              
                              if (dayTemplates.length === 0) {
                                return (
                                  <td
                                    key={`${slot.id}-${day.value}`}
                                    className="min-w-[180px] px-1 py-1 border-b hover:bg-muted/50 cursor-pointer"
                                    onClick={() => openNewTemplateDialog(day.value, slot.startTime)}
                                  >
                                    <div className="h-12 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                      <Plus className="size-4 text-muted-foreground" />
                                    </div>
                                  </td>
                                )
                              }
                              
                              const template = dayTemplates[0]
                              const isStartSlot = template.startTime === slot.startTime
                              
                              if (!isStartSlot) return null
                              
                              // Calcula quantos slots este template ocupa
                              const startIdx = timeSlots.findIndex(s => s.startTime === template.startTime)
                              const endIdx = timeSlots.findIndex(s => s.endTime === template.endTime)
                              const rowSpan = endIdx - startIdx + 1
                              
                              const room = rooms.find(r => r.id === template.roomId)
                              const hasConflict = checkTemplateConflict(template)
                              
                              // Verifica conflitos com bookings existentes
                              const bookingConflicts = conflicts.filter(c => 
                                c.booking.roomId === template.roomId &&
                                (c.booking.startTime < template.endTime && c.booking.endTime > template.startTime)
                              )
                              const hasBookingConflict = bookingConflicts.some(c => c.type === "conflict")
                              const hasOverride = bookingConflicts.some(c => c.type === "override")
                              
                              return (
                                <td
                                  key={`${slot.id}-${day.value}`}
                                  rowSpan={rowSpan > 0 ? rowSpan : 1}
                                  className="min-w-[180px] px-1 py-1 border-b align-top"
                                >
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={cn(
                                            "h-full min-h-[48px] rounded-md p-2 cursor-pointer transition-all hover:shadow-md border relative",
                                            !template.isActive && "opacity-50",
                                            hasConflict && "ring-2 ring-destructive",
                                            hasBookingConflict && "ring-2 ring-orange-500"
                                          )}
                                          style={{
                                            backgroundColor: `${template.color}15`,
                                            borderColor: `${template.color}40`,
                                            minHeight: rowSpan > 0 ? `${rowSpan * 52}px` : "48px",
                                          }}
                                          onClick={() => openEditTemplateDialog(template)}
                                        >
                                          <div
                                            className="text-xs font-semibold truncate"
                                            style={{ color: template.color }}
                                          >
                                            {template.discipline}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground mt-1 truncate">
                                            {template.userName}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground truncate">
                                            {room?.name}
                                          </div>
                                          
                                          {/* Indicadores */}
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {template.recurrenceId && (
                                              <Badge variant="outline" className="text-[9px] px-1 py-0">
                                                <Repeat className="size-2 mr-0.5" />
                                                Auto
                                              </Badge>
                                            )}
                                            {hasConflict && (
                                              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                                                <AlertCircle className="size-2 mr-0.5" />
                                                Conflito
                                              </Badge>
                                            )}
                                            {hasBookingConflict && (
                                              <Badge className="text-[9px] px-1 py-0 bg-orange-500">
                                                <AlertTriangle className="size-2 mr-0.5" />
                                                Ocupado
                                              </Badge>
                                            )}
                                            {hasOverride && !hasBookingConflict && (
                                              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                                <Info className="size-2 mr-0.5" />
                                                Excecao
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" className="max-w-xs">
                                        <div className="space-y-1">
                                          <div className="font-medium">{template.discipline}</div>
                                          <div className="text-xs">{template.userName}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {template.startTime} - {template.endTime}
                                          </div>
                                          {bookingConflicts.length > 0 && (
                                            <div className="pt-2 border-t mt-2">
                                              <div className="text-xs font-medium text-orange-600">
                                                {bookingConflicts.length} dia(s) com alteracoes:
                                              </div>
                                              {bookingConflicts.slice(0, 3).map((c, i) => (
                                                <div key={i} className="text-xs text-muted-foreground">
                                                  {format(parseISO(c.date), "dd/MM")} - {c.reason}
                                                </div>
                                              ))}
                                              {bookingConflicts.length > 3 && (
                                                <div className="text-xs text-muted-foreground">
                                                  +{bookingConflicts.length - 3} mais...
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Legenda */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                      <span>Alocacao normal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        <Info className="size-2 mr-0.5" />
                        Excecao
                      </Badge>
                      <span>Dia com alteracao aprovada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[9px] px-1 py-0 bg-orange-500">
                        <AlertTriangle className="size-2 mr-0.5" />
                        Ocupado
                      </Badge>
                      <span>Conflito com outro agendamento</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Tab: Lista */}
            <TabsContent value="list" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Alocacoes do Periodo</CardTitle>
                      <CardDescription>
                        {selectedSemester?.name} - {filteredTemplates.length} alocacoes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Ativo</TableHead>
                            <TableHead>Disciplina</TableHead>
                            <TableHead>Professor</TableHead>
                            <TableHead>Sala</TableHead>
                            <TableHead>Dia</TableHead>
                            <TableHead>Horario</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[100px]">Acoes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTemplates.map((template) => {
                            const room = rooms.find(r => r.id === template.roomId)
                            const day = workDays.find(d => d.value === template.dayOfWeek)
                            const hasConflict = checkTemplateConflict(template)
                            const bookingConflicts = conflicts.filter(c => 
                              c.booking.roomId === template.roomId &&
                              (c.booking.startTime < template.endTime && c.booking.endTime > template.startTime)
                            )
                            
                            return (
                              <TableRow key={template.id}>
                                <TableCell>
                                  <Switch
                                    checked={template.isActive}
                                    onCheckedChange={() => toggleTemplateActive(template.id)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="size-3 rounded-full" 
                                      style={{ backgroundColor: template.color }}
                                    />
                                    <span className="font-medium">{template.discipline}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{template.userName}</TableCell>
                                <TableCell>{room?.name}</TableCell>
                                <TableCell>{day?.label}</TableCell>
                                <TableCell>{template.startTime} - {template.endTime}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {hasConflict && (
                                      <Badge variant="destructive" className="text-[10px]">
                                        Conflito grade
                                      </Badge>
                                    )}
                                    {bookingConflicts.filter(c => c.type === "conflict").length > 0 && (
                                      <Badge className="text-[10px] bg-orange-500">
                                        {bookingConflicts.filter(c => c.type === "conflict").length} ocupado(s)
                                      </Badge>
                                    )}
                                    {bookingConflicts.filter(c => c.type === "override").length > 0 && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        {bookingConflicts.filter(c => c.type === "override").length} excecao(oes)
                                      </Badge>
                                    )}
                                    {!hasConflict && bookingConflicts.length === 0 && (
                                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/50">
                                        OK
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditTemplateDialog(template)}>
                                        <Edit2 className="size-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                                        <Copy className="size-4 mr-2" />
                                        Duplicar
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => {
                                          setItemToDelete({ type: "template", id: template.id })
                                          setDeleteConfirmOpen(true)
                                        }}
                                      >
                                        <Trash2 className="size-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {filteredTemplates.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                Nenhuma alocacao encontrada para este periodo.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Tab: Recurring */}
            <TabsContent value="recurring" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Agendamentos Recorrentes</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure padroes de reserva que geram agendamentos automaticamente
                      </p>
                    </div>
                    <Button onClick={openNewRecurringDialog}>
                      <Plus className="size-4 mr-2" />
                      Novo Recorrente
                    </Button>
                  </div>
                  
                  {recurringSchedules.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Repeat className="size-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-muted-foreground">Nenhum agendamento recorrente configurado</p>
                        <Button variant="outline" className="mt-4" onClick={openNewRecurringDialog}>
                          <Plus className="size-4 mr-2" />
                          Criar primeiro
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {recurringSchedules.map((rec) => {
                        const room = rooms.find(r => r.id === rec.template.roomId)
                        const day = workDays.find(d => d.value === rec.template.dayOfWeek)
                        
                        return (
                          <Card key={rec.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div 
                                    className="size-10 rounded-lg flex items-center justify-center mt-0.5"
                                    style={{ backgroundColor: `${rec.template.color}20` }}
                                  >
                                    <Repeat className="size-5" style={{ color: rec.template.color }} />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      {rec.name}
                                      {rec.isActive ? (
                                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/50">
                                          Ativo
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary">Pausado</Badge>
                                      )}
                                    </CardTitle>
                                    {rec.description && (
                                      <CardDescription>{rec.description}</CardDescription>
                                    )}
                                  </div>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditRecurringDialog(rec)}>
                                      <Edit2 className="size-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toggleRecurringActive(rec.id)}>
                                      {rec.isActive ? (
                                        <>
                                          <Pause className="size-4 mr-2" />
                                          Pausar
                                        </>
                                      ) : (
                                        <>
                                          <Play className="size-4 mr-2" />
                                          Ativar
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => {
                                        setItemToDelete({ type: "recurring", id: rec.id })
                                        setDeleteConfirmOpen(true)
                                      }}
                                    >
                                      <Trash2 className="size-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground text-xs">Disciplina</div>
                                  <div className="font-medium">{rec.template.discipline}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Professor</div>
                                  <div className="font-medium">{rec.template.userName}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Sala</div>
                                  <div className="font-medium">{room?.name}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Frequencia</div>
                                  <div className="font-medium">{getFrequencyLabel(rec.frequency)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Dia</div>
                                  <div className="font-medium">{day?.label}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Horario</div>
                                  <div className="font-medium">{rec.template.startTime} - {rec.template.endTime}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Semestres</div>
                                  <div className="font-medium">{rec.semesterIds.length} periodo(s)</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground text-xs">Agendamentos gerados</div>
                                  <div className="font-medium">{rec.generatedBookings}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Tab: Conflitos */}
            <TabsContent value="conflicts" className="flex-1 m-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Analise de Conflitos</h3>
                    <p className="text-sm text-muted-foreground">
                      Verifique inconsistencias entre a grade padrao e os agendamentos existentes em /grade
                    </p>
                  </div>
                  
                  {/* Conflitos reais */}
                  {realConflicts.length > 0 && (
                    <Card className="border-destructive/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-destructive">
                          <AlertTriangle className="size-5" />
                          Conflitos ({realConflicts.length})
                        </CardTitle>
                        <CardDescription>
                          Dias onde outro usuario/disciplina ja reservou o mesmo horario e sala
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Sala</TableHead>
                              <TableHead>Horario</TableHead>
                              <TableHead>Ocupado por</TableHead>
                              <TableHead>Acoes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {realConflicts.slice(0, 10).map((conflict, idx) => {
                              const room = rooms.find(r => r.id === conflict.booking.roomId)
                              return (
                                <TableRow key={idx}>
                                  <TableCell>
                                    {format(parseISO(conflict.date), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                                  </TableCell>
                                  <TableCell>{room?.name}</TableCell>
                                  <TableCell>
                                    {conflict.booking.startTime} - {conflict.booking.endTime}
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{conflict.booking.title}</div>
                                      <div className="text-xs text-muted-foreground">{conflict.booking.userName}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => router.push(`/reserva/${conflict.booking.id}`)}
                                    >
                                      <Eye className="size-4 mr-1" />
                                      Ver
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                        {realConflicts.length > 10 && (
                          <div className="text-center py-2 text-sm text-muted-foreground">
                            +{realConflicts.length - 10} mais conflitos
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Excecoes (alteracoes aprovadas) */}
                  {overrides.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Info className="size-5 text-blue-500" />
                          Excecoes Aprovadas ({overrides.length})
                        </CardTitle>
                        <CardDescription>
                          Dias onde houve alteracao pontual aprovada (mesmo professor, mesma disciplina)
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Disciplina</TableHead>
                              <TableHead>Alteracao</TableHead>
                              <TableHead>Acoes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {overrides.slice(0, 10).map((override, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  {format(parseISO(override.date), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                                </TableCell>
                                <TableCell>{override.booking.title}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{override.reason}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => router.push(`/reserva/${override.booking.id}`)}
                                  >
                                    <Eye className="size-4 mr-1" />
                                    Ver
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                  
                  {realConflicts.length === 0 && overrides.length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Check className="size-12 mx-auto mb-4 text-emerald-500" />
                        <p className="text-lg font-medium text-emerald-600">Nenhum conflito encontrado</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          A grade esta consistente com os agendamentos existentes
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* ================================================================= */}
        {/* DIALOGS */}
        {/* ================================================================= */}
        
        {/* Dialog: Template */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Alocacao" : "Nova Alocacao"}
              </DialogTitle>
              <DialogDescription>
                Defina uma alocacao fixa na grade de horarios
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Disciplina</Label>
                <Input
                  placeholder="Nome da disciplina"
                  value={formDiscipline}
                  onChange={(e) => setFormDiscipline(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Professor</Label>
                <Select value={formUser} onValueChange={setFormUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Sala</Label>
                <Select value={formRoom} onValueChange={setFormRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.slice(0, 30).map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name} ({room.building})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Dia da Semana</Label>
                <Select value={String(formDay)} onValueChange={(v) => setFormDay(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workDays.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Inicio</Label>
                  <Select value={formStartTime} onValueChange={setFormStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Horario inicial" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.startTime}>
                          {slot.startTime} ({slot.label})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Fim</Label>
                  <Select value={formEndTime} onValueChange={setFormEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Horario final" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.endTime}>
                          {slot.endTime} ({slot.label})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Observacoes (opcional)</Label>
                <Input
                  placeholder="Notas ou observacoes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Alocacao ativa</Label>
                <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate} disabled={!formDiscipline || !formUser || !formRoom}>
                {editingTemplate ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog: Recurring */}
        <Dialog open={recurringDialogOpen} onOpenChange={setRecurringDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingRecurring ? "Editar Recorrente" : "Novo Agendamento Recorrente"}
              </DialogTitle>
              <DialogDescription>
                Configure um padrao de reserva que sera aplicado automaticamente
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Aulas de Calculo I"
                  value={recName}
                  onChange={(e) => setRecName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Descricao (opcional)</Label>
                <Input
                  placeholder="Descricao do agendamento"
                  value={recDescription}
                  onChange={(e) => setRecDescription(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Disciplina</Label>
                <Input
                  placeholder="Nome da disciplina"
                  value={recDiscipline}
                  onChange={(e) => setRecDiscipline(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Professor</Label>
                <Select value={recUser} onValueChange={setRecUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Sala</Label>
                <Select value={recRoom} onValueChange={setRecRoom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.slice(0, 30).map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Frequencia</Label>
                <Select value={recFrequency} onValueChange={(v) => setRecFrequency(v as "weekly" | "biweekly")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quinzenal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Dia da Semana</Label>
                <div className="flex flex-wrap gap-2">
                  {workDays.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={recDays.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleRecDay(day.value)}
                    >
                      {day.short}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Inicio</Label>
                  <Select value={recStartTime} onValueChange={setRecStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.startTime}>
                          {slot.startTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Fim</Label>
                  <Select value={recEndTime} onValueChange={setRecEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.endTime}>
                          {slot.endTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Aplicar nos semestres</Label>
                <div className="border rounded-md p-3 space-y-2">
                  {academicYears.map((year) => (
                    <div key={year.id}>
                      <div className="text-sm font-medium mb-1">{year.year}</div>
                      <div className="flex flex-wrap gap-2">
                        {year.semesters.map((sem) => (
                          <Button
                            key={sem.id}
                            type="button"
                            variant={recSemesters.includes(sem.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleRecSemester(sem.id)}
                          >
                            {sem.name.split(" ")[0]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecurringDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveRecurring} disabled={!recName || !recUser || !recRoom || recDays.length === 0}>
                {editingRecurring ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog: Generate */}
        <AlertDialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Gerar Agendamentos</AlertDialogTitle>
              <AlertDialogDescription>
                Isso ira criar agendamentos para todas as alocacoes ativas no periodo {selectedSemester?.name}.
                Dias com conflitos serao ignorados automaticamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alocacoes ativas:</span>
                  <span className="font-medium">{filteredTemplates.filter(t => t.isActive).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conflitos existentes:</span>
                  <span className="font-medium text-orange-600">{realConflicts.length}</span>
                </div>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={generateAllBookings}>
                <Zap className="size-4 mr-2" />
                Gerar Agendamentos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Dialog: Delete Confirm */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
              <AlertDialogDescription>
                {itemToDelete?.type === "template" && "Esta acao ira remover esta alocacao da grade."}
                {itemToDelete?.type === "recurring" && "Esta acao ira remover o agendamento recorrente. Os agendamentos ja gerados nao serao afetados."}
                {itemToDelete?.type === "year" && "Esta acao ira remover o ano academico e todas as alocacoes associadas."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Sheet: Year Settings */}
        <Sheet open={yearSettingsOpen} onOpenChange={setYearSettingsOpen}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Anos Academicos</SheetTitle>
              <SheetDescription>
                Gerencie os anos academicos e configure a divisao de periodos
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* Adicionar novo ano */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Adicionar Ano</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="2028"
                      value={newYearValue}
                      onChange={(e) => setNewYearValue(e.target.value)}
                      className="w-24"
                    />
                    <Select 
                      value={String(newYearSemesterCount)} 
                      onValueChange={(v) => setNewYearSemesterCount(parseInt(v))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Anual (1 periodo)</SelectItem>
                        <SelectItem value="2">Semestral (2 periodos)</SelectItem>
                        <SelectItem value="3">Trimestral (3 periodos)</SelectItem>
                        <SelectItem value="4">Bimestral (4 periodos)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddYear} disabled={!newYearValue}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Lista de anos */}
              <div className="space-y-3">
                {academicYears.map((year) => (
                  <Card key={year.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {year.year}
                          {year.isActive && (
                            <Badge className="bg-emerald-500">Ano Atual</Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          {!year.isActive && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleSetActiveYear(year.id)}
                            >
                              Definir como atual
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setItemToDelete({ type: "year", id: year.id })
                              setDeleteConfirmOpen(true)
                            }}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Divisao:</Label>
                          <Select 
                            value={String(year.semesterCount)}
                            onValueChange={(v) => handleUpdateYearSemesterCount(year.id, parseInt(v))}
                          >
                            <SelectTrigger className="h-8 text-xs w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Anual</SelectItem>
                              <SelectItem value="2">Semestral</SelectItem>
                              <SelectItem value="3">Trimestral</SelectItem>
                              <SelectItem value="4">Bimestral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {year.semesters.map((sem) => (
                            <Badge 
                              key={sem.id} 
                              variant={sem.isActive ? "default" : "outline"}
                              className="text-xs"
                            >
                              {sem.name.split(" ")[0]}
                              <span className="ml-1 opacity-70">
                                ({format(parseISO(sem.startDate), "dd/MM")} - {format(parseISO(sem.endDate), "dd/MM")})
                              </span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  )
}

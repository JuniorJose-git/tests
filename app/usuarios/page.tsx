"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Shield,
  Building2,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  Crown,
  ShieldCheck,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { useAuth, type User, type UserRole } from "@/components/auth-provider"
import { cn } from "@/lib/utils"

// Estatisticas de uso do usuario
interface UserStats {
  totalReservas: number
  reservasAprovadas: number
  reservasRejeitadas: number
  reservasCanceladas: number
  taxaComparecimento: number // porcentagem
  ultimaReserva?: string
  horasUtilizadas: number
}

// Tipos de usuário estendidos para gerenciamento
interface ManagedUser extends User {
  createdAt: string
  lastLogin?: string
  isActive: boolean
  stats?: UserStats
}

// Dados iniciais de usuários
const initialUsers: ManagedUser[] = [
  {
    id: "1",
    name: "Prof. Carlos Silva",
    email: "professor@edu.br",
    role: "professor",
    department: "Engenharia de Software",
    createdAt: "2024-01-15",
    lastLogin: "2026-03-10",
    isActive: true,
    stats: {
      totalReservas: 87,
      reservasAprovadas: 82,
      reservasRejeitadas: 3,
      reservasCanceladas: 2,
      taxaComparecimento: 96,
      ultimaReserva: "2026-03-10",
      horasUtilizadas: 164,
    },
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "funcionario@edu.br",
    role: "funcionario",
    department: "Secretaria Acadêmica",
    createdAt: "2024-02-20",
    lastLogin: "2026-03-09",
    isActive: true,
    stats: {
      totalReservas: 12,
      reservasAprovadas: 11,
      reservasRejeitadas: 1,
      reservasCanceladas: 0,
      taxaComparecimento: 100,
      ultimaReserva: "2026-03-05",
      horasUtilizadas: 24,
    },
  },
  {
    id: "3",
    name: "Dr. João Oliveira",
    email: "coordenador@edu.br",
    role: "coordenador",
    department: "Coordenação de Computação",
    createdAt: "2023-08-10",
    lastLogin: "2026-03-10",
    isActive: true,
    stats: {
      totalReservas: 156,
      reservasAprovadas: 156,
      reservasRejeitadas: 0,
      reservasCanceladas: 5,
      taxaComparecimento: 94,
      ultimaReserva: "2026-03-10",
      horasUtilizadas: 312,
    },
  },
  {
    id: "4",
    name: "Ana Paula Admin",
    email: "admin@edu.br",
    role: "admin",
    department: "Tecnologia da Informação",
    createdAt: "2023-01-01",
    lastLogin: "2026-03-10",
    isActive: true,
    stats: {
      totalReservas: 8,
      reservasAprovadas: 8,
      reservasRejeitadas: 0,
      reservasCanceladas: 0,
      taxaComparecimento: 100,
      ultimaReserva: "2026-02-28",
      horasUtilizadas: 16,
    },
  },
  {
    id: "5",
    name: "Prof. Roberto Lima",
    email: "roberto.lima@edu.br",
    role: "professor",
    department: "Matemática",
    createdAt: "2024-03-05",
    lastLogin: "2026-03-08",
    isActive: true,
    stats: {
      totalReservas: 64,
      reservasAprovadas: 58,
      reservasRejeitadas: 4,
      reservasCanceladas: 2,
      taxaComparecimento: 88,
      ultimaReserva: "2026-03-08",
      horasUtilizadas: 116,
    },
  },
  {
    id: "6",
    name: "Fernanda Costa",
    email: "fernanda.costa@edu.br",
    role: "funcionario",
    department: "Biblioteca",
    createdAt: "2024-05-12",
    lastLogin: "2026-03-07",
    isActive: true,
    stats: {
      totalReservas: 5,
      reservasAprovadas: 5,
      reservasRejeitadas: 0,
      reservasCanceladas: 0,
      taxaComparecimento: 100,
      ultimaReserva: "2026-03-01",
      horasUtilizadas: 10,
    },
  },
  {
    id: "7",
    name: "Prof. Marcos Pereira",
    email: "marcos.pereira@edu.br",
    role: "professor",
    department: "Física",
    createdAt: "2024-06-20",
    isActive: false,
    stats: {
      totalReservas: 23,
      reservasAprovadas: 20,
      reservasRejeitadas: 2,
      reservasCanceladas: 1,
      taxaComparecimento: 75,
      ultimaReserva: "2025-12-15",
      horasUtilizadas: 40,
    },
  },
  {
    id: "8",
    name: "Dra. Luciana Mendes",
    email: "luciana.mendes@edu.br",
    role: "coordenador",
    department: "Coordenação de Engenharia",
    createdAt: "2023-11-15",
    lastLogin: "2026-03-06",
    isActive: true,
    stats: {
      totalReservas: 98,
      reservasAprovadas: 98,
      reservasRejeitadas: 0,
      reservasCanceladas: 3,
      taxaComparecimento: 97,
      ultimaReserva: "2026-03-06",
      horasUtilizadas: 196,
    },
  },
]

// Departamentos disponíveis
const departments = [
  "Engenharia de Software",
  "Coordenação de Computação",
  "Coordenação de Engenharia",
  "Matemática",
  "Física",
  "Química",
  "Secretaria Acadêmica",
  "Biblioteca",
  "Tecnologia da Informação",
  "Recursos Humanos",
]

// Configuração de roles
const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  professor: {
    label: "Professor",
    icon: GraduationCap,
    color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  },
  funcionario: {
    label: "Funcionário",
    icon: Briefcase,
    color: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  },
  coordenador: {
    label: "Coordenador",
    icon: ShieldCheck,
    color: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  },
  admin: {
    label: "Administrador",
    icon: Crown,
    color: "bg-purple-500/20 text-purple-600 border-purple-500/30",
  },
}

export default function UsuariosPage() {
  const router = useRouter()
  const { user: currentUser, canManageUsers, isLoading } = useAuth()
  
  const [users, setUsers] = React.useState<ManagedUser[]>(initialUsers)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterRole, setFilterRole] = React.useState<string>("all")
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  
  // Paginacao
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(5)
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isStatsSheetOpen, setIsStatsSheetOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<ManagedUser | null>(null)
  const [userToDelete, setUserToDelete] = React.useState<ManagedUser | null>(null)
  const [statsUser, setStatsUser] = React.useState<ManagedUser | null>(null)
  
  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: "professor" as UserRole,
    department: "",
    isActive: true,
  })

  // Redirecionar se não for admin
  React.useEffect(() => {
    if (!isLoading && !canManageUsers) {
      router.push("/")
    }
  }, [isLoading, canManageUsers, router])

  // Filtrar usuários
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      
      const matchesRole = filterRole === "all" || user.role === filterRole
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && user.isActive) ||
        (filterStatus === "inactive" && !user.isActive)
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, filterRole, filterStatus])

  // Resetar pagina quando filtros mudam
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterRole, filterStatus])

  // Paginacao
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Estatísticas
  const stats = React.useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      professors: users.filter((u) => u.role === "professor").length,
      coordinators: users.filter((u) => u.role === "coordenador").length,
    }
  }, [users])

  // Handlers
  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      role: "professor",
      department: "",
      isActive: true,
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: ManagedUser) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      isActive: user.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingUser) {
      // Editar usuário existente
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        )
      )
    } else {
      // Criar novo usuário
      const newUser: ManagedUser = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
        isActive: formData.isActive,
      }
      setUsers((prev) => [...prev, newUser])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
      setUserToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    )
  }

  const openStatsSheet = (user: ManagedUser) => {
    setStatsUser(user)
    setIsStatsSheetOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const formatDate = (date?: string) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("pt-BR")
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-screen items-center justify-center">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!canManageUsers) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            <h1 className="text-lg font-semibold">Gerenciamento de Usuários</h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} ativos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professores</CardTitle>
                <GraduationCap className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.professors}</div>
                <p className="text-xs text-muted-foreground">
                  cadastrados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coordenadores</CardTitle>
                <ShieldCheck className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.coordinators}</div>
                <p className="text-xs text-muted-foreground">
                  com permissões
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Shield className="size-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.active / stats.total) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  taxa de ativação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou departamento..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="professor">Professores</SelectItem>
                      <SelectItem value="funcionario">Funcionários</SelectItem>
                      <SelectItem value="coordenador">Coordenadores</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={openCreateDialog}>
                  <UserPlus className="mr-2 size-4" />
                  Novo Usuário
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>
                {filteredUsers.length} usuário(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="hidden md:table-cell">Departamento</TableHead>
                      <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                      <TableHead className="hidden lg:table-cell">Último Acesso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Users className="mb-2 size-8" />
                            <p>Nenhum usuário encontrado</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => {
                        const role = roleConfig[user.role]
                        const RoleIcon = role.icon
                        const isCurrentUser = currentUser?.id === user.id

                        return (
                          <TableRow key={user.id} className={cn(!user.isActive && "opacity-60")}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium">{user.name}</span>
                                  <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={role.color}>
                                <RoleIcon className="mr-1 size-3" />
                                {role.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="text-sm text-muted-foreground">
                                {user.department || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">
                                {formatDate(user.createdAt)}
                              </span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-sm text-muted-foreground">
                                {formatDate(user.lastLogin)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  user.isActive
                                    ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                                    : "bg-gray-500/20 text-gray-600 border-gray-500/30"
                                }
                              >
                                {user.isActive ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="size-8">
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openStatsSheet(user)}>
                                    <BarChart3 className="mr-2 size-4" />
                                    Ver Estatisticas
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Pencil className="mr-2 size-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                                    {user.isActive ? (
                                      <>
                                        <X className="mr-2 size-4" />
                                        Desativar
                                      </>
                                    ) : (
                                      <>
                                        <Check className="mr-2 size-4" />
                                        Ativar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    disabled={isCurrentUser}
                                    onClick={() => {
                                      setUserToDelete(user)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="mr-2 size-4" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginacao */}
              {filteredUsers.length > 0 && (
                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Mostrando</span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value))
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="h-8 w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>
                      de {filteredUsers.length} usuario(s)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 5) return true
                          if (page === 1 || page === totalPages) return true
                          if (Math.abs(page - currentPage) <= 1) return true
                          return false
                        })
                        .map((page, index, arr) => {
                          const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <span className="px-1 text-muted-foreground">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="icon"
                                className="size-8"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </React.Fragment>
                          )
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Atualize as informações do usuário."
                  : "Preencha as informações para cadastrar um novo usuário."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nome Completo</label>
                <Input
                  placeholder="Ex: Prof. João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="email@instituicao.edu.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tipo de Usuário</label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="size-4" />
                        Professor
                      </div>
                    </SelectItem>
                    <SelectItem value="funcionario">
                      <div className="flex items-center gap-2">
                        <Briefcase className="size-4" />
                        Funcionário
                      </div>
                    </SelectItem>
                    <SelectItem value="coordenador">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4" />
                        Coordenador
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="size-4" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Departamento</label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Usuário Ativo</label>
                  <p className="text-xs text-muted-foreground">
                    Usuários inativos não podem acessar o sistema
                  </p>
                </div>
                <Button
                  type="button"
                  variant={formData.isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                >
                  {formData.isActive ? "Ativo" : "Inativo"}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.name || !formData.email}
              >
                {editingUser ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o usuário{" "}
                <span className="font-semibold">{userToDelete?.name}</span>?
                <br />
                Esta ação não pode ser desfeita e todas as reservas associadas serão mantidas no histórico.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Stats Sheet */}
        <Sheet open={isStatsSheetOpen} onOpenChange={setIsStatsSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                Estatisticas de Uso
              </SheetTitle>
              <SheetDescription>
                Metricas de utilizacao do sistema
              </SheetDescription>
            </SheetHeader>

            {statsUser && (
              <div className="mt-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="size-14">
                    <AvatarImage src={statsUser.avatar} alt={statsUser.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {getInitials(statsUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{statsUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{statsUser.email}</p>
                    <Badge variant="outline" className={roleConfig[statsUser.role].color + " mt-1"}>
                      {roleConfig[statsUser.role].label}
                    </Badge>
                  </div>
                </div>

                {/* Stats Grid */}
                {statsUser.stats ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Calendar className="size-4" />
                          <span className="text-xs">Total de Reservas</span>
                        </div>
                        <p className="text-2xl font-bold">{statsUser.stats.totalReservas}</p>
                      </div>
                      <div className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Clock className="size-4" />
                          <span className="text-xs">Horas Utilizadas</span>
                        </div>
                        <p className="text-2xl font-bold">{statsUser.stats.horasUtilizadas}h</p>
                      </div>
                    </div>

                    {/* Taxa de Comparecimento */}
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="size-4" />
                          <span className="text-sm">Taxa de Comparecimento</span>
                        </div>
                        <span className="text-lg font-bold">{statsUser.stats.taxaComparecimento}%</span>
                      </div>
                      <Progress value={statsUser.stats.taxaComparecimento} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {statsUser.stats.taxaComparecimento >= 90 
                          ? "Excelente taxa de comparecimento" 
                          : statsUser.stats.taxaComparecimento >= 75 
                          ? "Boa taxa de comparecimento" 
                          : "Taxa de comparecimento pode melhorar"}
                      </p>
                    </div>

                    {/* Detalhamento de Reservas */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Activity className="size-4" />
                        Detalhamento de Reservas
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-500" />
                            <span className="text-sm">Aprovadas</span>
                          </div>
                          <span className="font-semibold">{statsUser.stats.reservasAprovadas}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="flex items-center gap-2">
                            <XCircle className="size-4 text-red-500" />
                            <span className="text-sm">Rejeitadas</span>
                          </div>
                          <span className="font-semibold">{statsUser.stats.reservasRejeitadas}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-2">
                            <X className="size-4 text-amber-500" />
                            <span className="text-sm">Canceladas</span>
                          </div>
                          <span className="font-semibold">{statsUser.stats.reservasCanceladas}</span>
                        </div>
                      </div>
                    </div>

                    {/* Taxa de Aprovacao */}
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Taxa de Aprovacao</span>
                        <span className="text-lg font-bold">
                          {Math.round((statsUser.stats.reservasAprovadas / statsUser.stats.totalReservas) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(statsUser.stats.reservasAprovadas / statsUser.stats.totalReservas) * 100} 
                        className="h-2" 
                      />
                    </div>

                    {/* Ultima Reserva */}
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="size-4" />
                        <span className="text-sm">Ultima Reserva</span>
                      </div>
                      <p className="font-medium">
                        {statsUser.stats.ultimaReserva 
                          ? formatDate(statsUser.stats.ultimaReserva)
                          : "Nenhuma reserva registrada"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="size-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Nenhuma estatistica disponivel para este usuario
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      As estatisticas serao geradas apos o usuario realizar reservas
                    </p>
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
      </SidebarInset>
    </SidebarProvider>
  )
}

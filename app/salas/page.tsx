"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  DoorOpen,
  Users,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  Check,
  X,
  Monitor,
  Wind,
  Wifi,
  Projector,
  Mic,
  Tv,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { rooms as initialRooms, Room, RoomType, getRoomTypeName, generateId } from "@/lib/booking-data"

const allResources = [
  { id: "projetor", label: "Projetor", icon: Projector },
  { id: "ar_condicionado", label: "Ar Condicionado", icon: Wind },
  { id: "quadro_branco", label: "Quadro Branco", icon: Monitor },
  { id: "computadores", label: "Computadores", icon: Monitor },
  { id: "sistema_som", label: "Sistema de Som", icon: Mic },
  { id: "microfones", label: "Microfones", icon: Mic },
  { id: "tv", label: "TV", icon: Tv },
  { id: "videoconferencia", label: "Videoconferência", icon: Monitor },
  { id: "wifi", label: "Wi-Fi", icon: Wifi },
]

const buildings = ["Bloco A", "Bloco B", "Bloco C", "Bloco D"]

const roomTypes: { value: RoomType; label: string }[] = [
  { value: "sala_aula", label: "Sala de Aula" },
  { value: "laboratorio", label: "Laboratório" },
  { value: "auditorio", label: "Auditório" },
  { value: "sala_reuniao", label: "Sala de Reunião" },
]

export default function SalasPage() {
  const { user, canManageUsers } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterBuilding, setFilterBuilding] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  
  // Paginacao
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  
  // Modal states
  const [viewRoom, setViewRoom] = useState<Room | null>(null)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Room>>({
    name: "",
    code: "",
    type: "sala_aula",
    building: "Bloco A",
    floor: 1,
    capacity: 30,
    resources: [],
    isActive: true,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = 
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.code.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === "all" || room.type === filterType
    const matchesBuilding = filterBuilding === "all" || room.building === filterBuilding
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && room.isActive) ||
      (filterStatus === "inactive" && !room.isActive)
    
    return matchesSearch && matchesType && matchesBuilding && matchesStatus
  })

  // Resetar pagina quando filtros mudam
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterType, filterBuilding, filterStatus])

  // Paginacao
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex)

  const handleCreateRoom = () => {
    setFormData({
      name: "",
      code: "",
      type: "sala_aula",
      building: "Bloco A",
      floor: 1,
      capacity: 30,
      resources: [],
      isActive: true,
    })
    setIsCreating(true)
  }

  const handleEditRoom = (room: Room) => {
    setFormData({ ...room })
    setEditRoom(room)
  }

  const handleSaveRoom = () => {
    if (isCreating) {
      const newRoom: Room = {
        ...formData,
        id: generateId(),
      } as Room
      setRooms([...rooms, newRoom])
      setIsCreating(false)
    } else if (editRoom) {
      setRooms(rooms.map((r) => r.id === editRoom.id ? { ...r, ...formData } : r))
      setEditRoom(null)
    }
  }

  const handleDeleteRoom = () => {
    if (deleteRoom) {
      setRooms(rooms.filter((r) => r.id !== deleteRoom.id))
      setDeleteRoom(null)
    }
  }

  const handleToggleStatus = (room: Room) => {
    setRooms(rooms.map((r) => r.id === room.id ? { ...r, isActive: !r.isActive } : r))
  }

  const handleResourceToggle = (resourceLabel: string) => {
    const current = formData.resources || []
    if (current.includes(resourceLabel)) {
      setFormData({ ...formData, resources: current.filter((r) => r !== resourceLabel) })
    } else {
      setFormData({ ...formData, resources: [...current, resourceLabel] })
    }
  }

  const getRoomTypeIcon = (type: RoomType) => {
    switch (type) {
      case "sala_aula": return DoorOpen
      case "laboratorio": return Monitor
      case "auditorio": return Mic
      case "sala_reuniao": return Users
      default: return DoorOpen
    }
  }

  const getRoomTypeColor = (type: RoomType) => {
    switch (type) {
      case "sala_aula": return "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
      case "laboratorio": return "bg-blue-500/20 text-blue-600 border-blue-500/30"
      case "auditorio": return "bg-amber-500/20 text-amber-600 border-amber-500/30"
      case "sala_reuniao": return "bg-purple-500/20 text-purple-600 border-purple-500/30"
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/30"
    }
  }

  if (!mounted) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <DoorOpen className="size-5 text-primary" />
              <h1 className="text-lg font-semibold">Gerenciamento de Salas</h1>
            </div>
          </div>
          {canManageUsers && (
            <Button onClick={handleCreateRoom}>
              <Plus className="mr-2 size-4" />
              Nova Sala
            </Button>
          )}
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou código..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {roomTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterBuilding} onValueChange={setFilterBuilding}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Prédio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os prédios</SelectItem>
                    {buildings.map((building) => (
                      <SelectItem key={building} value={building}>
                        {building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="inactive">Inativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <DoorOpen className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{rooms.length}</p>
                    <p className="text-sm text-muted-foreground">Total de Salas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Check className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{rooms.filter(r => r.isActive).length}</p>
                    <p className="text-sm text-muted-foreground">Salas Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Monitor className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{rooms.filter(r => r.type === "laboratorio").length}</p>
                    <p className="text-sm text-muted-foreground">Laboratórios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                    <Users className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{rooms.reduce((acc, r) => acc + r.capacity, 0)}</p>
                    <p className="text-sm text-muted-foreground">Capacidade Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Salas */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedRooms.map((room) => {
              const TypeIcon = getRoomTypeIcon(room.type)
              return (
                <Card 
                  key={room.id} 
                  className={cn(
                    "group transition-all hover:shadow-md",
                    !room.isActive && "opacity-60"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex size-10 items-center justify-center rounded-lg",
                          getRoomTypeColor(room.type).replace("text-", "bg-").replace(/text-\w+-\d+/, "").split(" ")[0]
                        )}>
                          <TypeIcon className={cn("size-5", getRoomTypeColor(room.type).split(" ")[1])} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{room.name}</CardTitle>
                          <CardDescription className="text-xs">{room.code}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewRoom(room)}>
                            <Eye className="mr-2 size-4" />
                            Ver Ficha
                          </DropdownMenuItem>
                          {canManageUsers && (
                            <>
                              <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                                <Pencil className="mr-2 size-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(room)}>
                                {room.isActive ? (
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
                                onClick={() => setDeleteRoom(room)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Excluir
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={getRoomTypeColor(room.type)}>
                        {getRoomTypeName(room.type)}
                      </Badge>
                      <Badge variant={room.isActive ? "default" : "secondary"}>
                        {room.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="size-4" />
                        <span>{room.building}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-4" />
                        <span>{room.floor}º Andar</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="size-4" />
                        <span>{room.capacity} lugares</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {room.resources.slice(0, 3).map((resource) => (
                        <Badge key={resource} variant="secondary" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                      {room.resources.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{room.resources.length - 3}
                        </Badge>
                      )}
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setViewRoom(room)}
                    >
                      Ver Detalhes
                      <ChevronRight className="ml-2 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredRooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DoorOpen className="size-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma sala encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou criar uma nova sala.
              </p>
            </div>
          )}

          {/* Paginacao */}
          {filteredRooms.length > 0 && (
            <div className="flex flex-col gap-4 mt-6 sm:flex-row sm:items-center sm:justify-between">
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
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
                <span>
                  de {filteredRooms.length} sala(s)
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
                        <span key={page} className="flex items-center">
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
                        </span>
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
        </div>

        {/* Modal de Visualização (Ficha) */}
        <Dialog open={!!viewRoom} onOpenChange={() => setViewRoom(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  viewRoom && getRoomTypeColor(viewRoom.type).replace("text-", "bg-").replace(/text-\w+-\d+/, "").split(" ")[0]
                )}>
                  {viewRoom && (() => {
                    const Icon = getRoomTypeIcon(viewRoom.type)
                    return <Icon className={cn("size-5", getRoomTypeColor(viewRoom.type).split(" ")[1])} />
                  })()}
                </div>
                <div>
                  <span>{viewRoom?.name}</span>
                  <p className="text-sm font-normal text-muted-foreground">{viewRoom?.code}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            {viewRoom && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <Badge variant="outline" className={getRoomTypeColor(viewRoom.type)}>
                      {getRoomTypeName(viewRoom.type)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={viewRoom.isActive ? "default" : "secondary"}>
                      {viewRoom.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Prédio</p>
                    <p className="font-medium">{viewRoom.building}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Andar</p>
                    <p className="font-medium">{viewRoom.floor}º Andar</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Capacidade</p>
                    <p className="font-medium">{viewRoom.capacity} lugares</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Código</p>
                    <p className="font-medium font-mono">{viewRoom.code}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">Recursos Disponíveis</p>
                  <div className="flex flex-wrap gap-2">
                    {viewRoom.resources.map((resource) => (
                      <Badge key={resource} variant="secondary" className="px-3 py-1">
                        {resource}
                      </Badge>
                    ))}
                    {viewRoom.resources.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum recurso cadastrado</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRoom(null)}>
                Fechar
              </Button>
              {canManageUsers && (
                <Button onClick={() => {
                  if (viewRoom) {
                    handleEditRoom(viewRoom)
                    setViewRoom(null)
                  }
                }}>
                  <Pencil className="mr-2 size-4" />
                  Editar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Criação/Edição */}
        <Dialog open={isCreating || !!editRoom} onOpenChange={() => { setIsCreating(false); setEditRoom(null) }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? "Nova Sala" : "Editar Sala"}
              </DialogTitle>
              <DialogDescription>
                {isCreating 
                  ? "Preencha os dados para cadastrar uma nova sala." 
                  : "Atualize as informações da sala."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Sala *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Sala 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Código *</Label>
                  <Input
                    id="code"
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ex: BL-A-101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: RoomType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity || ""}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Prédio *</Label>
                  <Select 
                    value={formData.building} 
                    onValueChange={(value) => setFormData({ ...formData, building: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings.map((building) => (
                        <SelectItem key={building} value={building}>
                          {building}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Andar *</Label>
                  <Select 
                    value={String(formData.floor)} 
                    onValueChange={(value) => setFormData({ ...formData, floor: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5].map((floor) => (
                        <SelectItem key={floor} value={String(floor)}>
                          {floor === 0 ? "Térreo" : `${floor}º Andar`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Recursos Disponíveis</Label>
                <div className="grid grid-cols-2 gap-3">
                  {allResources.map((resource) => (
                    <div key={resource.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={resource.id}
                        checked={(formData.resources || []).includes(resource.label)}
                        onCheckedChange={() => handleResourceToggle(resource.label)}
                      />
                      <label
                        htmlFor={resource.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <resource.icon className="size-4 text-muted-foreground" />
                        {resource.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Sala ativa para reservas</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreating(false); setEditRoom(null) }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveRoom}
                disabled={!formData.name || !formData.code}
              >
                {isCreating ? "Criar Sala" : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <Dialog open={!!deleteRoom} onOpenChange={() => setDeleteRoom(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a sala <strong>{deleteRoom?.name}</strong> ({deleteRoom?.code})?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteRoom(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteRoom}>
                <Trash2 className="mr-2 size-4" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

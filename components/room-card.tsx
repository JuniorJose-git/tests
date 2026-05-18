"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Monitor, Wifi, Projector, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Room {
  id: string
  name: string
  capacity: number
  floor: string
  status: "available" | "occupied" | "maintenance"
  amenities: string[]
  nextBooking?: string
}

interface RoomCardProps {
  room: Room
  onEdit?: (room: Room) => void
  onDelete?: (room: Room) => void
  onBook?: (room: Room) => void
}

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="size-3.5" />,
  monitor: <Monitor className="size-3.5" />,
  projector: <Projector className="size-3.5" />,
}

const statusConfig = {
  available: {
    label: "Disponível",
    className: "bg-success/20 text-success border-success/30",
  },
  occupied: {
    label: "Ocupada",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  maintenance: {
    label: "Manutenção",
    className: "bg-warning/20 text-warning border-warning/30",
  },
}

export function RoomCard({ room, onEdit, onDelete, onBook }: RoomCardProps) {
  const status = statusConfig[room.status]

  return (
    <Card className="border-border/50 transition-colors hover:border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">{room.name}</CardTitle>
          <span className="text-xs text-muted-foreground">{room.floor}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(room)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBook?.(room)}>
                Reservar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(room)}
                className="text-destructive"
              >
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="size-4" />
              <span>{room.capacity} pessoas</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
              >
                {amenityIcons[amenity]}
                <span className="capitalize">{amenity}</span>
              </div>
            ))}
          </div>
          {room.nextBooking && (
            <div className="text-xs text-muted-foreground">
              Próxima reserva: {room.nextBooking}
            </div>
          )}
          {room.status === "available" && (
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={() => onBook?.(room)}
            >
              Reservar Agora
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

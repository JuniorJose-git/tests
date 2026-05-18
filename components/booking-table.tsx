"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Check, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Booking {
  id: string
  room: string
  user: string
  userInitials: string
  date: string
  time: string
  duration: string
  status: "confirmed" | "pending" | "cancelled"
}

interface BookingTableProps {
  bookings: Booking[]
  onApprove?: (booking: Booking) => void
  onReject?: (booking: Booking) => void
  onView?: (booking: Booking) => void
}

const statusConfig = {
  confirmed: {
    label: "Confirmada",
    className: "bg-success/20 text-success border-success/30",
  },
  pending: {
    label: "Pendente",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
}

export function BookingTable({
  bookings,
  onApprove,
  onReject,
  onView,
}: BookingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/50 hover:bg-transparent">
          <TableHead>Sala</TableHead>
          <TableHead>Solicitante</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Horário</TableHead>
          <TableHead>Duração</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => {
          const status = statusConfig[booking.status]
          return (
            <TableRow key={booking.id} className="border-border/50">
              <TableCell className="font-medium">{booking.room}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-secondary text-xs">
                      {booking.userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{booking.user}</span>
                </div>
              </TableCell>
              <TableCell>{booking.date}</TableCell>
              <TableCell>{booking.time}</TableCell>
              <TableCell>{booking.duration}</TableCell>
              <TableCell>
                <Badge variant="outline" className={status.className}>
                  {status.label}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {booking.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-success hover:bg-success/10 hover:text-success"
                        onClick={() => onApprove?.(booking)}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onReject?.(booking)}
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView?.(booking)}>
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

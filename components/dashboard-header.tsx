"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardHeaderProps {
  onNewBooking?: () => void
}

export function DashboardHeader({ onNewBooking }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border/50 bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar salas, reservas..."
            className="w-[300px] bg-secondary/50 pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={onNewBooking} className="gap-2">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nova Reserva</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              <Badge className="absolute -right-1 -top-1 size-5 rounded-full p-0 text-[10px]">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Nova reserva pendente</span>
              <span className="text-xs text-muted-foreground">
                Sala Executiva - João Silva solicitou para amanhã às 14h
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Reserva confirmada</span>
              <span className="text-xs text-muted-foreground">
                Sua reserva na Sala de Reuniões A foi confirmada
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="text-sm font-medium">Manutenção agendada</span>
              <span className="text-xs text-muted-foreground">
                Sala de Treinamento entrará em manutenção amanhã
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

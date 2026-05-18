"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Settings, 
  Clock, 
  Bell, 
  Shield, 
  Palette, 
  Puzzle,
  RotateCcw,
  Save,
  ChevronRight,
  Mail,
  Smartphone,
  Globe,
  Key,
  Users,
  Database,
  Webhook,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useColors } from "@/components/color-provider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const settingsCategories = [
  { id: "aparencia", label: "Aparencia", icon: Palette, description: "Tema, cores e layout" },
  { id: "geral", label: "Geral", icon: Settings, description: "Configuracoes basicas" },
  { id: "horarios", label: "Horarios", icon: Clock, description: "Slots e intervalos" },
  { id: "notificacoes", label: "Notificacoes", icon: Bell, description: "Alertas e emails" },
  { id: "seguranca", label: "Seguranca", icon: Shield, description: "Senhas e acessos" },
  { id: "integracao", label: "Integracoes", icon: Puzzle, description: "APIs e webhooks" },
]

const themeOptions = [
  { value: "light", label: "Claro", icon: Sun, description: "Tema claro padrao" },
  { value: "dark", label: "Escuro", icon: Moon, description: "Tema escuro para ambientes com pouca luz" },
  { value: "system", label: "Sistema", icon: Monitor, description: "Seguir preferencia do sistema" },
]

const colorPresets = [
  { name: "Academico", primary: "#1e3a8a", accent: "#d97706" },
  { name: "Azul Profundo", primary: "#0f3460", accent: "#ea580c" },
  { name: "Verde Academico", primary: "#1a5f3d", accent: "#c29f4a" },
  { name: "Marinho & Ouro", primary: "#0a2463", accent: "#d4af37" },
  { name: "Púrpura Real", primary: "#4a148c", accent: "#ffc107" },
  { name: "Cinza & Âmbar", primary: "#37474f", accent: "#ff9800" },
]

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme()
  const { colors, setColors, resetColors } = useColors()
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState("aparencia")
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setColors({
      primaryColor: preset.primary,
      accentColor: preset.accent,
    })
    setHasChanges(true)
  }

  const resetToDefault = () => {
    resetColors()
    setTheme("system")
    setHasChanges(false)
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  if (!mounted) {
    return null
  }

  const renderContent = () => {
    switch (activeCategory) {
      case "aparencia":
        return (
          <div className="divide-y divide-border">
            {/* Theme Section */}
            <div className="pb-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Modo do tema</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione como o tema deve ser exibido
              </p>
              <div className="flex flex-col gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value)
                        setHasChanges(true)
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition-colors",
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center size-8 rounded-md",
                        isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground">{option.label}</span>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                      {isSelected && (
                        <Check className="size-4 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color Selection */}
            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Cores do tema</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Personalize as cores principais da interface
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Cor primaria
                  </label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background">
                    <input
                      type="color"
                      value={colors.primaryColor}
                      onChange={(e) => {
                        setColors({ primaryColor: e.target.value })
                        setHasChanges(true)
                      }}
                      className="size-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input 
                      value={colors.primaryColor}
                      onChange={(e) => {
                        setColors({ primaryColor: e.target.value })
                        setHasChanges(true)
                      }}
                      className="border-0 h-auto p-0 text-sm bg-transparent focus-visible:ring-0 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Cor de destaque
                  </label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-background">
                    <input
                      type="color"
                      value={colors.accentColor}
                      onChange={(e) => {
                        setColors({ accentColor: e.target.value })
                        setHasChanges(true)
                      }}
                      className="size-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <Input 
                      value={colors.accentColor}
                      onChange={(e) => {
                        setColors({ accentColor: e.target.value })
                        setHasChanges(true)
                      }}
                      className="border-0 h-auto p-0 text-sm bg-transparent focus-visible:ring-0 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => {
                  const isActive = colors.primaryColor === preset.primary && colors.accentColor === preset.accent
                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex -space-x-1">
                        <div 
                          className="size-3.5 rounded-full border border-background/50" 
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="size-3.5 rounded-full border border-background/50" 
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      {preset.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Display Options */}
            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Opcoes de exibicao</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ajuste como os elementos sao exibidos
              </p>

              <div className="space-y-0 rounded-md border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-background">
                  <div>
                    <p className="text-sm font-medium text-foreground">Decoracoes Doodle</p>
                    <p className="text-xs text-muted-foreground">Exibir elementos decorativos hand-drawn</p>
                  </div>
                  <Switch 
                    checked={colors.showDoodle} 
                    onCheckedChange={(checked) => {
                      setColors({ showDoodle: checked })
                      setHasChanges(true)
                    }} 
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">Modo compacto</p>
                    <p className="text-xs text-muted-foreground">Reduzir espacamento entre elementos</p>
                  </div>
                  <Switch 
                    checked={colors.compactMode} 
                    onCheckedChange={(checked) => {
                      setColors({ compactMode: checked })
                      setHasChanges(true)
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )
      
      case "geral":
        return (
          <div className="divide-y divide-border">
            <div className="pb-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Informacoes do sistema</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configuracoes basicas do sistema de reservas
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Nome da instituicao
                  </label>
                  <Input defaultValue="Universidade Federal" className="max-w-md" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Fuso horario
                  </label>
                  <Select defaultValue="america-sao_paulo">
                    <SelectTrigger className="max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-sao_paulo">America/Sao_Paulo (GMT-3)</SelectItem>
                      <SelectItem value="america-fortaleza">America/Fortaleza (GMT-3)</SelectItem>
                      <SelectItem value="america-manaus">America/Manaus (GMT-4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Idioma padrao
                  </label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger className="max-w-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Portugues (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es">Espanol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Periodo letivo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure o periodo academico atual
              </p>

              <div className="space-y-0 rounded-md border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-background">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Ano letivo atual</p>
                      <p className="text-xs text-muted-foreground">2026</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Alterar</Button>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <div className="flex items-center gap-3">
                    <Clock className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Semestre atual</p>
                      <p className="text-xs text-muted-foreground">1o Semestre (Fev - Jun)</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Em andamento</Badge>
                </div>
              </div>
            </div>
          </div>
        )

      case "horarios":
        return (
          <div className="divide-y divide-border">
            <div className="pb-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Configuracao de horarios</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Defina os horarios disponiveis para reserva
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Horario de inicio
                  </label>
                  <Select defaultValue="07:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["06:00", "07:00", "08:00"].map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Horario de termino
                  </label>
                  <Select defaultValue="22:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["20:00", "21:00", "22:00", "23:00"].map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Duracao minima (minutos)
                  </label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["15", "30", "45", "60"].map((min) => (
                        <SelectItem key={min} value={min}>{min} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Intervalo entre slots
                  </label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["15", "30", "60"].map((min) => (
                        <SelectItem key={min} value={min}>{min} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Dias de funcionamento</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os dias disponiveis para reserva
              </p>

              <div className="flex flex-wrap gap-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day, i) => (
                  <button
                    key={day}
                    className={cn(
                      "size-10 rounded-full text-sm font-medium transition-colors border",
                      i >= 1 && i <= 5
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case "notificacoes":
        return (
          <div className="divide-y divide-border">
            <div className="pb-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Canais de notificacao</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha como deseja receber notificacoes
              </p>

              <div className="space-y-0 rounded-md border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-background">
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <p className="text-xs text-muted-foreground">Receber notificacoes por email</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <div className="flex items-center gap-3">
                    <Smartphone className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Push</p>
                      <p className="text-xs text-muted-foreground">Notificacoes no navegador</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <div className="flex items-center gap-3">
                    <Globe className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">In-app</p>
                      <p className="text-xs text-muted-foreground">Notificacoes dentro do sistema</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Tipos de notificacao</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione quais eventos geram notificacoes
              </p>

              <div className="space-y-0 rounded-md border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-background">
                  <span className="text-sm text-foreground">Nova solicitacao de reserva</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <span className="text-sm text-foreground">Reserva aprovada/rejeitada</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <span className="text-sm text-foreground">Lembrete de reserva (1h antes)</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <span className="text-sm text-foreground">Conflito de horario</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )

      case "seguranca":
        return (
          <div className="divide-y divide-border">
            <div className="pb-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Autenticacao</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure as opcoes de seguranca do sistema
              </p>

              <div className="space-y-0 rounded-md border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-background">
                  <div className="flex items-center gap-3">
                    <Key className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Autenticacao em duas etapas</p>
                      <p className="text-xs text-muted-foreground">Adicione uma camada extra de seguranca</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <div className="flex items-center gap-3">
                    <Users className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Login com SSO</p>
                      <p className="text-xs text-muted-foreground">Permitir login via provedor institucional</p>
                    </div>
                  </div>
                  <Badge>Configurar</Badge>
                </div>
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Sessoes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie a duracao das sessoes de usuario
              </p>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Timeout de sessao
                </label>
                <Select defaultValue="8">
                  <SelectTrigger className="max-w-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="4">4 horas</SelectItem>
                    <SelectItem value="8">8 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                Zona de perigo
                <AlertCircle className="size-4 text-red-500" />
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Acoes irreversiveis do sistema
              </p>

              <div className="p-4 rounded-md border border-red-500/30 bg-red-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Limpar todos os dados</p>
                    <p className="text-xs text-muted-foreground">Remove todas as reservas e configuracoes</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Excluir dados
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case "integracao":
        return (
          <div className="divide-y divide-border">
            <div className="pb-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">Integracoes disponiveis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Conecte o sistema a outros servicos
              </p>

              <div className="space-y-0 rounded-md border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-background">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Google Calendar</p>
                      <p className="text-xs text-muted-foreground">Sincronizar reservas com Google Calendar</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/50">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <div className="flex items-center gap-3">
                    <Database className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Sistema Academico</p>
                      <p className="text-xs text-muted-foreground">Importar dados de professores e salas</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Conectar</Button>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                  <div className="flex items-center gap-3">
                    <Webhook className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Webhooks</p>
                      <p className="text-xs text-muted-foreground">Enviar eventos para URLs externas</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configurar</Button>
                </div>
              </div>
            </div>

            <div className="py-6">
              <h3 className="text-sm font-semibold text-foreground mb-1">API</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie chaves de acesso a API
              </p>

              <div className="p-4 rounded-md border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground">Chave de API</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    Regenerar
                  </Button>
                </div>
                <code className="block text-xs font-mono bg-background p-2 rounded border border-border text-muted-foreground">
                  sk_live_***************************
                </code>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-5" />
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground" />
            <h1 className="text-sm font-semibold text-foreground">Configuracoes</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6">
            <div className="flex gap-8">
              {/* Sidebar Navigation */}
              <nav className="w-56 shrink-0">
                <div className="sticky top-6 space-y-1">
                  {settingsCategories.map((category) => {
                    const Icon = category.icon
                    const isActive = activeCategory === category.id
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors text-left",
                          isActive 
                            ? "bg-muted font-medium text-foreground" 
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{category.label}</span>
                      </button>
                    )
                  })}
                </div>
              </nav>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="rounded-md border border-border bg-card">
                  {/* Content Header */}
                  <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-semibold text-foreground">
                          {settingsCategories.find(c => c.id === activeCategory)?.label}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {settingsCategories.find(c => c.id === activeCategory)?.description}
                        </p>
                      </div>
                      {hasChanges && (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-500/10">
                          Alteracoes nao salvas
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 py-6">
                    {renderContent()}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={resetToDefault}
                      className="text-muted-foreground"
                    >
                      <RotateCcw className="size-4 mr-2" />
                      Restaurar padrao
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={!hasChanges}
                    >
                      <Save className="size-4 mr-2" />
                      Salvar alteracoes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

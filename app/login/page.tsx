"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, User, KeyRound, AlertCircle, GraduationCap, Briefcase, Shield, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const demoAccounts = [
  {
    email: "professor@edu.br",
    role: "Professor",
    icon: GraduationCap,
    description: "Agendar salas para aulas e atividades acadêmicas",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    email: "funcionario@edu.br",
    role: "Funcionário",
    icon: Briefcase,
    description: "Reservar salas para treinamentos e reuniões",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    email: "coordenador@edu.br",
    role: "Coordenador",
    icon: Shield,
    description: "Aprovar solicitações e gerenciar reservas do departamento",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    email: "admin@edu.br",
    role: "Administrador",
    icon: Settings,
    description: "Acesso total ao sistema e gestão de usuários",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
]

export default function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/")
      } else {
        setError("Email ou senha inválidos. Use uma das contas de demonstração com senha 123456.")
      }
    } catch {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("123456")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-2 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary">
              <Building2 className="size-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SalaBook</h1>
              <p className="text-muted-foreground">Sistema de Reservas Acadêmicas</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Gerencie reservas de salas com facilidade
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary" />
                Grade de horários visual e intuitiva
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary" />
                Agendamentos em massa e recorrentes
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary" />
                Sistema de aprovação de solicitações
              </li>
              <li className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary" />
                Troca de salas entre usuários
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">Contas de demonstração:</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account.email)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                    "border border-border hover:border-primary/50 hover:bg-accent"
                  )}
                >
                  <div className={cn("p-1.5 rounded-md", account.bgColor)}>
                    <account.icon className={cn("size-4", account.color)} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{account.role}</div>
                    <div className="text-xs text-muted-foreground">{account.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 lg:hidden">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary">
                <Building2 className="size-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Entrar no Sistema</CardTitle>
            <CardDescription>
              Insira suas credenciais para acessar o sistema de reservas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@edu.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Use a senha <code className="bg-muted px-1 py-0.5 rounded">123456</code> para as contas de demonstração
              </p>
            </form>

            {/* Mobile demo accounts */}
            <div className="mt-6 pt-6 border-t border-border lg:hidden">
              <p className="text-sm text-muted-foreground mb-3 text-center">Acesso rápido:</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    onClick={() => handleDemoLogin(account.email)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                      "border border-border hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    <div className={cn("p-1 rounded-md", account.bgColor)}>
                      <account.icon className={cn("size-3", account.color)} />
                    </div>
                    <div className="text-xs font-medium text-foreground">{account.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

// Tipos de usuários
export type UserRole = "professor" | "funcionario" | "coordenador" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  avatar?: string
}

// Contexto de autenticação
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  canApprove: boolean
  canManageUsers: boolean
  canCreateBookingForOthers: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// Usuários de demonstração
const demoUsers: Record<string, User> = {
  "professor@edu.br": {
    id: "1",
    name: "Prof. Carlos Silva",
    email: "professor@edu.br",
    role: "professor",
    department: "Engenharia de Software",
  },
  "funcionario@edu.br": {
    id: "2",
    name: "Maria Santos",
    email: "funcionario@edu.br",
    role: "funcionario",
    department: "Secretaria Acadêmica",
  },
  "coordenador@edu.br": {
    id: "3",
    name: "Dr. João Oliveira",
    email: "coordenador@edu.br",
    role: "coordenador",
    department: "Coordenação de Computação",
  },
  "admin@edu.br": {
    id: "4",
    name: "Ana Paula Admin",
    email: "admin@edu.br",
    role: "admin",
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    const savedUser = localStorage.getItem("roombook_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simula autenticação
    if (password === "123456" && demoUsers[email]) {
      const foundUser = demoUsers[email]
      setUser(foundUser)
      localStorage.setItem("roombook_user", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("roombook_user")
    router.push("/login")
  }

  const canApprove = user?.role === "coordenador" || user?.role === "admin"
  const canManageUsers = user?.role === "admin"
  const canCreateBookingForOthers = user?.role === "admin" || user?.role === "coordenador"

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        canApprove,
        canManageUsers,
        canCreateBookingForOthers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

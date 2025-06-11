"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/store"
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  BarChart3,
  Shield,
  Settings,
  LogOut,
  ChevronUp,
  Syringe,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const menuItems = {
  general: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles: ["medico", "digitador", "supervisor", "administrador"],
    },
    {
      title: "Pacientes",
      url: "/dashboard/patients",
      icon: Users,
      roles: ["medico", "digitador", "supervisor", "administrador"],
    },
    {
      title: "Vacunación",
      url: "/dashboard/vaccination",
      icon: Syringe,
      roles: ["medico", "digitador", "supervisor", "administrador"],
    },
    {
      title: "Citas",
      url: "/dashboard/appointments",
      icon: Calendar,
      roles: ["medico", "digitador", "supervisor", "administrador"],
    },
    {
      title: "Alertas",
      url: "/dashboard/alerts",
      icon: AlertTriangle,
      roles: ["medico", "digitador", "supervisor", "administrador"],
    },
  ],
  admin: [
    {
        title: "User Management",
        url: "/admin/users",
        icon: Users,
        roles: ["administrador"],
      },
      {
        title: "Centros de Vacunación",
      url: "/admin/centers",
      icon: Building2,
      roles: ["supervisor", "administrador"],
    },
    {
      title: "Reportes",
      url: "/reports",
      icon: BarChart3,
      roles: ["supervisor", "administrador"],
    },
    {
      title: "Auditoría",
      url: "/admin/audit-log",
      icon: Shield,
      roles: ["administrador"],
    },
    {
      title: "Configuración",
      url: "/admin/settings",
      icon: Settings,
      roles: ["administrador"],
    },
  ],
}

export function AppSidebar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const canAccess = (roles: string[]) => {
    return user && roles.includes(user.role)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Sistema Vacunación</span>
            <span className="text-xs text-muted-foreground">v2.0</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.general.map(
                (item) =>
                  canAccess(item.roles) && (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.admin.map(
                (item) =>
                  canAccess(item.roles) && (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user?.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">{user?.name ?? user?.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

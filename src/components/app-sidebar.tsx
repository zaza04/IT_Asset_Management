"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Settings,
  Laptop,
  Server,
} from "lucide-react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useDevices } from "@/hooks/useDevices"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "IT Admin",
    email: "store@example.com",
    avatar: "",
  },
}

// Mini stats component — ẩn khi sidebar collapsed (icon mode)
function SidebarQuickStats() {
  const { devices } = useDevices()
  const { state } = useSidebar()

  if (devices.length === 0 || state === "collapsed") return null

  const active = devices.filter(d => (d.status ?? 'active') === 'active').length
  const broken = devices.filter(d => d.status === 'broken').length
  const inactive = devices.filter(d => d.status === 'inactive').length

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
      <div className="px-2 py-1">
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="rounded-md bg-emerald-500/10 px-1.5 py-1.5">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{active}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="rounded-md bg-red-500/10 px-1.5 py-1.5">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{broken}</p>
            <p className="text-[10px] text-muted-foreground">Broken</p>
          </div>
          <div className="rounded-md bg-gray-500/10 px-1.5 py-1.5">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{inactive}</p>
            <p className="text-[10px] text-muted-foreground">Inactive</p>
          </div>
        </div>
      </div>
    </SidebarGroup>
  )
}

// Device count badge cho nav item
function DeviceCountBadge() {
  const { devices } = useDevices()
  if (devices.length === 0) return null
  return (
    <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 text-[10px] font-semibold">
      {devices.length}
    </Badge>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navGroups = [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Devices",
          url: "/devices",
          icon: Laptop,
          badge: <DeviceCountBadge />,
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          title: "Settings",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "User Settings",
              url: "/settings/user",
            },
            {
              title: "Account Settings",
              url: "/settings/account",
            },
            {
              title: "Appearance",
              url: "/settings/appearance",
            },
          ],
        },
      ],
    },
  ]

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Server size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">IT Asset Manager</span>
                  <span className="truncate text-xs">Device Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarQuickStats />
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  BriefcaseBusinessIcon,
  ClipboardClockIcon,
  ShieldCheckIcon,
  IdCardIcon,
  FileIcon,
  PowerOffIcon,
  User2Icon,
  FolderIcon,
  FolderOpenIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Applications",
    href: "/pending",
    icon: ClipboardClockIcon,
  },
  {
    title: "Businesses",
    href: "/approved",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileIcon,
  },
  {
    title: "Certificates",
    href: "/certificates",
    icon: ShieldCheckIcon,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: IdCardIcon,
  },
  {
    title: "Category",
    href: "/category",
    icon: FolderOpenIcon,
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    // clear session/token if stored
    localStorage.removeItem("token")

    // redirect to login page
    router.push("/login")
  }

  return (
    <div className="relative flex h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          "relative flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center px-4 border-b border-sidebar-border justify-between">
          <Image
            src="/Novel.png"
            alt="Logo"
            width={collapsed ? 60 : 160}
            height={collapsed ? 60 : 60}
            className="object-contain transition-opacity duration-300"
          />
          
          {/* Collapse Button - Inside when expanded */}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Footer with Profile + Logout */}
        <div className="p-4 border-t border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
                  <User2Icon/>
                  <div className="ml-2 flex flex-col">
                <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
                <div className="ml-auto">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5 text-sidebar-foreground" />
              </Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-sidebar-foreground" />
            </Button>
          )}
          <div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => router.push("/change-password")}
            >
              <Settings className={cn("h-5 w-5", !collapsed && "mr-3")} />  
              {!collapsed && "Change password" }
            </Button>
          </div>
        </div>
      </div>

      {/* Collapse Button - Outside when collapsed */}
      {collapsed && (
        <div className="absolute top-4 z-10 left-[4.25rem]">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-full border-2 border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md hover:bg-sidebar-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { CatConfig } from "@/lib/cats-config"

type AppShellProps = {
  cats: CatConfig[]
  children: React.ReactNode
}

export function AppShell({ cats, children }: AppShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar cats={cats} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>
          <div className="flex flex-1 flex-col p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

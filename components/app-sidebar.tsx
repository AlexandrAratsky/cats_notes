"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { CatConfig } from "@/lib/cats-config"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calculator01Icon,
  CatIcon,
  Home01Icon,
} from "@hugeicons/core-free-icons"

type AppSidebarProps = {
  cats: CatConfig[]
}

export function AppSidebar({ cats }: AppSidebarProps) {
  const searchParams = useSearchParams()
  const activeCatId = searchParams.get("cat")

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex flex-col gap-1 px-2 py-1">
          <span className="font-medium">Журнал кормления</span>
          <span className="text-xs text-muted-foreground">Кошки</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/" />}
                  isActive={!activeCatId}
                >
                  <HugeiconsIcon icon={Home01Icon} data-icon="inline-start" />
                  Все кошки
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/?view=calculator" />}
                  isActive={searchParams.get("view") === "calculator"}
                >
                  <HugeiconsIcon
                    icon={Calculator01Icon}
                    data-icon="inline-start"
                  />
                  Калькулятор кормления
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Кошки</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {cats.map((cat) => (
                <SidebarMenuItem key={cat.id}>
                  <SidebarMenuButton
                    render={<Link href={`/?cat=${cat.id}`} />}
                    isActive={activeCatId === cat.id}
                  >
                    <HugeiconsIcon icon={CatIcon} data-icon="inline-start" />
                    {cat.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

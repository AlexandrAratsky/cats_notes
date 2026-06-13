import type { IconSvgElement } from "@hugeicons/react"
import {
  BeefIcon,
  BirdIcon,
  ChickenThighsIcon,
  HamIcon,
} from "@hugeicons/core-free-icons"

export const MEAT_TYPES = [
  {
    id: "beef",
    label: "Говядина",
    icon: BeefIcon,
  },
  {
    id: "pork",
    label: "Свинина",
    icon: HamIcon,
  },
  {
    id: "turkey",
    label: "Индейка",
    icon: BirdIcon,
  },
  {
    id: "chicken",
    label: "Курица",
    icon: ChickenThighsIcon,
  },
  {
    id: "rabbit",
    label: "Крольчатина",
    shortLabel: "Кр",
  },
] as const

export type MeatTypeId = (typeof MEAT_TYPES)[number]["id"]

export type MeatType = (typeof MEAT_TYPES)[number]

export function getMeatTypeById(id: MeatTypeId): MeatType | undefined {
  return MEAT_TYPES.find((meat) => meat.id === id)
}

export function getMeatTypeLabel(id: MeatTypeId): string {
  return getMeatTypeById(id)?.label ?? id
}

export function isMeatTypeWithIcon(
  meat: MeatType
): meat is MeatType & { icon: IconSvgElement } {
  return "icon" in meat
}

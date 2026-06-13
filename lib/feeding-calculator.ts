import { getSettings } from "@/lib/settings-storage"

export const MEALS_PER_DAY = 2

export const FEEDING_GROUPS = [
  {
    id: "meat",
    label: "Мясо",
    examples: "говядина, индейка, курица, филе",
    key: "meat" as const,
  },
  {
    id: "muscular-organs",
    label: "Мышечные органы",
    examples: "сердце, желудки, лёгкие, рубец",
    key: "muscularOrgans" as const,
  },
  {
    id: "meat-on-bone",
    label: "Мясокостная",
    examples: "шеи, головы, каркасы птицы, хвосты",
    key: "meatOnBone" as const,
  },
  {
    id: "hematopoietic-organs",
    label: "Кроветворные органы",
    examples: "печень, почки, селезёнка",
    key: "hematopoieticOrgans" as const,
  },
] as const

export type FeedingGroupId = (typeof FEEDING_GROUPS)[number]["id"]
export type FeedingGroupKey = (typeof FEEDING_GROUPS)[number]["key"]

export type FeedingGroupResult = {
  id: FeedingGroupId
  key: FeedingGroupKey
  label: string
  examples: string
  percentage: number
  dailyGrams: number
  gramsPerMeal: number
}

export type FeedingResult = {
  dailyGrams: number
  mealsPerDay: number
  gramsPerMeal: number
  groups: FeedingGroupResult[]
  dailyPercent: number
}

function roundGrams(value: number): number {
  return Math.round(value)
}

/**
 * Рассчитать суточный рацион с учётом настроек
 * @param weightKg Вес животного в кг
 * @param customSettings Опциональные настройки (если не переданы — берутся из хранилища)
 */
export function calculateFeeding(
  weightKg: number,
  customSettings?: {
    dailyPercent: number
    groupRatios: Record<FeedingGroupKey, number>
  }
): FeedingResult {
  const settings = customSettings ?? {
    dailyPercent: getSettings().dailyPercent,
    groupRatios: getSettings().groupRatios,
  }

  const dailyPercent = settings.dailyPercent / 100
  const dailyGrams = roundGrams(weightKg * 1000 * dailyPercent)
  const gramsPerMeal = roundGrams(dailyGrams / MEALS_PER_DAY)

  const groups: FeedingGroupResult[] = FEEDING_GROUPS.map((group) => {
    const groupPercentage = settings.groupRatios[group.key]
    const groupDailyGrams = roundGrams((dailyGrams * groupPercentage) / 100)

    return {
      id: group.id,
      key: group.key,
      label: group.label,
      examples: group.examples,
      percentage: groupPercentage,
      dailyGrams: groupDailyGrams,
      gramsPerMeal: roundGrams(groupDailyGrams / MEALS_PER_DAY),
    }
  })

  return {
    dailyGrams,
    mealsPerDay: MEALS_PER_DAY,
    gramsPerMeal,
    groups,
    dailyPercent: settings.dailyPercent,
  }
}

/**
 * Получить метку группы по ID
 */
export function getGroupLabel(groupId: FeedingGroupId): string {
  const group = FEEDING_GROUPS.find((g) => g.id === groupId)
  return group?.label ?? groupId
}

/**
 * Получить key группы по ID
 */
export function getGroupKey(groupId: FeedingGroupId): FeedingGroupKey {
  const group = FEEDING_GROUPS.find((g) => g.id === groupId)
  return group?.key ?? "meat"
}

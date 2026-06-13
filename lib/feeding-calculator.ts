export const DAILY_WEIGHT_PERCENT = 0.02
export const MEALS_PER_DAY = 2

export const FEEDING_GROUPS = [
  {
    id: "meat",
    label: "Мясо / мясная обрезь",
    examples: "говядина, индейка, курица",
    percentage: 40,
  },
  {
    id: "muscular-organs",
    label: "Мышечные органы",
    examples: "сердце, желудки, лёгкие, рубец",
    percentage: 30,
  },
  {
    id: "meat-on-bone",
    label: "Мясокостная",
    examples: "шеи, головы, каркасы птицы, хвосты",
    percentage: 20,
  },
  {
    id: "hematopoietic-organs",
    label: "Кроветворные органы",
    examples: "печень, почки, селезёнка",
    percentage: 10,
  },
] as const

export type FeedingGroupId = (typeof FEEDING_GROUPS)[number]["id"]

export type FeedingGroupResult = {
  id: FeedingGroupId
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
}

function roundGrams(value: number): number {
  return Math.round(value)
}

export function calculateFeeding(weightKg: number): FeedingResult {
  const dailyGrams = roundGrams(weightKg * 1000 * DAILY_WEIGHT_PERCENT)
  const gramsPerMeal = roundGrams(dailyGrams / MEALS_PER_DAY)

  const groups: FeedingGroupResult[] = FEEDING_GROUPS.map((group) => {
    const groupDailyGrams = roundGrams((dailyGrams * group.percentage) / 100)

    return {
      id: group.id,
      label: group.label,
      examples: group.examples,
      percentage: group.percentage,
      dailyGrams: groupDailyGrams,
      gramsPerMeal: roundGrams(groupDailyGrams / MEALS_PER_DAY),
    }
  })

  return {
    dailyGrams,
    mealsPerDay: MEALS_PER_DAY,
    gramsPerMeal,
    groups,
  }
}

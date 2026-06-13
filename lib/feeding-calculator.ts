export type FeedingResult = {
  dailyGrams: number
  mealsPerDay: number
  gramsPerMeal: number
  note?: string
}

export function calculateFeeding(weightKg: number): FeedingResult {
  // TODO: заменить на вашу формулу
  return {
    dailyGrams: 0,
    mealsPerDay: 2,
    gramsPerMeal: 0,
    note: "Формула не задана",
  }
}

import type { CatConfig } from "@/lib/cats-config"
import type { FeedingGroupResult } from "@/lib/feeding-calculator"

export type CalculationEntry = {
  type: "calculation"
  id: string
  createdAt: string
  weightKg: number
  dailyGrams: number
  mealsPerDay: number
  gramsPerMeal: number
  groups?: FeedingGroupResult[]
}

export type FeedingEntry = {
  type: "feeding"
  id: string
  createdAt: string
  grams: number
  note?: string
}

export type JournalEntry = CalculationEntry | FeedingEntry

export type CatStatus = {
  lastFeeding: FeedingEntry | null
  lastCalculation: CalculationEntry | null
}

const JOURNAL_KEY_PREFIX = "cats-notes:journal:"
const LAST_WEIGHT_KEY_PREFIX = "cats-notes:last-weight:"

function journalKey(catId: string) {
  return `${JOURNAL_KEY_PREFIX}${catId}`
}

function lastWeightKey(catId: string) {
  return `${LAST_WEIGHT_KEY_PREFIX}${catId}`
}

function createEntryId() {
  return crypto.randomUUID()
}

function isBrowser() {
  return typeof window !== "undefined"
}

export function getLastWeight(catId: string): number | null {
  if (!isBrowser()) {
    return null
  }

  const raw = window.localStorage.getItem(lastWeightKey(catId))

  if (!raw) {
    return null
  }

  const weight = Number(raw)

  return Number.isFinite(weight) ? weight : null
}

export function setLastWeight(catId: string, weightKg: number) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(lastWeightKey(catId), String(weightKg))
}

export function getEffectiveWeight(cat: CatConfig): number {
  return getLastWeight(cat.id) ?? cat.weightKg
}

export function getJournalEntries(catId: string): JournalEntry[] {
  if (!isBrowser()) {
    return []
  }

  const raw = window.localStorage.getItem(journalKey(catId))

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as JournalEntry[]

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveJournalEntries(catId: string, entries: JournalEntry[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(journalKey(catId), JSON.stringify(entries))
}

export function addCalculationEntry(
  catId: string,
  data: Omit<CalculationEntry, "type" | "id" | "createdAt">
) {
  const entry: CalculationEntry = {
    type: "calculation",
    id: createEntryId(),
    createdAt: new Date().toISOString(),
    ...data,
  }

  const entries = getJournalEntries(catId)
  saveJournalEntries(catId, [entry, ...entries])
  setLastWeight(catId, data.weightKg)

  return entry
}

export function addFeedingEntry(
  catId: string,
  data: Omit<FeedingEntry, "type" | "id" | "createdAt">
) {
  const entry: FeedingEntry = {
    type: "feeding",
    id: createEntryId(),
    createdAt: new Date().toISOString(),
    ...data,
  }

  const entries = getJournalEntries(catId)
  saveJournalEntries(catId, [entry, ...entries])

  return entry
}

export function getCatStatus(catId: string): CatStatus {
  const entries = getJournalEntries(catId)

  return {
    lastFeeding: entries.find((entry) => entry.type === "feeding") ?? null,
    lastCalculation:
      entries.find((entry) => entry.type === "calculation") ?? null,
  }
}

/**
 * Журнал кормления v2
 *
 * Новая структура записей кормления с привязкой к продуктам
 * и распределением по группам
 */

import type { CatConfig } from "@/lib/cats-config"

import type { Product } from "@/lib/products"
import { calculateProductDistribution } from "@/lib/products"

// === Типы ===

export type GroupDistribution = {
  meat: number
  muscularOrgans: number
  meatOnBone: number
  hematopoieticOrgans: number
}

export type FeedingEntryV2 = {
  type: "feeding"
  id: string
  createdAt: string // ISO date string
  /** Дата кормления (YYYY-MM-DD) для группировки по дням */
  date: string
  productId: string
  productName: string
  totalGrams: number
  /** Распределение веса по группам */
  groupDistribution: GroupDistribution
  /** Заметка (опционально) */
  note?: string
}

export type DailyBalance = {
  /** Дата (YYYY-MM-DD) */
  date: string
  /** Целевые значения по группам (рассчитанные) */
  targetGrams: GroupDistribution
  /** Потреблённые значения */
  consumedGrams: GroupDistribution
  /** Остатки (target - consumed) */
  remainingGrams: GroupDistribution
}

export type DailyFeedingSummary = {
  date: string
  entries: FeedingEntryV2[]
  totals: GroupDistribution
}

// === Константы ===

const JOURNAL_KEY_PREFIX = "cats-notes:journal:v2:"

const LAST_WEIGHT_KEY_PREFIX = "cats-notes:last-weight:"

// === Утилиты ===

function isBrowser() {
  return typeof window !== "undefined"
}

function createEntryId() {
  return crypto.randomUUID()
}

function getJournalKey(catId: string) {
  return `${JOURNAL_KEY_PREFIX}${catId}`
}

function getLastWeightKey(catId: string) {
  return `${LAST_WEIGHT_KEY_PREFIX}${catId}`
}

/**
 * Получить сегодняшнюю дату в формате YYYY-MM-DD
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]!
}

/**
 * Извлечь дату из ISO строки
 */
export function extractDate(isoString: string): string {
  return isoString.split("T")[0]!
}

// === Работа с localStorage ===

function getEntriesFromStorage(catId: string): FeedingEntryV2[] {
  if (!isBrowser()) {
    return []
  }

  const raw = window.localStorage.getItem(getJournalKey(catId))

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as FeedingEntryV2[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveEntriesToStorage(catId: string, entries: FeedingEntryV2[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(getJournalKey(catId), JSON.stringify(entries))
}

// === Публичные API ===

/**
 * Получить все записи кормления для животного
 */
export function getFeedingEntries(catId: string): FeedingEntryV2[] {
  return getEntriesFromStorage(catId)
}

/**
 * Добавить запись кормления
 */
export function addFeedingEntry(
  catId: string,
  data: {
    product: Product
    totalGrams: number
    note?: string
    date?: string // Опционально, по умолчанию сегодня
  }
): FeedingEntryV2 {
  const { product, totalGrams, note, date = getTodayDate() } = data
  const groupDistribution = calculateProductDistribution(product, totalGrams)

  const entry: FeedingEntryV2 = {
    type: "feeding",
    id: createEntryId(),
    createdAt: new Date().toISOString(),
    date,
    productId: product.id,
    productName: product.name,
    totalGrams,
    groupDistribution,
    note: note?.trim() || undefined,
  }

  const entries = getEntriesFromStorage(catId)
  saveEntriesToStorage(catId, [entry, ...entries])

  return entry
}

/**
 * Удалить запись кормления
 */
export function deleteFeedingEntry(catId: string, entryId: string): boolean {
  const entries = getEntriesFromStorage(catId)
  const filtered = entries.filter((e) => e.id !== entryId)

  if (filtered.length === entries.length) {
    return false
  }

  saveEntriesToStorage(catId, filtered)
  return true
}

/**
 * Получить записи за конкретный день
 */
export function getEntriesForDate(
  catId: string,
  date: string
): FeedingEntryV2[] {
  return getEntriesFromStorage(catId).filter((e) => e.date === date)
}

/**
 * Получить сводку по дню
 */
export function getDailySummary(
  catId: string,
  date: string
): DailyFeedingSummary {
  const entries = getEntriesForDate(catId, date)

  const totals: GroupDistribution = entries.reduce(
    (acc, entry) => ({
      meat: acc.meat + entry.groupDistribution.meat,
      muscularOrgans:
        acc.muscularOrgans + entry.groupDistribution.muscularOrgans,
      meatOnBone: acc.meatOnBone + entry.groupDistribution.meatOnBone,
      hematopoieticOrgans:
        acc.hematopoieticOrgans + entry.groupDistribution.hematopoieticOrgans,
    }),
    { meat: 0, muscularOrgans: 0, meatOnBone: 0, hematopoieticOrgans: 0 }
  )

  return { date, entries, totals }
}

/**
 * Получить несгруппированные записи (все) с разбивкой по дням
 */
export function getAllEntriesGroupedByDate(catId: string): Array<{
  date: string
  entries: FeedingEntryV2[]
  totals: GroupDistribution
}> {
  const entries = getEntriesFromStorage(catId)
  const groups = new Map<string, FeedingEntryV2[]>()

  // Группируем по дате
  for (const entry of entries) {
    const existing = groups.get(entry.date) ?? []
    existing.push(entry)
    groups.set(entry.date, existing)
  }

  // Сортируем даты по убыванию (новые сначала)
  const sortedDates = Array.from(groups.keys()).sort((a, b) =>
    b.localeCompare(a)
  )

  return sortedDates.map((date) => {
    const dayEntries = groups.get(date)!
    const totals = dayEntries.reduce(
      (acc, entry) => ({
        meat: acc.meat + entry.groupDistribution.meat,
        muscularOrgans:
          acc.muscularOrgans + entry.groupDistribution.muscularOrgans,
        meatOnBone: acc.meatOnBone + entry.groupDistribution.meatOnBone,
        hematopoieticOrgans:
          acc.hematopoieticOrgans + entry.groupDistribution.hematopoieticOrgans,
      }),
      { meat: 0, muscularOrgans: 0, meatOnBone: 0, hematopoieticOrgans: 0 }
    )
    return { date, entries: dayEntries, totals }
  })
}

/**
 * Получить последний вес животного
 */
export function getLastWeight(catId: string): number | null {
  if (!isBrowser()) {
    return null
  }

  const raw = window.localStorage.getItem(getLastWeightKey(catId))

  if (!raw) {
    return null
  }

  const weight = Number(raw)
  return Number.isFinite(weight) ? weight : null
}

/**
 * Сохранить последний вес
 */
export function setLastWeight(catId: string, weightKg: number) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(getLastWeightKey(catId), String(weightKg))
}

/**
 * Получить эффективный вес (сохранённый или из конфига)
 */
export function getEffectiveWeight(cat: CatConfig): number {
  return getLastWeight(cat.id) ?? cat.weightKg
}

// === Форматирование ===

const GROUP_LABELS: Record<keyof GroupDistribution, string> = {
  meat: "Мясо",
  muscularOrgans: "Мышечные органы",
  meatOnBone: "Мясокостная",
  hematopoieticOrgans: "Кроветворные",
}

export function getGroupLabel(key: keyof GroupDistribution): string {
  return GROUP_LABELS[key]
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Вычислить процент заполнения нормы
 */
export function calculatePercentage(
  consumed: number,
  target: number
): { percentage: number; status: "under" | "ok" | "over" } {
  if (target === 0) {
    return { percentage: 0, status: consumed > 0 ? "over" : "ok" }
  }

  const percentage = Math.round((consumed / target) * 100)

  let status: "under" | "ok" | "over"
  if (percentage < 90) {
    status = "under"
  } else if (percentage > 110) {
    status = "over"
  } else {
    status = "ok"
  }

  return { percentage, status }
}

// === Превью записи кормления ===

export type FeedingPreview = {
  product: Product
  totalGrams: number
  targetGrams: GroupDistribution
  groupDistribution: GroupDistribution
  remainingAfter: GroupDistribution
}

/**
 * Рассчитать превью добавления продукта
 */
export function calculateFeedingPreview(
  product: Product,
  totalGrams: number,
  currentConsumed: GroupDistribution,
  targetGrams: GroupDistribution
): FeedingPreview {
  const groupDistribution = calculateProductDistribution(product, totalGrams)

  return {
    product,
    totalGrams,
    targetGrams,
    groupDistribution,
    remainingAfter: {
      meat: Math.max(
        0,
        targetGrams.meat - currentConsumed.meat - groupDistribution.meat
      ),
      muscularOrgans: Math.max(
        0,
        targetGrams.muscularOrgans -
          currentConsumed.muscularOrgans -
          groupDistribution.muscularOrgans
      ),
      meatOnBone: Math.max(
        0,
        targetGrams.meatOnBone -
          currentConsumed.meatOnBone -
          groupDistribution.meatOnBone
      ),
      hematopoieticOrgans: Math.max(
        0,
        targetGrams.hematopoieticOrgans -
          currentConsumed.hematopoieticOrgans -
          groupDistribution.hematopoieticOrgans
      ),
    },
  }
}

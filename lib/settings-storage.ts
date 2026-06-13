/**
 * Глобальные настройки приложения
 *
 * Хранятся в localStorage и применяются ко всем животным
 */

import type { ProductComposition } from "@/lib/products"

// === Дефолтные значения ===

export const DEFAULT_DAILY_PERCENT = 2 // 2% от веса

export const DEFAULT_GROUP_RATIOS = {
  meat: 40,
  muscularOrgans: 30,
  meatOnBone: 20,
  hematopoieticOrgans: 10,
} as const satisfies Record<keyof ProductComposition, number>

export const DEFAULT_SETTINGS: AppSettings = {
  dailyPercent: DEFAULT_DAILY_PERCENT,
  groupRatios: { ...DEFAULT_GROUP_RATIOS },
  enableBalanceCorrection: false,
} as const

// === Типы ===

export type FeedingGroupRatios = {
  meat: number
  muscularOrgans: number
  meatOnBone: number
  hematopoieticOrgans: number
}

export type AppSettings = {
  /** Базовый процент от веса для расчёта суточного рациона (default: 2%) */
  dailyPercent: number

  /** Процентное распределение по группам (default: 40/30/20/10) */
  groupRatios: FeedingGroupRatios

  /** Учитывать перекосы предыдущих дней для коррекции (default: false) */
  enableBalanceCorrection: boolean
}

const SETTINGS_KEY = "cats-notes:settings"

function isBrowser() {
  return typeof window !== "undefined"
}

/**
 * Получить настройки приложения
 */
export function getSettings(): AppSettings {
  if (!isBrowser()) {
    return { ...DEFAULT_SETTINGS }
  }

  const raw = window.localStorage.getItem(SETTINGS_KEY)

  if (!raw) {
    return { ...DEFAULT_SETTINGS }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>

    return {
      dailyPercent: parsed.dailyPercent ?? DEFAULT_SETTINGS.dailyPercent,
      groupRatios: {
        meat: parsed.groupRatios?.meat ?? DEFAULT_SETTINGS.groupRatios.meat,
        muscularOrgans:
          parsed.groupRatios?.muscularOrgans ?? DEFAULT_SETTINGS.groupRatios.muscularOrgans,
        meatOnBone: parsed.groupRatios?.meatOnBone ?? DEFAULT_SETTINGS.groupRatios.meatOnBone,
        hematopoieticOrgans:
          parsed.groupRatios?.hematopoieticOrgans ??
          DEFAULT_SETTINGS.groupRatios.hematopoieticOrgans,
      },
      enableBalanceCorrection:
        parsed.enableBalanceCorrection ?? DEFAULT_SETTINGS.enableBalanceCorrection,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * Сохранить настройки приложения
 */
export function saveSettings(settings: AppSettings) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

/**
 * Обновить отдельное поле настроек
 */
export function updateSettings<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
) {
  const settings = getSettings()
  settings[key] = value
  saveSettings(settings)
}

/**
 * Сбросить настройки к дефолтным
 */
export function resetSettings() {
  saveSettings({ ...DEFAULT_SETTINGS })
}

/**
 * Валидировать процентное распределение групп
 * Сумма должна быть равна 100
 */
export function validateGroupRatios(ratios: FeedingGroupRatios): {
  valid: boolean
  sum: number
  error?: string
} {
  const sum = ratios.meat + ratios.muscularOrgans + ratios.meatOnBone + ratios.hematopoieticOrgans

  if (sum !== 100) {
    return {
      valid: false,
      sum,
      error: `Сумма процентов должна быть 100%, текущая сумма: ${sum}%`,
    }
  }

  const hasNegative = Object.values(ratios).some((v) => v < 0)
  if (hasNegative) {
    return {
      valid: false,
      sum,
      error: "Проценты не могут быть отрицательными",
    }
  }

  return { valid: true, sum }
}

/**
 * Валидировать dailyPercent
 */
export function validateDailyPercent(value: number): {
  valid: boolean
  error?: string
} {
  if (value <= 0) {
    return { valid: false, error: "Процент должен быть больше 0" }
  }

  if (value > 10) {
    return { valid: false, error: "Процент не может превышать 10%" }
  }

  return { valid: true }
}

// === Форматирование ===

export function formatPercent(value: number): string {
  return `${value}%`
}

export function formatDailyPercent(value: number): string {
  return `${value}% от веса`
}

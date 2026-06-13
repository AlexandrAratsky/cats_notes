"use client"

import { useCallback, useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDateTime } from "@/lib/format-date"
import {
  getJournalEntries,
  type JournalEntry,
} from "@/lib/feeding-journal-storage"
import { getMeatTypeLabel } from "@/lib/meat-types"

type CatFeedingJournalProps = {
  catId: string
  refreshKey: number
}

function formatEntry(entry: JournalEntry): string {
  if (entry.type === "calculation") {
    if (entry.dailyGrams === 0) {
      return `Вес ${entry.weightKg} кг — формула не задана`
    }

    const summary = `Вес ${entry.weightKg} кг — ~${entry.dailyGrams} г/день (${entry.mealsPerDay} приёма по ~${entry.gramsPerMeal} г)`

    if (!entry.groups?.length) {
      return summary
    }

    const groups = entry.groups
      .map((group) => {
        const meatLabel = entry.groupMeats?.[group.id]
          ? ` (${getMeatTypeLabel(entry.groupMeats[group.id]!)})`
          : ""

        return `${group.label}${meatLabel}: ~${group.dailyGrams} г/день`
      })
      .join("; ")

    return `${summary}. ${groups}`
  }

  return entry.note
    ? `${entry.grams} г — ${entry.note}`
    : `${entry.grams} г`
}

export function CatFeedingJournal({
  catId,
  refreshKey,
}: CatFeedingJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([])

  const loadEntries = useCallback(() => {
    setEntries(getJournalEntries(catId))
  }, [catId])

  useEffect(() => {
    loadEntries()
  }, [loadEntries, refreshKey])

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Записей пока нет. Рассчитайте норму или добавьте кормление.
      </p>
    )
  }

  return (
    <ScrollArea className="max-h-80 pr-3">
      <ul className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col gap-1 rounded-lg border p-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {entry.type === "calculation" ? "расчёт" : "кормление"}
              </Badge>
              <span className="text-muted-foreground">
                {formatDateTime(entry.createdAt)}
              </span>
            </div>
            <span>{formatEntry(entry)}</span>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

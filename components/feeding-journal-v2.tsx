"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  deleteFeedingEntry,
  formatDate,
  getAllEntriesGroupedByDate,
  getDailySummary,
  getTodayDate,
  type GroupDistribution,
} from "@/lib/feeding-journal-storage-v2"
import { calculateFeeding, type FeedingResult } from "@/lib/feeding-calculator"
import type { CatConfig } from "@/lib/cats-config"
import { getEffectiveWeight } from "@/lib/feeding-journal-storage-v2"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Delete01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type FeedingJournalV2Props = {
  cat: CatConfig
  refreshKey: number
}

const GROUP_KEYS = [
  "meat",
  "muscularOrgans",
  "meatOnBone",
  "hematopoieticOrgans",
] as const

const GROUP_LABELS = {
  meat: "Мясо",
  muscularOrgans: "Мыш.",
  meatOnBone: "Кость",
  hematopoieticOrgans: "Кров.",
} as const

export function FeedingJournalV2({ cat, refreshKey }: FeedingJournalV2Props) {
  const [entries, setEntries] = useState<
    Array<{
      date: string
      entries: FeedingEntryV2[]
      totals: GroupDistribution
    }>
  >([])
  const [feedingResult, setFeedingResult] = useState<FeedingResult | null>(null)

  const loadEntries = useCallback(() => {
    setEntries(getAllEntriesGroupedByDate(cat.id))

    // Рассчитываем целевые значения для сегодня
    const weight = getEffectiveWeight(cat)
    setFeedingResult(calculateFeeding(weight))
  }, [cat])

  useEffect(() => {
    loadEntries()
  }, [loadEntries, refreshKey])

  function handleDelete(entryId: string) {
    if (deleteFeedingEntry(cat.id, entryId)) {
      loadEntries()
    }
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Записей пока нет. Добавьте первое кормление.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((dayGroup) => (
        <DaySection
          key={dayGroup.date}
          date={dayGroup.date}
          entries={dayGroup.entries}
          totals={dayGroup.totals}
          feedingResult={feedingResult}
          isToday={dayGroup.date === getTodayDate()}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}

// === Внутренний компонент: секция дня ===

type FeedingEntryV2 = {
  id: string
  createdAt: string
  productId: string
  productName: string
  totalGrams: number
  groupDistribution: GroupDistribution
  note?: string
}

type DaySectionProps = {
  date: string
  entries: FeedingEntryV2[]
  totals: GroupDistribution
  feedingResult: FeedingResult | null
  isToday: boolean
  onDelete: (entryId: string) => void
}

function DaySection({
  date,
  entries,
  totals,
  feedingResult,
  isToday,
  onDelete,
}: DaySectionProps) {
  // Получаем целевые значения для этого дня если сегодня
  const targetGrams = feedingResult
    ? {
        meat:
          feedingResult.groups.find((g) => g.key === "meat")?.dailyGrams ?? 0,
        muscularOrgans:
          feedingResult.groups.find((g) => g.key === "muscularOrgans")
            ?.dailyGrams ?? 0,
        meatOnBone:
          feedingResult.groups.find((g) => g.key === "meatOnBone")
            ?.dailyGrams ?? 0,
        hematopoieticOrgans:
          feedingResult.groups.find((g) => g.key === "hematopoieticOrgans")
            ?.dailyGrams ?? 0,
      }
    : null

  const totalConsumed = Object.values(totals).reduce((a, b) => a + b, 0)
  const totalTarget = targetGrams
    ? Object.values(targetGrams).reduce((a, b) => a + b, 0)
    : 0

  return (
    <Card className={cn(isToday && "border-primary/50")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {formatDayTitle(date)}
            {isToday && (
              <span className="ml-2 text-xs font-normal text-primary">
                (сегодня)
              </span>
            )}
          </CardTitle>
          {targetGrams && (
            <span className="text-sm">
              Всего:{" "}
              <span
                className={cn(
                  "font-medium",
                  totalConsumed < totalTarget * 0.9 && "text-amber-600",
                  totalConsumed > totalTarget * 1.1 && "text-red-600"
                )}
              >
                {totalConsumed}
              </span>{" "}
              / {totalTarget} г
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Таблица записей */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Продукт</TableHead>
                <TableHead className="text-right">Всего</TableHead>
                {GROUP_KEYS.map((key) => (
                  <TableHead key={key} className="text-right text-xs">
                    {GROUP_LABELS[key]}
                  </TableHead>
                ))}
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="py-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="py-2">
                    <div>
                      <span className="font-medium">{entry.productName}</span>
                      {entry.note && (
                        <span className="block text-xs text-muted-foreground">
                          {entry.note}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-right font-medium tabular-nums">
                    {entry.totalGrams} г
                  </TableCell>
                  {GROUP_KEYS.map((key) => (
                    <TableCell
                      key={key}
                      className="py-2 text-right text-xs tabular-nums"
                    >
                      {entry.groupDistribution[key] > 0
                        ? `${entry.groupDistribution[key]} г`
                        : "—"}
                    </TableCell>
                  ))}
                  <TableCell className="py-2">
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button variant="ghost" size="icon-sm">
                            <HugeiconsIcon
                              icon={Delete01Icon}
                              className="h-4 w-4"
                            />
                          </Button>
                        }
                      />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Удалить запись?</DialogTitle>
                          <DialogDescription>
                            Запись "{entry.productName}" ({entry.totalGrams} г)
                            будет удалена безвозвратно.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() => onDelete(entry.id)}
                          >
                            Удалить
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}

              {/* Итоги по дню */}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={2}>Итого за день:</TableCell>
                <TableCell className="text-right tabular-nums">
                  {totalConsumed} г
                </TableCell>
                {GROUP_KEYS.map((key) => (
                  <TableCell
                    key={key}
                    className="text-right text-xs tabular-nums"
                  >
                    {totals[key]} г
                  </TableCell>
                ))}
                <TableCell></TableCell>
              </TableRow>

              {/* Остатки (только для сегодня если есть target) */}
              {targetGrams && (
                <TableRow className="text-muted-foreground">
                  <TableCell colSpan={2}>Осталось:</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Math.max(0, totalTarget - totalConsumed)} г
                  </TableCell>
                  {GROUP_KEYS.map((key) => (
                    <TableCell
                      key={key}
                      className={cn(
                        "text-right text-xs tabular-nums",
                        totals[key] > targetGrams[key] && "text-red-600"
                      )}
                    >
                      {Math.max(0, targetGrams[key] - totals[key])} г
                    </TableCell>
                  ))}
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDayTitle(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const dateOnly = date.toISOString().split("T")[0]
  const todayOnly = today.toISOString().split("T")[0]
  const yesterdayOnly = yesterday.toISOString().split("T")[0]

  if (dateOnly === todayOnly) {
    return "Сегодня"
  }
  if (dateOnly === yesterdayOnly) {
    return "Вчера"
  }

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  })
}

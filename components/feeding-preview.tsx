"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FeedingPreview } from "@/lib/feeding-journal-storage-v2"
import { cn } from "@/lib/utils"

type FeedingPreviewCardProps = {
  preview: FeedingPreview
  onConfirm: () => void
  onCancel: () => void
}

const GROUP_LABELS = {
  meat: "Мясо",
  muscularOrgans: "Мышечные органы",
  meatOnBone: "Мясокостная",
  hematopoieticOrgans: "Кроветворные",
} as const

const GROUP_COLORS = {
  meat: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  muscularOrgans:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
  meatOnBone:
    "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100",
  hematopoieticOrgans:
    "bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100",
} as const

export function FeedingPreviewCard({
  preview,
  onConfirm,
  onCancel,
}: FeedingPreviewCardProps) {
  const groups = [
    { key: "meat", label: GROUP_LABELS.meat },
    { key: "muscularOrgans", label: GROUP_LABELS.muscularOrgans },
    { key: "meatOnBone", label: GROUP_LABELS.meatOnBone },
    { key: "hematopoieticOrgans", label: GROUP_LABELS.hematopoieticOrgans },
  ] as const

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Предварительный расчёт</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Инфо о продукте */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{preview.product.name}</p>
            <p className="text-sm text-muted-foreground">
              {preview.totalGrams} г
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              GROUP_COLORS.meat
            )}
          >
            {preview.product.category}
          </span>
        </div>

        {/* Таблица распределения */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">Группа</th>
                <th className="px-3 py-2 text-right font-medium">Цель</th>
                <th className="px-3 py-2 text-right font-medium">Сейчас</th>
                <th className="px-3 py-2 text-right font-medium">+ этот</th>
                <th className="px-3 py-2 text-right font-medium">Останется</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ key, label }) => {
                const target = preview.targetGrams[key]
                const current =
                  preview.targetGrams[key] - preview.remainingAfter[key]
                const added = preview.groupDistribution[key]
                const remaining = preview.remainingAfter[key]
                const progress = target > 0 ? (current / target) * 100 : 0

                return (
                  <tr key={key} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      <span className="text-muted-foreground">{label}</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {target} г
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {current} г
                      {target > 0 && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({Math.round(progress)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-primary tabular-nums">
                      +{added} г
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right font-medium tabular-nums",
                        remaining === 0 && target > 0 && "text-green-600",
                        remaining < 0 && "text-red-600"
                      )}
                    >
                      {remaining >= 0 ? `${remaining} г` : "Перебор!"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-muted/30">
              <tr>
                <td className="px-3 py-2 font-medium">Всего</td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  {Object.values(preview.targetGrams).reduce(
                    (a, b) => a + b,
                    0
                  )}{" "}
                  г
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {Object.values(preview.targetGrams).reduce(
                    (a, b) => a + b,
                    0
                  ) -
                    Object.values(preview.remainingAfter).reduce(
                      (a, b) => a + b,
                      0
                    )}{" "}
                  г
                </td>
                <td className="px-3 py-2 text-right font-medium text-primary tabular-nums">
                  +
                  {Object.values(preview.groupDistribution).reduce(
                    (a, b) => a + b,
                    0
                  )}{" "}
                  г
                </td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">
                  {Object.values(preview.remainingAfter).reduce(
                    (a, b) => a + b,
                    0
                  )}{" "}
                  г
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Состав продукта */}
        <div className="rounded-lg bg-muted p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
            Состав продукта
          </p>
          <div className="flex flex-wrap gap-2">
            {preview.product.composition.meat > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-900">
                Мясо: {preview.product.composition.meat}%
              </span>
            )}
            {preview.product.composition.muscularOrgans > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-900">
                Мышечные: {preview.product.composition.muscularOrgans}%
              </span>
            )}
            {preview.product.composition.meatOnBone > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900">
                Мясокостная: {preview.product.composition.meatOnBone}%
              </span>
            )}
            {preview.product.composition.hematopoieticOrgans > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-900">
                Кроветворные: {preview.product.composition.hematopoieticOrgans}%
              </span>
            )}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Отмена
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Добавить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

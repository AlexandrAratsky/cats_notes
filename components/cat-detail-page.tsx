"use client"

import { useState } from "react"

import { AddFeedingDialog } from "@/components/add-feeding-dialog"
import { FeedingJournalV2 } from "@/components/feeding-journal-v2"
import { Card, CardContent } from "@/components/ui/card"
import { calculateFeeding } from "@/lib/feeding-calculator"
import { getEffectiveWeight } from "@/lib/feeding-journal-storage-v2"
import type { CatConfig } from "@/lib/cats-config"

type CatDetailPageProps = {
  cat: CatConfig
}

export function CatDetailPage({ cat }: CatDetailPageProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showInfo, setShowInfo] = useState(true)

  function handleRefresh() {
    setRefreshKey((prev) => prev + 1)
  }

  const effectiveWeight = getEffectiveWeight(cat)
  const feedingResult = calculateFeeding(effectiveWeight)

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-medium">{cat.name}</h1>
          <p className="text-sm text-muted-foreground">Журнал кормления</p>
        </div>
        <AddFeedingDialog cat={cat} onSavedAction={handleRefresh} />
      </div>

      {/* Инфо-блок с весом и нормой */}
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Вес</span>
              <p className="font-medium">{effectiveWeight} кг</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">
                Суточная норма
              </span>
              <p className="font-medium">~{feedingResult.dailyGrams} г</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">За приём</span>
              <p className="font-medium">~{feedingResult.gramsPerMeal} г</p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showInfo ? "Скрыть" : "Показать"} детали
          </button>
        </CardContent>
        {showInfo && (
          <CardContent className="border-t pt-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {feedingResult.groups.map((group) => (
                <div key={group.key} className="flex justify-between">
                  <span className="text-muted-foreground">{group.label}:</span>
                  <span className="tabular-nums">
                    {group.dailyGrams} г/день
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Журнал кормления */}
      <div className="flex flex-col gap-2">
        <h2 className="font-medium">История кормлений</h2>
        <FeedingJournalV2 cat={cat} refreshKey={refreshKey} />
      </div>
    </div>
  )
}

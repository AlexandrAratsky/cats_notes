"use client"

import { useState } from "react"

import { CatFeedingCalculator } from "@/components/cat-feeding-calculator"
import { FeedingForm } from "@/components/cat-feeding-form"
import { FeedingJournalV2 } from "@/components/feeding-journal-v2"
import type { CatConfig } from "@/lib/cats-config"

type CatDetailPageProps = {
  cat: CatConfig
}

export function CatDetailPage({ cat }: CatDetailPageProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  function handleRefresh() {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-lg font-medium">{cat.name}</h1>
        <p className="text-sm text-muted-foreground">
          Расчёт рациона и журнал кормления по группам продуктов
        </p>
      </div>

      <CatFeedingCalculator
        catId={cat.id}
        initialWeightKg={cat.weightKg}
        onCalculationSaved={handleRefresh}
      />

      <FeedingForm cat={cat} onSaved={handleRefresh} />

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Журнал кормления</h2>
        <FeedingJournalV2 cat={cat} refreshKey={refreshKey} />
      </div>
    </div>
  )
}

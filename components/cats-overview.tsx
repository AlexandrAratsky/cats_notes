"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CatConfig } from "@/lib/cats-config"
import { formatDateTime } from "@/lib/format-date"
import { getCatStatus } from "@/lib/feeding-journal-storage"

type CatsOverviewProps = {
  cats: CatConfig[]
}

type CatCardStatus = {
  lastFeedingText: string
  lastNormText: string
}

function buildStatus(catId: string): CatCardStatus {
  const status = getCatStatus(catId)

  return {
    lastFeedingText: status.lastFeeding
      ? formatDateTime(status.lastFeeding.createdAt)
      : "Нет данных",
    lastNormText: status.lastCalculation
      ? `~${status.lastCalculation.dailyGrams} г/день`
      : "Нет данных",
  }
}

export function CatsOverview({ cats }: CatsOverviewProps) {
  const [statusByCatId, setStatusByCatId] = useState<
    Record<string, CatCardStatus>
  >({})

  useEffect(() => {
    setStatusByCatId(
      Object.fromEntries(
        cats.map((cat) => [cat.id, buildStatus(cat.id)])
      )
    )
  }, [cats])

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-medium">Все кошки</h1>
        <p className="text-sm text-muted-foreground">
          Текущее состояние кормления по каждой кошке.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {cats.map((cat) => {
          const status = statusByCatId[cat.id]

          return (
            <Link key={cat.id} href={`/?cat=${cat.id}`} className="block">
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                  <CardDescription>
                    Последнее кормление:{" "}
                    {status?.lastFeedingText ?? "Загрузка…"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Норма: {status?.lastNormText ?? "Загрузка…"}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

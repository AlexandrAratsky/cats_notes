"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { CatConfig } from "@/lib/cats-config"
import { calculateFeeding, type FeedingResult } from "@/lib/feeding-calculator"
import {
  getEffectiveWeight,
  setLastWeight,
} from "@/lib/feeding-journal-storage-v2"

type CatWeightState = {
  weight: string
  result: FeedingResult | null
}

type CalculatorPageProps = {
  cats: CatConfig[]
}

const GROUP_LABELS: Record<string, string> = {
  meat: "Мясо",
  muscularOrgans: "Мышечные органы",
  meatOnBone: "Мясокостная",
  hematopoieticOrgans: "Кроветворные",
}

const GROUP_EXAMPLES: Record<string, string> = {
  meat: "Говядина, курица, индейка",
  muscularOrgans: "Сердце, желудки",
  meatOnBone: "Шеи, спинки, крылья",
  hematopoieticOrgans: "Печень, почки, лёгкое",
}

export function CalculatorPage({ cats }: CalculatorPageProps) {
  const [weights, setWeights] = useState<Record<string, CatWeightState>>(() => {
    const initial: Record<string, CatWeightState> = {}
    cats.forEach((cat) => {
      const weight = getEffectiveWeight(cat)
      initial[cat.id] = {
        weight: String(weight),
        result: calculateFeeding(weight),
      }
    })
    return initial
  })

  function handleWeightChange(catId: string, value: string) {
    setWeights((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        weight: value,
        result: null,
      },
    }))
  }

  function handleCalculate(catId: string) {
    const weightStr = weights[catId]?.weight
    if (!weightStr) return

    const weight = Number(weightStr.replace(",", "."))
    if (!Number.isFinite(weight) || weight <= 0 || weight > 15) return

    setWeights((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        result: calculateFeeding(weight),
      },
    }))
    setLastWeight(catId, weight)
  }

  function handleCalculateAll() {
    const updated: Record<string, CatWeightState> = {}
    cats.forEach((cat) => {
      const weightStr = weights[cat.id]?.weight
      if (weightStr) {
        const weight = Number(weightStr.replace(",", "."))
        if (Number.isFinite(weight) && weight > 0 && weight <= 15) {
          setLastWeight(cat.id, weight)
          updated[cat.id] = {
            weight: weightStr,
            result: calculateFeeding(weight),
          }
        } else {
          updated[cat.id] = weights[cat.id]
        }
      } else {
        updated[cat.id] = weights[cat.id]
      }
    })
    setWeights(updated)
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-lg font-medium">Калькулятор кормления</h1>
        <p className="text-sm text-muted-foreground">
          Внесите вес каждой кошки и нажмите «Рассчитать всё» для получения
          суточных норм
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Веса кошек</CardTitle>
          <CardDescription>
            Суточная норма — 2% от веса, разделённая по четырем группам
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {cats.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="w-24 font-medium">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0.5}
                    max={15}
                    step={0.1}
                    value={weights[cat.id]?.weight ?? "4.5"}
                    onChange={(e) => handleWeightChange(cat.id, e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">кг</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCalculate(cat.id)}
                >
                  Рассчитать
                </Button>
              </div>
            ))}
          </div>
          <Button className="mt-4" onClick={handleCalculateAll}>
            Рассчитать всё
          </Button>
        </CardContent>
      </Card>

      {cats.some((cat) => weights[cat.id]?.result) && (
        <Card>
          <CardHeader>
            <CardTitle>Расчёт норм по кошкам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Кошка / Группа</TableHead>
                    <TableHead className="text-right">Доля</TableHead>
                    <TableHead className="text-right">В день</TableHead>
                    <TableHead className="text-right">За приём</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cats.map((cat) => {
                    const result = weights[cat.id]?.result
                    if (!result) return null

                    return (
                      <TableRow key={cat.id} className="bg-muted/30">
                        <TableCell colSpan={4} className="font-medium">
                          {cat.name}: ~{result.dailyGrams} г в день (по{" "}
                          {result.gramsPerMeal} г × 2)
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <h3 className="mt-6 mb-2 font-medium">Детально по группам</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Группа / Кошка</TableHead>
                    {cats.map((cat) => (
                      <TableHead key={cat.id} className="text-right">
                        {cat.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    "meat",
                    "muscularOrgans",
                    "meatOnBone",
                    "hematopoieticOrgans",
                  ].map((groupKey) => (
                    <TableRow key={groupKey}>
                      <TableCell>
                        <div>
                          <span className="font-medium">
                            {GROUP_LABELS[groupKey]}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {GROUP_EXAMPLES[groupKey]}
                          </span>
                        </div>
                      </TableCell>
                      {cats.map((cat) => {
                        const result = weights[cat.id]?.result
                        const group = result?.groups.find(
                          (g) => g.key === groupKey
                        )
                        return (
                          <TableCell key={cat.id} className="text-right">
                            {group ? (
                              <div>
                                <span className="tabular-nums">
                                  {group.dailyGrams} г/день
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

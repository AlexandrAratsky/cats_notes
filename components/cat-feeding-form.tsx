"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { FeedingPreviewCard } from "@/components/feeding-preview"
import { ProductSelector } from "@/components/product-selector"
import {
  addFeedingEntry,
  calculateFeedingPreview,
  getDailySummary,
  getTodayDate,
  type FeedingPreview,
  type GroupDistribution,
} from "@/lib/feeding-journal-storage-v2"
import { calculateFeeding, type FeedingResult } from "@/lib/feeding-calculator"
import { getEffectiveWeight } from "@/lib/feeding-journal-storage-v2"
import type { CatConfig } from "@/lib/cats-config"
import type { Product } from "@/lib/products"

type FeedingFormProps = {
  cat: CatConfig
  onSavedAction: () => void
}

const MIN_GRAMS = 1
const MAX_GRAMS = 500

function validateGrams(value: string): string | null {
  if (!value.trim()) {
    return "Введите вес"
  }

  const grams = Number(value.replace(",", "."))

  if (!Number.isFinite(grams)) {
    return "Введите число"
  }

  if (grams < MIN_GRAMS) {
    return `Минимум ${MIN_GRAMS} г`
  }

  if (grams > MAX_GRAMS) {
    return `Максимум ${MAX_GRAMS} г`
  }

  return null
}

export function FeedingForm({ cat, onSavedAction }: FeedingFormProps) {
  // === State ===
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [grams, setGrams] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // === Derived state для preview ===
  const feedingResult = calculateFeeding(getEffectiveWeight(cat))
  const currentDay = getDailySummary(cat.id, getTodayDate())
  const currentConsumed = currentDay.totals

  const preview: FeedingPreview | null =
    selectedProduct && !error && grams
      ? calculateFeedingPreview(
          selectedProduct,
          Number(grams),
          currentConsumed,
          targetGramsFromResult(feedingResult)
        )
      : null

  // === Handlers ===
  function handleCalculate() {
    const gramsError = validateGrams(grams)

    if (gramsError) {
      setError(gramsError)
      setShowPreview(false)
      return
    }

    if (!selectedProduct) {
      setError("Выберите продукт")
      setShowPreview(false)
      return
    }

    setError(null)
    setShowPreview(true)
  }

  function handleConfirm() {
    if (!selectedProduct || error) {
      return
    }

    addFeedingEntry(cat.id, {
      product: selectedProduct,
      totalGrams: Number(grams),
      note,
    })

    // Reset form
    setSelectedProduct(null)
    setGrams("")
    setNote("")
    setError(null)
    setShowPreview(false)
    onSavedAction()
  }

  function handleCancel() {
    setShowPreview(false)
  }

  // === Render ===
  return (
    <Card>
      <CardHeader>
        <CardTitle>Добавить кормление</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Выбор продукта */}
        <FieldGroup>
          <Field>
            <FieldLabel>Продукт</FieldLabel>
            <ProductSelector
              selectedProduct={selectedProduct}
              onSelect={(product) => {
                setSelectedProduct(product)
                setShowPreview(false)
              }}
            />
          </Field>

          <Field data-invalid={error ? true : undefined}>
            <FieldLabel>Вес</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type="number"
                inputMode="decimal"
                min={MIN_GRAMS}
                max={MAX_GRAMS}
                step="1"
                placeholder="50"
                value={grams}
                onChange={(e) => {
                  setGrams(e.target.value)
                  setError(null)
                  setShowPreview(false)
                }}
              />
              <InputGroupAddon>г</InputGroupAddon>
            </InputGroup>
            {error && <FieldError>{error}</FieldError>}
          </Field>

          <Field>
            <FieldLabel>Заметка (необязательно)</FieldLabel>
            <InputGroup>
              <InputGroupInput
                type="text"
                placeholder="Например: утренний приём"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </InputGroup>
          </Field>
        </FieldGroup>

        {/* Preview */}
        {showPreview && preview && (
          <FeedingPreviewCard
            preview={preview}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </CardContent>

      {!showPreview && (
        <CardFooter className="justify-end">
          <Button
            onClick={handleCalculate}
            disabled={!selectedProduct || !grams}
          >
            Рассчитать и добавить
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// === Helpers ===

function targetGramsFromResult(result: FeedingResult): GroupDistribution {
  return {
    meat: result.groups.find((g) => g.key === "meat")?.dailyGrams ?? 0,
    muscularOrgans:
      result.groups.find((g) => g.key === "muscularOrgans")?.dailyGrams ?? 0,
    meatOnBone:
      result.groups.find((g) => g.key === "meatOnBone")?.dailyGrams ?? 0,
    hematopoieticOrgans:
      result.groups.find((g) => g.key === "hematopoieticOrgans")?.dailyGrams ??
      0,
  }
}

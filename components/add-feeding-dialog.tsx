"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { ProductSelector } from "@/components/product-selector"
import { addFeedingEntry } from "@/lib/feeding-journal-storage-v2"
import type { CatConfig } from "@/lib/cats-config"
import type { Product } from "@/lib/products"

type AddFeedingDialogProps = {
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

export function AddFeedingDialog({
  cat,
  onSavedAction,
}: AddFeedingDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [grams, setGrams] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleClose() {
    setOpen(false)
    setSelectedProduct(null)
    setGrams("")
    setError(null)
  }

  function handleSave() {
    const gramsError = validateGrams(grams)

    if (gramsError) {
      setError(gramsError)
      return
    }

    if (!selectedProduct) {
      setError("Выберите продукт")
      return
    }

    setSaving(true)
    addFeedingEntry(cat.id, {
      product: selectedProduct,
      totalGrams: Number(grams),
    })

    handleClose()
    onSavedAction()
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button">Добавить кормление</Button>}
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить кормление — {cat.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Продукт</FieldLabel>
              <ProductSelector
                selectedProduct={selectedProduct}
                onSelect={(product) => {
                  setSelectedProduct(product)
                  if (error) setError(null)
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
                    if (error) setError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSave()
                    }
                  }}
                />
                <InputGroupAddon>г</InputGroupAddon>
              </InputGroup>
              {error && <FieldError>{error}</FieldError>}
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedProduct || !grams || saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

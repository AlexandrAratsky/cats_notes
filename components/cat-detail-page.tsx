"use client"

import { useState } from "react"

import { CatFeedingCalculator } from "@/components/cat-feeding-calculator"
import { CatFeedingJournal } from "@/components/cat-feeding-journal"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import type { CatConfig } from "@/lib/cats-config"
import { addFeedingEntry } from "@/lib/feeding-journal-storage"

type CatDetailPageProps = {
  cat: CatConfig
}

function validateGrams(value: string): string | null {
  if (!value.trim()) {
    return "Введите количество корма"
  }

  const grams = Number(value.replace(",", "."))

  if (!Number.isFinite(grams)) {
    return "Введите корректное число"
  }

  if (grams <= 0) {
    return "Количество должно быть больше нуля"
  }

  if (grams > 500) {
    return "Введите значение до 500 г"
  }

  return null
}

export function CatDetailPage({ cat }: CatDetailPageProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [grams, setGrams] = useState("")
  const [note, setNote] = useState("")
  const [feedingError, setFeedingError] = useState<string | null>(null)

  function handleJournalRefresh() {
    setRefreshKey((current) => current + 1)
  }

  function handleFeedingSave() {
    const validationError = validateGrams(grams)

    if (validationError) {
      setFeedingError(validationError)
      return
    }

    addFeedingEntry(cat.id, {
      grams: Number(grams.replace(",", ".")),
      note: note.trim() || undefined,
    })

    setGrams("")
    setNote("")
    setFeedingError(null)
    handleJournalRefresh()
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-medium">{cat.name}</h1>
        <p className="text-sm text-muted-foreground">
          Калькулятор и журнал кормления.
        </p>
      </div>

      <CatFeedingCalculator
        catId={cat.id}
        initialWeightKg={cat.weightKg}
        onCalculationSaved={handleJournalRefresh}
      />

      <Card>
        <CardHeader>
          <CardTitle>Записать кормление</CardTitle>
          <CardDescription>
            Отметьте, сколько корма вы дали кошке.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={feedingError ? true : undefined}>
              <FieldLabel htmlFor={`feeding-grams-${cat.id}`}>
                Количество
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={`feeding-grams-${cat.id}`}
                  type="number"
                  inputMode="decimal"
                  min={1}
                  max={500}
                  step="1"
                  placeholder="50"
                  value={grams}
                  aria-invalid={feedingError ? true : undefined}
                  onChange={(event) => {
                    setGrams(event.target.value)
                    if (feedingError) {
                      setFeedingError(null)
                    }
                  }}
                />
              </InputGroup>
              <FieldDescription>В граммах</FieldDescription>
              {feedingError ? <FieldError>{feedingError}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor={`feeding-note-${cat.id}`}>
                Заметка
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={`feeding-note-${cat.id}`}
                  type="text"
                  placeholder="Утренний приём"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </InputGroup>
              <FieldDescription>Необязательно</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="button" onClick={handleFeedingSave}>
            Записать кормление
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Журнал</CardTitle>
          <CardDescription>
            Расчёты и кормления, новые записи сверху.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CatFeedingJournal catId={cat.id} refreshKey={refreshKey} />
        </CardContent>
      </Card>
    </div>
  )
}

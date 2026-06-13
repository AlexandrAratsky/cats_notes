"use client"

import { useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  calculateFeeding,
  type FeedingResult,
} from "@/lib/feeding-calculator"

const MIN_WEIGHT_KG = 0.5
const MAX_WEIGHT_KG = 15

function validateWeight(value: string): string | null {
  if (!value.trim()) {
    return "Введите вес кошки"
  }

  const weight = Number(value.replace(",", "."))

  if (!Number.isFinite(weight)) {
    return "Введите корректное число"
  }

  if (weight <= 0) {
    return "Вес должен быть больше нуля"
  }

  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return `Введите вес от ${MIN_WEIGHT_KG} до ${MAX_WEIGHT_KG} кг`
  }

  return null
}

function formatResult(result: FeedingResult): string {
  if (result.note) {
    return result.note
  }

  return `~${result.dailyGrams} г в день (${result.mealsPerDay} приёма по ~${result.gramsPerMeal} г)`
}

export function CatFeedingCalculator() {
  const [weight, setWeight] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FeedingResult | null>(null)

  function handleCalculate() {
    const validationError = validateWeight(weight)

    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }

    const weightKg = Number(weight.replace(",", "."))
    setError(null)
    setResult(calculateFeeding(weightKg))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Калькулятор кормления</CardTitle>
        <CardDescription>
          Введите вес кошки, чтобы узнать суточную норму корма.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FieldGroup>
          <Field data-invalid={error ? true : undefined}>
            <FieldLabel htmlFor="cat-weight">Вес кошки</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="cat-weight"
                type="number"
                inputMode="decimal"
                min={MIN_WEIGHT_KG}
                max={MAX_WEIGHT_KG}
                step="0.1"
                placeholder="4.5"
                value={weight}
                aria-invalid={error ? true : undefined}
                onChange={(event) => {
                  setWeight(event.target.value)
                  if (error) {
                    setError(null)
                  }
                }}
              />
              <InputGroupAddon align="inline-end">кг</InputGroupAddon>
            </InputGroup>
            <FieldDescription>Например: 4.5</FieldDescription>
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
        </FieldGroup>

        {result ? (
          <Alert>
            <AlertTitle>Результат</AlertTitle>
            <AlertDescription>{formatResult(result)}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="button" onClick={handleCalculate}>
          Рассчитать
        </Button>
      </CardFooter>
    </Card>
  )
}

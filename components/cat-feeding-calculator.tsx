"use client"

import { useEffect, useState } from "react"

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
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  calculateFeeding,
  type FeedingGroupId,
  type FeedingResult,
} from "@/lib/feeding-calculator"
import {
  addCalculationEntry,
  getGroupMeatPreferences,
  getLastWeight,
  setGroupMeatPreferences,
  type GroupMeatPreferences,
} from "@/lib/feeding-journal-storage"
import {
  isMeatTypeWithIcon,
  MEAT_TYPES,
  type MeatTypeId,
} from "@/lib/meat-types"
import { HugeiconsIcon } from "@hugeicons/react"

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

type GroupMeatToggleProps = {
  groupId: FeedingGroupId
  value?: MeatTypeId
  onValueChange: (groupId: FeedingGroupId, meatId?: MeatTypeId) => void
}

function GroupMeatToggle({ groupId, value, onValueChange }: GroupMeatToggleProps) {
  return (
    <ToggleGroup
      value={value ? [value] : []}
      onValueChange={(nextValue) => {
        onValueChange(groupId, nextValue[0] as MeatTypeId | undefined)
      }}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="Тип мяса"
    >
      {MEAT_TYPES.map((meat) => (
        <Tooltip key={meat.id}>
          <TooltipTrigger
            render={
              <ToggleGroupItem value={meat.id} aria-label={meat.label} />
            }
          >
            {isMeatTypeWithIcon(meat) ? (
              <HugeiconsIcon icon={meat.icon} data-icon />
            ) : (
              <span className="text-xs font-medium">
                {"shortLabel" in meat ? meat.shortLabel : meat.label}
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent>{meat.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}

type FeedingResultDisplayProps = {
  result: FeedingResult
  groupMeats: GroupMeatPreferences
  onGroupMeatChange: (groupId: FeedingGroupId, meatId?: MeatTypeId) => void
}

function FeedingResultDisplay({
  result,
  groupMeats,
  onGroupMeatChange,
}: FeedingResultDisplayProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        Суточная норма:{" "}
        <span className="font-medium">~{result.dailyGrams} г</span> (2% от веса)
        <br />
        Утром и вечером:{" "}
        <span className="font-medium">
          ~{result.gramsPerMeal} г за приём
        </span>
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium">Группа</th>
              <th className="px-3 py-2 font-medium text-right">Доля</th>
              <th className="px-3 py-2 font-medium text-right">В день</th>
              <th className="px-3 py-2 font-medium text-right">За приём</th>
              <th className="px-3 py-2 font-medium">Мясо</th>
            </tr>
          </thead>
          <tbody>
            {result.groups.map((group) => (
              <tr key={group.id} className="border-b last:border-b-0">
                <td className="px-3 py-2">
                  <span className="font-medium">{group.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {group.examples}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {group.percentage}%
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  ~{group.dailyGrams} г
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  ~{group.gramsPerMeal} г
                </td>
                <td className="px-3 py-2">
                  <GroupMeatToggle
                    groupId={group.id}
                    value={groupMeats[group.id]}
                    onValueChange={onGroupMeatChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type CatFeedingCalculatorProps = {
  catId: string
  initialWeightKg: number
  onCalculationSaved?: () => void
}

export function CatFeedingCalculator({
  catId,
  initialWeightKg,
  onCalculationSaved,
}: CatFeedingCalculatorProps) {
  const [weight, setWeight] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FeedingResult | null>(null)
  const [groupMeats, setGroupMeats] = useState<GroupMeatPreferences>({})

  useEffect(() => {
    const savedWeight = getLastWeight(catId)
    const effectiveWeight = savedWeight ?? initialWeightKg
    setWeight(String(effectiveWeight))
    setGroupMeats(getGroupMeatPreferences(catId))
  }, [catId, initialWeightKg])

  function handleGroupMeatChange(groupId: FeedingGroupId, meatId?: MeatTypeId) {
    setGroupMeats((current) => {
      const next = { ...current }

      if (meatId) {
        next[groupId] = meatId
      } else {
        delete next[groupId]
      }

      setGroupMeatPreferences(catId, next)
      return next
    })
  }

  function handleCalculate() {
    const validationError = validateWeight(weight)

    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }

    const weightKg = Number(weight.replace(",", "."))
    const feedingResult = calculateFeeding(weightKg)

    setError(null)
    setResult(feedingResult)

    addCalculationEntry(catId, {
      weightKg,
      dailyGrams: feedingResult.dailyGrams,
      mealsPerDay: feedingResult.mealsPerDay,
      gramsPerMeal: feedingResult.gramsPerMeal,
      groups: feedingResult.groups,
      groupMeats,
    })

    onCalculationSaved?.()
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Калькулятор кормления</CardTitle>
          <CardDescription>
            Суточная норма — 2% от веса натуралки, разделённой на четыре группы.
            Кормление утром и вечером.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor={`cat-weight-${catId}`}>Вес кошки</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={`cat-weight-${catId}`}
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
              <AlertDescription>
                <FeedingResultDisplay
                  result={result}
                  groupMeats={groupMeats}
                  onGroupMeatChange={handleGroupMeatChange}
                />
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="button" onClick={handleCalculate}>
            Рассчитать
          </Button>
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}

import { CatFeedingCalculator } from "@/components/cat-feeding-calculator"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex w-full max-w-md min-w-0 flex-col gap-4">
        <div>
          <h1 className="font-medium">Норма корма для кошки</h1>
          <p className="text-sm text-muted-foreground">
            Рассчитайте, сколько корма нужно вашему питомцу в день.
          </p>
        </div>
        <CatFeedingCalculator />
      </div>
    </div>
  )
}

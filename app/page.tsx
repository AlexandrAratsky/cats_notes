import { Suspense } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CalculatorPage } from "@/components/calculator-page"
import { CatDetailPage } from "@/components/cat-detail-page"
import { CatsOverview } from "@/components/cats-overview"
import { getCatById, getCats } from "@/lib/cats-config"

type PageProps = {
  searchParams: Promise<{ cat?: string; view?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const { cat: catId, view } = params
  const cats = getCats()

  if (view === "calculator") {
    return (
      <Suspense fallback={null}>
        <CalculatorPage cats={cats} />
      </Suspense>
    )
  }

  if (!catId) {
    return (
      <Suspense fallback={null}>
        <CatsOverview cats={cats} />
      </Suspense>
    )
  }

  const cat = getCatById(catId)

  if (!cat) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Кошка не найдена</AlertTitle>
        <AlertDescription>
          Проверьте адрес или выберите кошку в меню слева.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Suspense fallback={null}>
      <CatDetailPage cat={cat} />
    </Suspense>
  )
}

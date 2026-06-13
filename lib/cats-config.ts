import catsData from "@/config/cats.json"

export type CatConfig = {
  id: string
  name: string
  weightKg: number
}

export function getCats(): CatConfig[] {
  return catsData.cats
}

export function getCatById(id: string): CatConfig | undefined {
  return getCats().find((cat) => cat.id === id)
}

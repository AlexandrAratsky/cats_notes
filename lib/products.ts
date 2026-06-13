/**
 * Система продуктов с распределением по группам кормления
 *
 * Каждый продукт имеет состав — распределение веса по 4 группам:
 * - meat: мясо (говядина, индейка, курица, филе)
 * - muscularOrgans: мышечные органы (сердце, желудки, лёгкое, рубец)
 * - meatOnBone: мясокостная (шеи, головы, каркасы птицы, хвосты)
 * - hematopoieticOrgans: кровотворные органы (печень, почки, селезёнка)
 *
 * Сумма всех составляющих должна равняться 100%
 */

export const PRODUCT_CATEGORIES = [
  { id: "beef", label: "Говядина" },
  { id: "chicken", label: "Курица" },
  { id: "turkey", label: "Индейка" },
  { id: "pork", label: "Свинина" },
  { id: "rabbit", label: "Кролик" },
  { id: "fish", label: "Рыба" },
] as const

export type ProductCategoryId = (typeof PRODUCT_CATEGORIES)[number]["id"]

export type ProductComposition = {
  meat: number // %
  muscularOrgans: number // %
  meatOnBone: number // %
  hematopoieticOrgans: number // %
}

export type Product = {
  id: string
  name: string
  category: ProductCategoryId
  composition: ProductComposition
}

/**
 * Базовый набор продуктов с предустановленным распределением
 * Пользователь может редактировать их состав в настройках
 */
export const DEFAULT_PRODUCTS: Product[] = [
  // === МЯСО 100% ===
  {
    id: "beef-meat",
    name: "Говядина (мякоть)",
    category: "beef",
    composition: {
      meat: 100,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "chicken-breast",
    name: "Куриное филе",
    category: "chicken",
    composition: {
      meat: 100,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "chicken-thigh-meat",
    name: "Куриное бедро (без кости)",
    category: "chicken",
    composition: {
      meat: 100,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "turkey-fillet",
    name: "Индейка (филе)",
    category: "turkey",
    composition: {
      meat: 100,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "pork-meat",
    name: "Свинина (мякоть)",
    category: "pork",
    composition: {
      meat: 100,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "rabbit-meat",
    name: "Кролик (мякоть)",
    category: "rabbit",
    composition: {
      meat: 100,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },

  // === МЫШЕЧНЫЕ ОРГАНЫ 100% ===
  {
    id: "beef-heart",
    name: "Говяжье сердце",
    category: "beef",
    composition: {
      meat: 0,
      muscularOrgans: 100,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "chicken-hearts",
    name: "Куриные сердечки",
    category: "chicken",
    composition: {
      meat: 0,
      muscularOrgans: 100,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "chicken-stomachs",
    name: "Куриные желудки",
    category: "chicken",
    composition: {
      meat: 0,
      muscularOrgans: 100,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "turkey-hearts",
    name: "Индюшачьи сердца",
    category: "turkey",
    composition: {
      meat: 0,
      muscularOrgans: 100,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "beef-lung",
    name: "Говяжье лёгкое",
    category: "beef",
    composition: {
      meat: 0,
      muscularOrgans: 100,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "beef-tripe",
    name: "Говяжий рубец",
    category: "beef",
    composition: {
      meat: 0,
      muscularOrgans: 100,
      meatOnBone: 0,
      hematopoieticOrgans: 0,
    },
  },

  // === КРОВЕТВОРНЫЕ ОРГАНЫ 100% ===
  {
    id: "beef-liver",
    name: "Говяжья печень",
    category: "beef",
    composition: {
      meat: 0,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 100,
    },
  },
  {
    id: "chicken-liver",
    name: "Куриная печень",
    category: "chicken",
    composition: {
      meat: 0,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 100,
    },
  },
  {
    id: "beef-kidney",
    name: "Говяжьи почки",
    category: "beef",
    composition: {
      meat: 0,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 100,
    },
  },
  {
    id: "beef-spleen",
    name: "Говяжья селезёнка",
    category: "beef",
    composition: {
      meat: 0,
      muscularOrgans: 0,
      meatOnBone: 0,
      hematopoieticOrgans: 100,
    },
  },

  // === МЯСОКОСТНАЯ (смешанная) ===
  {
    id: "chicken-neck",
    name: "Куриные шейки",
    category: "chicken",
    composition: {
      meat: 20,
      muscularOrgans: 0,
      meatOnBone: 80,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "chicken-carcass",
    name: "Куриный каркас",
    category: "chicken",
    composition: {
      meat: 15,
      muscularOrgans: 0,
      meatOnBone: 85,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "chicken-wing",
    name: "Куриное крыло",
    category: "chicken",
    composition: {
      meat: 30,
      muscularOrgans: 0,
      meatOnBone: 70,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "turkey-neck",
    name: "Индюшачья шея",
    category: "turkey",
    composition: {
      meat: 25,
      muscularOrgans: 0,
      meatOnBone: 75,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "turkey-head",
    name: "Голова индейки",
    category: "turkey",
    composition: {
      meat: 15,
      muscularOrgans: 0,
      meatOnBone: 75,
      hematopoieticOrgans: 10,
    },
  },
  {
    id: "beef-tail",
    name: "Говяжий хвост",
    category: "beef",
    composition: {
      meat: 20,
      muscularOrgans: 0,
      meatOnBone: 80,
      hematopoieticOrgans: 0,
    },
  },
  {
    id: "chicken-back",
    name: "Куриная спинка",
    category: "chicken",
    composition: {
      meat: 25,
      muscularOrgans: 0,
      meatOnBone: 75,
      hematopoieticOrgans: 0,
    },
  },
] as const

// Проверка корректности default продуктов
function validateProductComposition(product: Product): boolean {
  const sum =
    product.composition.meat +
    product.composition.muscularOrgans +
    product.composition.meatOnBone +
    product.composition.hematopoieticOrgans
  return sum === 100
}

// Валидация при загрузке
for (const product of DEFAULT_PRODUCTS) {
  if (!validateProductComposition(product)) {
    console.warn(
      `Некорректный состав продукта ${product.id}: сумма не равна 100%`
    )
  }
}

const PRODUCTS_KEY = "cats-notes:products"

function isBrowser() {
  return typeof window !== "undefined"
}

/**
 * Получить список всех продуктов (из localStorage или дефолтные)
 */
export function getProducts(): Product[] {
  if (!isBrowser()) {
    return [...DEFAULT_PRODUCTS]
  }

  const raw = window.localStorage.getItem(PRODUCTS_KEY)

  if (!raw) {
    return [...DEFAULT_PRODUCTS]
  }

  try {
    const parsed = JSON.parse(raw) as Product[]

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {
    // Игнорируем ошибку парсинга
  }

  return [...DEFAULT_PRODUCTS]
}

/**
 * Сохранить список продуктов
 */
export function saveProducts(products: Product[]) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))
}

/**
 * Получить продукт по ID
 */
export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

/**
 * Сбросить продукты к дефолтным значениям
 */
export function resetProductsToDefaults() {
  saveProducts([...DEFAULT_PRODUCTS])
}

/**
 * Обновить состав продукта
 */
export function updateProductComposition(
  productId: string,
  newComposition: ProductComposition
): boolean {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === productId)

  if (index === -1) {
    return false
  }

  const sum =
    newComposition.meat +
    newComposition.muscularOrgans +
    newComposition.meatOnBone +
    newComposition.hematopoieticOrgans

  if (sum !== 100) {
    return false
  }

  products[index] = { ...products[index], composition: newComposition }
  saveProducts(products)
  return true
}

/**
 * Рассчитать распределение веса продукта по группам
 */
export function calculateProductDistribution(
  product: Product,
  totalGrams: number
): Record<keyof ProductComposition, number> {
  return {
    meat: Math.round((totalGrams * product.composition.meat) / 100),
    muscularOrgans: Math.round(
      (totalGrams * product.composition.muscularOrgans) / 100
    ),
    meatOnBone: Math.round((totalGrams * product.composition.meatOnBone) / 100),
    hematopoieticOrgans: Math.round(
      (totalGrams * product.composition.hematopoieticOrgans) / 100
    ),
  }
}

/**
 * Получить продукты по категории
 */
export function getProductsByCategory(
  categoryId: ProductCategoryId
): Product[] {
  return getProducts().filter((p) => p.category === categoryId)
}

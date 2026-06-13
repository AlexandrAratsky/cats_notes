"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getProducts,
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategoryId,
} from "@/lib/products"
import { cn } from "@/lib/utils"

import { HugeiconsIcon } from "@hugeicons/react"
import { SearchIcon } from "@hugeicons/core-free-icons"

type ProductSelectorProps = {
  selectedProduct: Product | null
  onSelect: (product: Product) => void
  className?: string
}

export function ProductSelector({
  selectedProduct,
  onSelect,
  className,
}: ProductSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategoryId | null>(null)

  const products = useMemo(() => getProducts(), [open])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = search
        ? product.name.toLowerCase().includes(search.toLowerCase())
        : true
      const matchesCategory = selectedCategory
        ? product.category === selectedCategory
        : true
      return matchesSearch && matchesCategory
    })
  }, [products, search, selectedCategory])

  const groupedByCategory = useMemo(() => {
    const groups = new Map<ProductCategoryId, Product[]>()
    for (const product of filteredProducts) {
      const existing = groups.get(product.category) ?? []
      existing.push(product)
      groups.set(product.category, existing)
    }
    return groups
  }, [filteredProducts])

  function handleSelect(product: Product) {
    onSelect(product)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              className
            )}
          >
            {selectedProduct ? (
              <span>{selectedProduct.name}</span>
            ) : (
              <span className="text-muted-foreground">Выберите продукт...</span>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col gap-2 p-3">
          <div className="relative">
            <HugeiconsIcon
              icon={SearchIcon}
              className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Поиск продукта..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedCategory === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Все
            </Button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() =>
                  setSelectedCategory(
                    cat.id === selectedCategory ? null : cat.id
                  )
                }
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
        <ScrollArea className="h-64 px-3 pb-3">
          {filteredProducts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Продукты не найдены
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {Array.from(groupedByCategory.entries()).map(
                ([categoryId, categoryProducts]) => {
                  const category = PRODUCT_CATEGORIES.find(
                    (c) => c.id === categoryId
                  )
                  return (
                    <div key={categoryId} className="flex flex-col gap-1">
                      <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        {category?.label}
                      </p>
                      {categoryProducts.map((product) => (
                        <Button
                          key={product.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleSelect(product)}
                        >
                          <span className="truncate">{product.name}</span>
                        </Button>
                      ))}
                    </div>
                  )
                }
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

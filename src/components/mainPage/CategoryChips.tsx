import type { CategoryModel } from '../../Models/CategoryModel'

interface CategoryChipsProps {
  categories: CategoryModel[]
  activeCategory: CategoryModel | null
  searchQuery?: string
  onCategoryClick: (category: CategoryModel, categoryIndex: number) => void
}
export const CategoryChips = ({ categories, activeCategory, searchQuery = "", onCategoryClick }: CategoryChipsProps) => {
  const normalizedSearchQuery = searchQuery.toLowerCase().trim()

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto overflow-y-hidden no-scrollbar items-center min-h-11">
      {categories.map((category: CategoryModel, categoryIndex: number) => {
        const hasVisibleItem = normalizedSearchQuery.length === 0
          ? category.items.length > 0
          : category.items.some(item => item.name.toLowerCase().includes(normalizedSearchQuery))

        if (!hasVisibleItem) {
          return <span key={category.id} />
        }

        return (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category, categoryIndex)}
            className={`active:scale-95 shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              activeCategory === category ? 'border-primary bg-primary text-white' : 'border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-foreground dark:text-zinc-200' }`}
            style={{ lineHeight: 1.2 }}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}


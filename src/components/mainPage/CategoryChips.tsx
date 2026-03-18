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
    <div className="flex gap-2 px-4 py-2 overflow-x-auto overflow-y-visible no-x-scrollbar items-center min-h-11">
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
            className={`active:scale-90 shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              activeCategory === category ? 'border-primary bg-primary text-white dark:text-black' : 'border-primary dark:border-primary bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200' }`}
            style={{ lineHeight: 1.2 }}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}

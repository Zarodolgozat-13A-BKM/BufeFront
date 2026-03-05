import type { CategoryModel } from '../../models/CategoryModel'

interface CategoryChipsProps {
  categories: CategoryModel[]
  activeCategory: CategoryModel | null
  onCategoryClick: (category: CategoryModel, categoryId: string) => void
}

export const CategoryChips = ({ categories, activeCategory, onCategoryClick }: CategoryChipsProps) => {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto overflow-y-visible no-x-scrollbar items-center min-h-11">
      {categories.map((category: CategoryModel) => (
        category.items.length > 0 && (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category, category.id.toString())}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
              activeCategory?.id === category.id ? 'border-orange-500 bg-orange-500 text-white dark:text-black' : 'border-orange-500 dark:border-orange-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200' }`}
            style={{ lineHeight: 1.2 }}
          >
            {category.name}
          </button>
        )
      ))}
    </div>
  )
}

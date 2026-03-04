import type { CategoryModel } from '../../models/CategoryModel'

interface CategoryChipsProps {
  categories: CategoryModel[]
  activeCategory: CategoryModel | null
  onCategoryClick: (category: CategoryModel, categoryId: string) => void
}

export const CategoryChips = ({ categories, activeCategory, onCategoryClick }: CategoryChipsProps) => {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto overflow-y-visible no-x-scrollbar items-center min-h-[44px]">
      {categories.map((category: CategoryModel) => (
        <button
          key={category.id}
          onClick={() => onCategoryClick(category, category.id.toString())}
          className={`flex-shrink-0 px-3 py-1.5 bg-gray-500 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
            activeCategory?.id === category.id ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200' }`}
          style={{ lineHeight: 1.2 }}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}

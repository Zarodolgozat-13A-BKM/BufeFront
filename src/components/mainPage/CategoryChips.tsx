import type { CategoryModel } from '../../Models/CategoryModel'

interface CategoryChipsProps {
  categories: CategoryModel[]
  activeCategory: CategoryModel | null
  onCategoryClick: (category: CategoryModel, categoryIndex: number) => void
}
export const CategoryChips = ({ categories, activeCategory, onCategoryClick }: CategoryChipsProps) => {
  return (
    console.log('Rendering CategoryChips with categories:', categories, 'and activeCategory:', activeCategory),
    <div className="flex gap-2 px-4 py-2 overflow-x-auto overflow-y-visible no-x-scrollbar items-center min-h-11">
      {categories.map((category: CategoryModel, categoryIndex: number) => (
        category.items.length > 0 && (
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
      ))}
    </div>
  )
}

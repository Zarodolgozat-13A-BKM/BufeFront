import type { CategoryModel } from '../../Models/CategoryModel'
import type { ItemModel } from '../../Models/ItemModel'
import ItemsTable from './ItemsTable'
import { Fragment, useState, type ReactNode } from 'react'

type SortDir = 'asc' | 'desc'

interface CategoriesTableProps {
    sortedCategories: CategoryModel[]
    categories: CategoryModel[]
    catSortField: keyof CategoryModel
    catSortDir: SortDir
    handleCatSort: (field: keyof CategoryModel) => void
    itemSortField: keyof ItemModel
    itemSortDir: SortDir
    handleItemSort: (field: keyof ItemModel) => void
    handleItemStatusToggle: (id: number, field: 'is_active' | 'is_featured') => void
    handleItemDelete: (item: ItemModel) => void
    setSelectedItem: (item: ItemModel) => void
    setCreateItemOpen: (open: boolean) => void
    sortIcon: (field: string, activeField: string, dir: SortDir) => ReactNode
    setSelectedCategory: (cat: CategoryModel) => void
    setCreateCategoryOpen: (open: boolean) => void
    handleCatDelete: (cat: CategoryModel) => void
}

const CategoriesTable = ({
    sortedCategories,
    categories,
    catSortField,
    catSortDir,
    handleCatSort,
    itemSortField,
    itemSortDir,
    handleItemSort,
    handleItemStatusToggle,
    handleItemDelete,
    setSelectedItem,
    setCreateItemOpen,
    sortIcon,
    setSelectedCategory,
    setCreateCategoryOpen,
    handleCatDelete

}: CategoriesTableProps) => {
    const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(new Set())

    const getRowKey = (category: CategoryModel, index: number) => `${String(category.id)}-${category.name}-${index}`

    const sortItems = (items: ItemModel[], field: keyof ItemModel, dir: SortDir) => {
        return [...items].sort((a, b) => {
            const aVal = a[field]
            const bVal = b[field]
            if (aVal == null || bVal == null) return 0
            if (aVal < bVal) return dir === 'asc' ? -1 : 1
            if (aVal > bVal) return dir === 'asc' ? 1 : -1
            return 0
        })
    }

    const toggleExpanded = (rowKey: string) => {
        setExpandedRowKeys((current) => {
            const next = new Set(current)
            if (next.has(rowKey)) {
                next.delete(rowKey)
            } else {
                next.add(rowKey)
            }
            return next
        })
    }

    const toggleAllExpanded = () => {
        setExpandedRowKeys((current) => {
            if (current.size === sortedCategories.length && sortedCategories.length > 0) {
                return new Set()
            }

            const next = new Set<string>()
            sortedCategories.forEach((category, index) => {
                next.add(getRowKey(category, index))
            })
            return next
        })
    }

    const allExpanded = sortedCategories.length > 0 && expandedRowKeys.size === sortedCategories.length

    return (
        <div className="overflow-x-auto rounded-xl border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800">
            <table className="w-full min-w-full text-sm text-left border-collapse">
            <thead className="bg-surface dark:bg-zinc-800/80 border-b border-[#e6e0db] dark:border-zinc-700 text-foreground dark:text-zinc-200">
                <tr className="h-10">
                    <th
                        className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center"
                        onClick={toggleAllExpanded}
                    >
                        ID {allExpanded ? '▼' : '▶'}
                    </th>
                    <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px]" onClick={() => handleCatSort('name')}>Név{sortIcon('name', catSortField, catSortDir)}</th>
                    <th className="py-2 px-3 font-semibold uppercase tracking-wide text-[11px] text-center">Termékek száma</th>
                    <th className="py-2 px-3 font-semibold uppercase tracking-wide text-[11px] text-end">Műveletek</th>
                </tr>
            </thead>
            <tbody>
                {sortedCategories.map((category, index) => {
                    const rowKey = getRowKey(category, index)
                    const isExpanded = expandedRowKeys.has(rowKey)

                    return (
                        <Fragment key={rowKey}>
                            <tr onClick={() => toggleExpanded(rowKey)} className="h-14 cursor-pointer border-b border-[#e6e0db] dark:border-zinc-700 hover:bg-surface dark:hover:bg-zinc-800/80 transition-colors">
                                <td className="py-2 px-3 text-center text-muted dark:text-zinc-400 font-medium whitespace-nowrap">
                                    <span className="mr-2 text-xs">{isExpanded ? '▼' : '▶'}</span>
                                    {category.id}
                                </td>
                                <td className="py-2 px-3 font-medium text-foreground dark:text-white">{category.name}</td>
                                <td className="py-2 px-3 text-foreground dark:text-white text-center">{category.items.length}</td>
                                <td className="py-2 px-3">
                                    <div className="flex gap-2 float-end">
                                        <button
                                            className="px-2.5 py-1.5 text-xs rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors font-semibold"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedCategory(category)
                                                setCreateCategoryOpen(true)
                                            }}
                                        >
                                            Módosítás
                                        </button>
                                        <button
                                            className="px-2.5 py-1.5 text-xs rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-semibold"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleCatDelete(category)
                                            }}
                                        >
                                            Törlés
                                        </button>
                                    </div>
                                </td>
                            </tr>

                            {isExpanded && (
                                <tr className="bg-surface dark:bg-zinc-900/70 border-b border-[#e6e0db] dark:border-zinc-700">
                                    <td colSpan={4} className="px-4 py-3">
                                        {category.items.length === 0 ? (
                                            <p className="text-sm text-muted dark:text-zinc-400">Nincs termék ebben a kategóriában.</p>
                                        ) : (
                                            <ItemsTable
                                                sortedItems={sortItems(category.items, itemSortField, itemSortDir)}
                                                categories={categories}
                                                itemSortField={itemSortField}
                                                itemSortDir={itemSortDir}
                                                handleItemSort={handleItemSort}
                                                handleItemStatusToggle={handleItemStatusToggle}
                                                handleItemDelete={handleItemDelete}
                                                setSelectedItem={setSelectedItem}
                                                setCreateItemOpen={setCreateItemOpen}
                                                sortIcon={sortIcon}
                                            />
                                        )}
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    )
                })}
            </tbody>
            </table>
        </div>
    )
}

export default CategoriesTable


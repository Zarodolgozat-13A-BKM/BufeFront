import type { CategoryModel } from '../../Models/CategoryModel'
import type { ItemModel } from '../../Models/ItemModel'
import type { ReactNode } from 'react'

type SortDir = 'asc' | 'desc'

interface ItemsTableProps {
    sortedItems: ItemModel[]
    categories: CategoryModel[]
    itemSortField: keyof ItemModel
    itemSortDir: SortDir
    handleItemSort: (field: keyof ItemModel) => void
    handleItemStatusToggle: (id: number, field: 'is_active' | 'is_featured') => void
    handleItemDelete: (item: ItemModel) => void
    setSelectedItem: (item: ItemModel) => void
    setCreateItemOpen: (open: boolean) => void
    sortIcon: (field: string, activeField: string, dir: SortDir) => ReactNode
}

const ItemsTable = ({
    sortedItems,
    itemSortField,
    itemSortDir,
    categories,
    handleItemSort,
    handleItemStatusToggle,
    handleItemDelete,
    setSelectedItem,
    setCreateItemOpen,
    sortIcon,
}: ItemsTableProps) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-primary/15">
            <table className="w-full text-sm text-left border-collapse min-w-245">
                <thead className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 text-gray-700 dark:text-gray-200">
                <tr className="h-10">
                    <th className="py-2 px-3 text-center font-semibold uppercase tracking-wide text-[11px] ">Kép</th>
                    <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleItemSort('name')}>Név{sortIcon('name', itemSortField, itemSortDir)}</th>
                    <th className="py-2 px-3 font-semibold uppercase tracking-wide text-[11px] text-center">Leírás</th>
                    <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleItemSort('price')}>Ár (Ft){sortIcon('price', itemSortField, itemSortDir)}</th>
                    <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleItemSort('category_id')}>Kategória{sortIcon('category_id', itemSortField, itemSortDir)}</th>
                    <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleItemSort('is_active')}>Aktív{sortIcon('is_active', itemSortField, itemSortDir)}</th>
                    <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleItemSort('is_featured')}>Kiemelt{sortIcon('is_featured', itemSortField, itemSortDir)}</th>
                    <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleItemSort('default_time_to_deliver')}>Átfutási idő (perc){sortIcon('default_time_to_deliver', itemSortField, itemSortDir)}</th>
                    <th className="py-2 px-3 font-semibold uppercase tracking-wide text-[11px] text-center">Műveletek</th>
                </tr>
            </thead>
            <tbody>
                {sortedItems.map((item: ItemModel) => (
                    <tr key={item.id} className="h-14 border-b border-primary/10 dark:border-primary/20 hover:bg-orange-50/70 dark:hover:bg-zinc-800/80 transition-colors">
                        <td className="py-2 px-3 text-center">
                            {item.picture_url
                                ? <img src={item.picture_url} alt={item.name} className="mx-auto w-10 h-10 object-cover rounded-lg border border-primary/15" />
                                : <span className="text-gray-400 dark:text-gray-600">—</span>
                            }
                        </td>
                        <td className="py-2 px-3 font-medium text-black dark:text-white text-center">{item.name}</td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400 max-w-xs truncate text-center" title={item.description ?? ''}>{item.description ?? '—'}</td>
                        <td className="py-2 px-3 text-black dark:text-white font-medium text-center">{item.price}</td>
                        <td className="py-2 px-3 text-black dark:text-white text-center">{categories.find((x) => x.id === item.category_id)?.name ?? 'Ismeretlen'}</td>
                        <td className="py-2 px-3 text-center" onClick={() => handleItemStatusToggle(item.id, 'is_active')}>
                            <span className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                                {item.is_active ? 'Igen' : 'Nem'}
                            </span>
                        </td>
                        <td className="py-2 px-3 text-center" onClick={() => handleItemStatusToggle(item.id, 'is_featured')}>
                            <span className={`cursor-pointer px-2.5 py-1 rounded-full text-xs font-semibold ${item.is_featured ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                {item.is_featured ? 'Igen' : 'Nem'}
                            </span>
                        </td>
                        <td className="py-2 px-3 text-black dark:text-white text-center">{item.default_time_to_deliver}</td>
                        <td className="py-2 px-3 text-center">
                            <div className="flex justify-center gap-2">
                                <button
                                    className="px-2.5 py-1.5 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-semibold"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedItem(item)
                                        setCreateItemOpen(true)
                                    }}
                                >
                                    Módosítás
                                </button>
                                <button
                                    className="px-2.5 py-1.5 text-xs rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-semibold"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleItemDelete(item)
                                    }}
                                >
                                    Törlés
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
    )
}

export default ItemsTable

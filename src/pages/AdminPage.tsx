import { useState, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setCategories } from '../store/categorySlice'
import type { CategoryModel } from '../Models/CategoryModel'
import type { ItemModel } from '../Models/ItemModel'
import { GetAllCategories } from '../services/CategoryService'
import { CreateItemModal } from '../components/modals/CreateItemModal'

type SortDir = 'asc' | 'desc'

const AdminPage = () => {
    const dispatch = useAppDispatch()
    const categories = useAppSelector((state) => state.category.categories)
    const items = useAppSelector((state) => state.category.categories.flatMap((c) => c.items))

    const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)

    const handleItemCreated = async () => {
        const updated = await GetAllCategories()
        dispatch(setCategories(updated))
    }

    const [catSortField, setCatSortField] = useState<keyof CategoryModel>('id')
    const [catSortDir, setCatSortDir] = useState<SortDir>('asc')

    const [itemSortField, setItemSortField] = useState<keyof ItemModel>('id')
    const [itemSortDir, setItemSortDir] = useState<SortDir>('asc')

    const handleCatSort = (field: keyof CategoryModel) => {
        if (field === catSortField) {
            setCatSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setCatSortField(field)
            setCatSortDir('asc')
        }
    }

    const handleItemSort = (field: keyof ItemModel) => {
        if (field === itemSortField) {
            setItemSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        } else {
            setItemSortField(field)
            setItemSortDir('asc')
        }
    }

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => {
            const aVal = a[catSortField]
            const bVal = b[catSortField]
            if (aVal == null || bVal == null) return 0
            if (aVal < bVal) return catSortDir === 'asc' ? -1 : 1
            if (aVal > bVal) return catSortDir === 'asc' ? 1 : -1
            return 0
        })
    }, [categories, catSortField, catSortDir])

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
            const aVal = a[itemSortField]
            const bVal = b[itemSortField]
            if (aVal == null || bVal == null) return 0
            if (aVal < bVal) return itemSortDir === 'asc' ? -1 : 1
            if (aVal > bVal) return itemSortDir === 'asc' ? 1 : -1
            return 0
        })
    }, [items, itemSortField, itemSortDir])

    const sortIcon = (field: string, activeField: string, dir: SortDir) => {
        if (field !== activeField) return <span className="ml-1 opacity-30">↕</span>
        return <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>
    }

  return (
    <div className="p-4 dark:bg-gray-800 overflow-x-auto">
      <h1 className="text-3xl font-bold text-primary dark:text-white mb-4">Admin Page</h1>

      <div className="flex gap-8 items-start">

        <div className="min-w-fit">
          <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Kategóriák</h2>
          <table className="text-sm text-left border-collapse mb-8">
        <thead className="border-b-2 border-primary/30 text-black dark:text-white">
          <tr className="h-10">
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleCatSort('id')}>ID{sortIcon('id', catSortField, catSortDir)}</th>
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleCatSort('name')}>Név{sortIcon('name', catSortField, catSortDir)}</th>
            <th className="py-2 pr-4">Termékek száma</th>
            <th className="py-2">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map((category) => (
            <tr key={category.id} className="h-14 border-b border-primary/10 dark:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
              <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{category.id}</td>
              <td className="py-2 pr-4 font-medium text-black dark:text-white">{category.name}</td>
              <td className="py-2 pr-4 text-black dark:text-white">{category.items.length}</td>
              <td className="py-2 flex gap-2">
                <button className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Edit</button>
                <button className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-primary dark:text-white">Termékek</h2>
            <button
              onClick={() => setIsCreateItemOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              Termék hozzáadása
            </button>
          </div>
          <table className="w-full text-sm text-left border-collapse">
        <thead className="border-b-2 border-primary/30 text-black dark:text-white">
          <tr className="h-10">
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleItemSort('id')}>ID{sortIcon('id', itemSortField, itemSortDir)}</th>
            <th className="py-2 pr-4">Kép</th>
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleItemSort('name')}>Név{sortIcon('name', itemSortField, itemSortDir)}</th>
            <th className="py-2 pr-4">Leírás</th>
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleItemSort('price')}>Ár (Ft){sortIcon('price', itemSortField, itemSortDir)}</th>
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleItemSort('category_id')}>Kategória{sortIcon('category_id', itemSortField, itemSortDir)}</th>
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleItemSort('is_active')}>Aktív{sortIcon('is_active', itemSortField, itemSortDir)}</th>
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleItemSort('is_featured')}>Kiemelt{sortIcon('is_featured', itemSortField, itemSortDir)}</th>
            <th className="py-2 pr-4 cursor-pointer select-none" onClick={() => handleItemSort('default_time_to_deliver')}>Átfutási idő (perc){sortIcon('default_time_to_deliver', itemSortField, itemSortDir)}</th>
            <th className="py-2">Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <tr key={item.id} className="h-14 border-b border-primary/10 dark:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
              <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">{item.id}</td>
              <td className="py-2 pr-4">
                {item.picture_url
                  ? <img src={item.picture_url} alt={item.name} className="w-10 h-10 object-cover rounded" />
                  : <span className="text-gray-400 dark:text-gray-600">—</span>
                }
              </td>
              <td className="py-2 pr-4 font-medium text-black dark:text-white">{item.name}</td>
              <td className="py-2 pr-4 text-gray-500 dark:text-gray-400 max-w-xs truncate" title={item.description ?? ''}>{item.description ?? '—'}</td>
              <td className="py-2 pr-4 text-black dark:text-white font-medium">{item.price}</td>
              <td className="py-2 pr-4 text-black dark:text-white">{item.category_id}</td>
              <td className="py-2 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                  {item.is_active ? 'Igen' : 'Nem'}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.is_featured ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {item.is_featured ? 'Igen' : 'Nem'}
                </span>
              </td>
              <td className="py-2 pr-4 text-black dark:text-white">{item.default_time_to_deliver}</td>
              <td className="py-2 flex gap-2">
                <button className="px-2 py-1 text-xs rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Edit</button>
                <button className="px-2 py-1 text-xs rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>

      </div>

      <CreateItemModal
        isOpen={isCreateItemOpen}
        onClose={() => setIsCreateItemOpen(false)}
        categories={categories}
        onCreated={handleItemCreated}
      />
    </div>
  )
}

export default AdminPage

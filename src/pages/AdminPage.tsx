import { useState, useMemo, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setCategories } from '../store/categorySlice'
import type { CategoryModel } from '../Models/CategoryModel'
import type { ItemModel } from '../Models/ItemModel'
import { DeleteCategory, GetAllCategories } from '../services/CategoryService'
import { CreateItemModal } from '../components/modals/CreateItemModal'
import CategoriesTable from '../components/adminPage/CategoriesTable'
import ItemsTable from '../components/adminPage/ItemsTable'
import { DeleteItem, ToggleActive, ToggleFeatured } from '../services/ItemService'
import { CreateCatModal } from '../components/modals/CreateCatModal'
import OrdersTable from '../components/adminPage/OrdersTable'
import type { OrderModel } from '../Models/OrderModel'
import { setOrders } from '../store/orderSlice'
import { GetAllOrders, UpdateOrderStatus } from '../services/OrderService'
type SortDir = 'asc' | 'desc'

const AdminPage = () => {
  const dispatch = useAppDispatch()
  const categories = useAppSelector((state) => state.category.categories)
  const items = useAppSelector((state) => state.category.categories.flatMap((c) => c.items))
  const [CategoryTableVisible, setCategoryTableVisible] = useState(true)
  const [ItemTableVisible, setItemTableVisible] = useState(true)
  const [orderTableVisible, setOrderTableVisible] = useState(true)
  const orders = useAppSelector((state) => state.order.orders ?? [])
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false)
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItemModel | undefined>(undefined)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await GetAllOrders()
        dispatch(setOrders(data))
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      }
    }
    fetchOrders()
    UpdateOrderStatus(1, 'completed')
  }, [])

  const handleItemStatusToggle = async (id: number, field: 'is_active' | 'is_featured') => {
    if (field === 'is_active') {
      await ToggleActive(id.toString())
    } else {
      await ToggleFeatured(id.toString())
    }
    const updated = await GetAllCategories()
    dispatch(setCategories(updated))
  }

  const handleItemCreated = async () => {
    const updated = await GetAllCategories()
    dispatch(setCategories(updated))
  }

  const handleItemDelete = async (item: ItemModel) => {
    await DeleteItem(item.id.toString())
    const updated = await GetAllCategories()
    dispatch(setCategories(updated))
  }

  const handleCatDelete = async (cat: CategoryModel) => {
    DeleteCategory(cat.id.toString())
    const updated = await GetAllCategories()
    dispatch(setCategories(updated))
  }

  const handleCatCreated = async () => {
    const updated = await GetAllCategories()
    dispatch(setCategories(updated))
  }

  const [catSortField, setCatSortField] = useState<keyof CategoryModel>('id')
  const [catSortDir, setCatSortDir] = useState<SortDir>('asc')
  const [selectedCategory, setSelectedCategory] = useState<CategoryModel | undefined>(undefined)
  const [itemSortField, setItemSortField] = useState<keyof ItemModel>('id')
  const [itemSortDir, setItemSortDir] = useState<SortDir>('asc')

  type SortableOrderField = 'id' | 'user_id' | 'order_identifier_number' | 'status' | 'delivery_date'
  const [orderSortField, setOrderSortField] = useState<SortableOrderField>('id')
  const [orderSortDir, setOrderSortDir] = useState<SortDir>('asc')

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

  const handleOrderSort = (field: SortableOrderField) => {
    if (field === orderSortField) {
      setOrderSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setOrderSortField(field)
      setOrderSortDir('asc')
    }
  }


  const handleOrderStatusChange = async (order: OrderModel, status: string) => {
    try {
      const updated = await UpdateOrderStatus(order.id, status)
      const orders = await GetAllOrders()
      dispatch(setOrders(orders))
    } catch (error) {
      console.error('Failed to update order status:', error)
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

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const aVal = a[orderSortField]
      const bVal = b[orderSortField]
      if (aVal == null || bVal == null) return 0
      if (aVal < bVal) return orderSortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return orderSortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [orders, orderSortField, orderSortDir])

  const sortIcon = (field: string, activeField: string, dir: SortDir) => {
    if (field !== activeField) return <span className="ml-1 text-[11px] opacity-35">↕</span>
    return <span className="ml-1 text-[11px] text-primary">{dir === 'asc' ? '▲' : '▼'}</span>
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/60 to-white dark:from-zinc-900 dark:to-zinc-950 p-4 md:p-6 overflow-x-auto">
      <div className="mx-auto max-w-375 space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-5 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kategóriák, termékek és rendelések kezelése egy helyen.</p>
            </div>
            <div className="flex items-center gap-2">
              <span onClick={() => setCategoryTableVisible(!CategoryTableVisible)} className="cursor-pointer hover:bg-primary/25 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {categories.length} kategória
              </span>
              <span onClick={() => setItemTableVisible(!ItemTableVisible)} className="cursor-pointer hover:bg-primary/25 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {items.length} termék
              </span>
              <span onClick={() => setOrderTableVisible(!orderTableVisible)} className="cursor-pointer hover:bg-primary/25 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {orders.length} rendelés
              </span>
            </div>
          </div>
        </div>

        {CategoryTableVisible && (
          <div className="w-full xl:w-full rounded-2xl border border-primary/20 bg-white dark:bg-zinc-900 shadow-sm p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">Kategóriák</h2>
              <button
                onClick={() => {
                  setSelectedCategory(undefined)
                  setIsCreateCategoryOpen(true)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-sm hover:shadow"
              >
                <span className="text-base">+</span>
                Kategória hozzáadása
              </button>
            </div>
            <CategoriesTable sortedCategories={sortedCategories} categories={categories} catSortField={catSortField} catSortDir={catSortDir} handleCatSort={handleCatSort} itemSortField={itemSortField} itemSortDir={itemSortDir}
              handleItemSort={handleItemSort}
              handleItemStatusToggle={handleItemStatusToggle}
              sortIcon={sortIcon}
              handleCatDelete={handleCatDelete}
              setSelectedCategory={setSelectedCategory}
              setCreateCategoryOpen={setIsCreateCategoryOpen}
              setSelectedItem={setSelectedItem}
              setCreateItemOpen={setIsCreateItemOpen}
              handleItemDelete={handleItemDelete}
            />
          </div>)}
        {ItemTableVisible && (
          <div className="min-w-0 w-full flex-1 rounded-2xl border border-primary/20 bg-white dark:bg-zinc-900 shadow-sm p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-black dark:text-white">Termékek</h2>
              <button
                onClick={() => setIsCreateItemOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-sm hover:shadow"
              >
                <span className="text-base leading-none">+</span>
                Termék hozzáadása
              </button>
            </div>
            <ItemsTable
              handleItemStatusToggle={handleItemStatusToggle}
              sortedItems={sortedItems}
              itemSortField={itemSortField}
              itemSortDir={itemSortDir}
              categories={categories}
              handleItemSort={handleItemSort}
              sortIcon={sortIcon}
              setSelectedItem={setSelectedItem}
              setCreateItemOpen={setIsCreateItemOpen}
              handleItemDelete={handleItemDelete}
            />
          </div>
        )}
        {orderTableVisible && (
          <div className="min-w-0 w-full flex-1 rounded-2xl border border-primary/20 bg-white dark:bg-zinc-900 shadow-sm p-4 md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-black dark:text-white">Rendelések</h2>
            </div>
            <OrdersTable
              sortedOrders={sortedOrders}
              orderSortField={orderSortField}
              orderSortDir={orderSortDir}
              handleOrderSort={handleOrderSort}
              handleOrderStatusChange={handleOrderStatusChange}
              sortIcon={sortIcon}
            />
          </div>
        )}
      </div>

      <CreateItemModal
        isOpen={isCreateItemOpen}
        onClose={() => {
          setIsCreateItemOpen(false)
          setSelectedItem(undefined)
        }}
        categories={categories}
        onCreated={handleItemCreated}
        item={selectedItem}
      />
      <CreateCatModal
        isOpen={isCreateCategoryOpen}
        onClose={() => {
          setIsCreateCategoryOpen(false)
          setSelectedCategory(undefined)
        }}
        onCreated={handleCatCreated}
        category={selectedCategory}
      />
    </div>
  )
}

export default AdminPage

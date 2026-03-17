import type { ReactNode } from 'react'
import type { CategoryModel } from '../Models/CategoryModel'
import type { ItemModel } from '../Models/ItemModel'
import type { OrderModel } from '../Models/OrderModel'
import type { AppDispatch } from '../store/store'
import { setCategories } from '../store/categorySlice'
import { setOrders } from '../store/orderSlice'
import { DeleteCategory, GetAllCategories } from './CategoryService'
import { DeleteItem, ToggleActive, ToggleFeatured } from './ItemService'
import { GetAllOrders, GetStatuses, UpdateOrderStatus } from './OrderService'

export type SortDir = 'asc' | 'desc'
export type SortableOrderField = 'id' | 'user_id' | 'order_identifier_number' | 'status' | 'delivery_date' | 'total_price'

export const toggleSortDirection = <TField extends string>(
  currentField: TField,
  currentDir: SortDir,
  nextField: TField,
) => {
  if (nextField === currentField) {
    return {
      field: currentField,
      dir: currentDir === 'asc' ? 'desc' : 'asc',
    } as const
  }

  return {
    field: nextField,
    dir: 'asc' as const,
  }
}

const toComparable = (value: unknown): string | number => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  return String(value)
}

export const sortByField = <T, TField extends keyof T>(
  items: T[],
  field: TField,
  dir: SortDir,
) => {
  return [...items].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal == null || bVal == null) return 0
    const left = toComparable(aVal)
    const right = toComparable(bVal)

    if (left < right) return dir === 'asc' ? -1 : 1
    if (left > right) return dir === 'asc' ? 1 : -1
    return 0
  })
}

const getOrderSortValue = (order: OrderModel, field: SortableOrderField): string | number | null => {
  if (field === 'user_id') return order.user_username
  if (field === 'id') return order.id
  if (field === 'order_identifier_number') return order.order_identifier_number
  if (field === 'status') return order.status
  if (field === 'delivery_date') return order.delivery_date
  if (field === 'total_price') return order.total_price ?? 0
  return null
}

export const sortOrdersByField = (orders: OrderModel[], field: SortableOrderField, dir: SortDir) => {
  return [...orders].sort((a, b) => {
    const aVal = getOrderSortValue(a, field)
    const bVal = getOrderSortValue(b, field)

    if (aVal == null || bVal == null) return 0
    if (aVal < bVal) return dir === 'asc' ? -1 : 1
    if (aVal > bVal) return dir === 'asc' ? 1 : -1
    return 0
  })
}

export const getSortIcon = (field: string, activeField: string, dir: SortDir): ReactNode => {
  if (field !== activeField) return <span className="ml-1 text-[11px] opacity-35">↕</span>
  return <span className="ml-1 text-[11px] text-primary">{dir === 'asc' ? '▲' : '▼'}</span>
}

export const fetchAndSetOrders = async (dispatch: AppDispatch): Promise<void> => {
  const data = await GetAllOrders()
  dispatch(setOrders(data))
}

export const initializeAdminPage = async (dispatch: AppDispatch): Promise<void> => {
  await fetchAndSetCategories(dispatch)
  await fetchAndSetOrders(dispatch)
}

export const fetchAndSetCategories = async (dispatch: AppDispatch): Promise<void> => {
  const updated = await GetAllCategories()
  dispatch(setCategories(updated))
}

const ensureCategoryItems = (category: CategoryModel): CategoryModel => ({
  ...category,
  items: category.items ?? [],
})

const mergeCategoryLocal = (categories: CategoryModel[], category: CategoryModel): CategoryModel[] => {
  const normalized = ensureCategoryItems(category)
  const exists = categories.some((c) => c.id === normalized.id)

  if (!exists) {
    return [...categories, normalized]
  }

  return categories.map((c) => {
    if (c.id !== normalized.id) return c

    return {
      ...c,
      ...normalized,
      items: normalized.items.length > 0 ? normalized.items : c.items,
    }
  })
}

const upsertItemLocal = (categories: CategoryModel[], item: ItemModel): CategoryModel[] => {
  const withoutItem = categories.map((category) => ({
    ...category,
    items: category.items.filter((i) => i.id !== item.id),
  }))

  return withoutItem.map((category) => {
    if (category.id !== item.category_id) return category
    return {
      ...category,
      items: [...category.items, item],
    }
  })
}

export const handleItemStatusToggleAction = async (
  dispatch: AppDispatch,
  categories: CategoryModel[],
  id: number,
  field: 'is_active' | 'is_featured',
): Promise<void> => {
  if (field === 'is_active') {
    await ToggleActive(id.toString())
  } else {
    await ToggleFeatured(id.toString())
  }

  const updated = categories.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      if (item.id !== id) return item
      if (field === 'is_active') {
        return { ...item, is_active: !item.is_active }
      }
      return { ...item, is_featured: !item.is_featured }
    }),
  }))

  dispatch(setCategories(updated))
}

export const handleItemCreatedAction = async (
  dispatch: AppDispatch,
  categories: CategoryModel[],
  item: ItemModel,
): Promise<void> => {
  const optimistic = upsertItemLocal(categories, item)
  dispatch(setCategories(optimistic))
}

export const handleItemDeleteAction = async (
  dispatch: AppDispatch,
  categories: CategoryModel[],
  item: ItemModel,
): Promise<void> => {
  await DeleteItem(item.id.toString())

  const updated = categories.map((category) => ({
    ...category,
    items: category.items.filter((i) => i.id !== item.id),
  }))

  dispatch(setCategories(updated))
}

export const handleCategoryDeleteAction = async (
  dispatch: AppDispatch,
  categories: CategoryModel[],
  category: CategoryModel,
): Promise<void> => {
  await DeleteCategory(category.id.toString())

  const updated = categories.filter((c) => c.id !== category.id)
  dispatch(setCategories(updated))
}

export const handleCategoryCreatedAction = async (
  dispatch: AppDispatch,
  categories: CategoryModel[],
  category: CategoryModel,
): Promise<void> => {
  dispatch(setCategories(mergeCategoryLocal(categories, category)))

  await fetchAndSetCategories(dispatch)
}

export const handleOrderStatusChangeAction = async (
  dispatch: AppDispatch,
  orders: OrderModel[],
  order: OrderModel,
  status: string,
): Promise<void> => {
  const statuses = await GetStatuses()
  console.log('Available statuses:', statuses)
  const stat = statuses.find(s => s.name === status)?.id;
  await UpdateOrderStatus(order.id, stat? stat.toString() : status)

  const updated = orders.map((o) => {
    if (o.id !== order.id) return o
    return { ...o, status }
  })

  dispatch(setOrders(updated))
}

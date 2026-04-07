import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import type { CategoryModel } from '../Models/CategoryModel';
import type { ItemModel } from '../Models/ItemModel';
import { CreateItemModal } from '../components/modals/CreateItemModal';
import { StockArrivalModal } from '../components/modals/StockArrivalModal';
import CategoriesTable from '../components/adminPage/CategoriesTable';
import ItemsTable from '../components/adminPage/ItemsTable';
import { CreateCatModal } from '../components/modals/CreateCatModal';
import OrdersTable from '../components/adminPage/OrdersTable';
import type { OrderModel } from '../Models/OrderModel';
import DashBoardHeader from '../components/common/dashBoardHeader';
import { GetAllOrders, UpdateOrderStatus } from '../services/OrderService';
import { setOrders } from '../store/orderSlice';
import { setCategories } from '../store/categorySlice';
import {
	AdjustInventory,
	DeleteItem,
	ToggleActive,
	ToggleFeatured,
} from '../services/ItemService';
import { DeleteCategory, GetAllCategories } from '../services/CategoryService';

type SortDir = 'asc' | 'desc';
type SortableOrderField =
	| 'id'
	| 'user_id'
	| 'order_identifier_number'
	| 'status'
	| 'delivery_date'
	| 'total_price';

const toggleSortDirection = <TField extends string>(
	currentField: TField,
	currentDir: SortDir,
	nextField: TField,
) => {
	if (nextField === currentField) {
		return {
			field: currentField,
			dir: currentDir === 'asc' ? 'desc' : 'asc',
		} as const;
	}

	return { field: nextField, dir: 'asc' as const };
};

const toComparable = (value: unknown): string | number => {
	if (typeof value === 'number' || typeof value === 'string') return value;
	if (typeof value === 'boolean') return value ? 1 : 0;
	return String(value);
};

const sortByField = <T, TField extends keyof T>(
	items: T[],
	field: TField,
	dir: SortDir,
) => {
	return [...items].sort((a, b) => {
		const aVal = a[field];
		const bVal = b[field];

		if (aVal == null || bVal == null) return 0;
		const left = toComparable(aVal);
		const right = toComparable(bVal);

		if (left < right) return dir === 'asc' ? -1 : 1;
		if (left > right) return dir === 'asc' ? 1 : -1;
		return 0;
	});
};

const getOrderSortValue = (
	order: OrderModel,
	field: SortableOrderField,
): string | number | null => {
	if (field === 'user_id') return order.user_username;
	if (field === 'id') return order.id;
	if (field === 'order_identifier_number') return order.order_identifier_number;
	if (field === 'status') return order.status;
	if (field === 'delivery_date') return order.delivery_date;
	if (field === 'total_price') return order.total_price ?? 0;
	return null;
};

const sortOrdersByField = (
	orders: OrderModel[],
	field: SortableOrderField,
	dir: SortDir,
) => {
	return [...orders].sort((a, b) => {
		const aVal = getOrderSortValue(a, field);
		const bVal = getOrderSortValue(b, field);

		if (aVal == null || bVal == null) return 0;
		if (aVal < bVal) return dir === 'asc' ? -1 : 1;
		if (aVal > bVal) return dir === 'asc' ? 1 : -1;
		return 0;
	});
};

const getSortIcon = (
	field: string,
	activeField: string,
	dir: SortDir,
): ReactNode => {
	if (field !== activeField)
		return <span className='ml-1 text-[11px] opacity-35'>↕</span>;
	return (
		<span className='ml-1 text-[11px] text-primary'>
			{dir === 'asc' ? '▲' : '▼'}
		</span>
	);
};

const AdminPage = () => {
	const dispatch = useAppDispatch();
	const categories = useAppSelector((state) => state.category.categories);
	const items = useAppSelector((state) =>
		state.category.categories.flatMap((c) => c.items),
	);
	const [CategoryTableVisible, setCategoryTableVisible] = useState(true);
	const [ItemTableVisible, setItemTableVisible] = useState(false);
	const [orderTableVisible, setOrderTableVisible] = useState(false);
	const orders = useAppSelector((state) => state.order.orders ?? []);
	const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
	const [isStockArrivalOpen, setIsStockArrivalOpen] = useState(false);
	const [isSavingStockArrival, setIsSavingStockArrival] = useState(false);
	const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ItemModel | undefined>(
		undefined,
	);

	useEffect(() => {
		const bootstrapAdminPage = async () => {
			try {
				const [updatedCategories, updatedOrders] = await Promise.all([
					GetAllCategories(),
					GetAllOrders(),
				]);
				dispatch(setCategories(updatedCategories));
				dispatch(setOrders(updatedOrders));
			} catch (error) {
				console.error('Failed to fetch orders:', error);
			}
		};
		bootstrapAdminPage();
	}, [dispatch]);

	const handleItemStatusToggle = async (
		id: number,
		field: 'is_active' | 'is_featured',
	) => {
		if (field === 'is_active') {
			await ToggleActive(id);
		} else {
			await ToggleFeatured(id);
		}

		const updated = categories.map((category) => ({
			...category,
			items: category.items.map((item) => {
				if (item.id !== id) return item;
				if (field === 'is_active')
					return { ...item, is_active: !item.is_active };
				return { ...item, is_featured: !item.is_featured };
			}),
		}));

		dispatch(setCategories(updated));
	};

	const handleItemCreated = async (item: ItemModel) => {
		const updatedCategories = categories.map((category) => ({
			...category,
			items: category.items.filter(
				(existingItem) => existingItem.id !== item.id,
			),
		}));

		const targetCategoryIndex = updatedCategories.findIndex(
			(category) => category.id === item.category_id,
		);
		if (targetCategoryIndex >= 0) {
			updatedCategories[targetCategoryIndex] = {
				...updatedCategories[targetCategoryIndex],
				items: [...updatedCategories[targetCategoryIndex].items, item],
			};
		}

		dispatch(setCategories(updatedCategories));
	};

	const handleItemDelete = async (item: ItemModel) => {
		if (
			confirm(
				`Biztosan törölni szeretnéd a(z) "${item.name}" terméket? Ez a művelet nem visszavonható!`,
			)
		) {
			await DeleteItem(item.id);

			const updated = categories.map((category) => ({
				...category,
				items: category.items.filter(
					(existingItem) => existingItem.id !== item.id,
				),
			}));

			dispatch(setCategories(updated));
		}
	};

	const applyInventoryIncrements = async (
		changes: Array<{ itemId: number; increaseBy: number }>,
	) => {
		const payload = changes
			.filter((change) => change.increaseBy !== 0)
			.map((change) => ({ item_id: change.itemId, change: change.increaseBy }));

		if (payload.length === 0) return;

		const updatedItems = await AdjustInventory(payload);
		const itemsByCategoryId = new Map<number, ItemModel[]>();
		for (const item of updatedItems) {
			const existing = itemsByCategoryId.get(item.category_id) ?? [];
			existing.push(item);
			itemsByCategoryId.set(item.category_id, existing);
		}

		const updatedCategories = categories.map((category) => {
			const categoryUpdates = itemsByCategoryId.get(category.id);
			if (!categoryUpdates) {
				return category;
			}

			const updatesByItemId = new Map(
				categoryUpdates.map((item) => [item.id, item] as const),
			);
			const existingItemIds = category.items.map((item) => item.id);

			const mergedItems = category.items.map(
				(item) => updatesByItemId.get(item.id) ?? item,
			);

			for (const item of categoryUpdates) {
				if (!existingItemIds.includes(item.id)) {
					mergedItems.push(item);
				}
			}

			return { ...category, items: mergedItems };
		});
		dispatch(setCategories(updatedCategories));
	};

	const handleStockArrivalSubmit = async (
		changes: Array<{ itemId: number; increaseBy: number }>,
	) => {
		setIsSavingStockArrival(true);

		const decreases = changes.filter((change) => change.increaseBy < 0);
		if (decreases.length > 0) {
			const itemNames = decreases
				.map(
					(change) =>
						items.find((item) => item.id === change.itemId)?.name ??
						`#${change.itemId}`,
				)
				.join(', ');
			const isConfirmed = window.confirm(
				`Biztosan csökkenteni szeretnéd a készletet ezeknél: ${itemNames}?`,
			);

			if (!isConfirmed) {
				setIsSavingStockArrival(false);
				return;
			}
		}

		try {
			await applyInventoryIncrements(changes);
			setIsStockArrivalOpen(false);
		} finally {
			setIsSavingStockArrival(false);
		}
	};

	const handleCatDelete = async (cat: CategoryModel) => {
		if (
			confirm(
				`Biztosan törölni szeretnéd a "${cat.name}" kategóriát? Ez a művelet nem visszavonható, és minden termék, ami csak ehhez a kategóriához tartozik, szintén törlésre kerül!`,
			)
		) {
			await DeleteCategory(cat.id.toString());
			dispatch(
				setCategories(categories.filter((category) => category.id !== cat.id)),
			);
		}
	};

	const handleCatCreated = async (category: CategoryModel) => {
		const normalizedCategory = { ...category, items: category.items ?? [] };
		const exists = categories.some(
			(existingCategory) => existingCategory.id === normalizedCategory.id,
		);

		const optimistic = exists
			? categories.map((existingCategory) =>
					existingCategory.id !== normalizedCategory.id
						? existingCategory
						: {
								...existingCategory,
								...normalizedCategory,
								items:
									normalizedCategory.items.length > 0
										? normalizedCategory.items
										: existingCategory.items,
							},
				)
			: [...categories, normalizedCategory];

		dispatch(setCategories(optimistic));

		const refreshedCategories = await GetAllCategories();
		dispatch(setCategories(refreshedCategories));
	};

	const [catSortField, setCatSortField] = useState<keyof CategoryModel>('id');
	const [catSortDir, setCatSortDir] = useState<SortDir>('asc');
	const [selectedCategory, setSelectedCategory] = useState<
		CategoryModel | undefined
	>(undefined);
	const [itemSortField, setItemSortField] = useState<keyof ItemModel>('id');
	const [itemSortDir, setItemSortDir] = useState<SortDir>('asc');

	const [orderSortField, setOrderSortField] =
		useState<SortableOrderField>('id');
	const [orderSortDir, setOrderSortDir] = useState<SortDir>('asc');

	const handleCatSort = (field: keyof CategoryModel) => {
		const next = toggleSortDirection(catSortField, catSortDir, field);
		setCatSortField(next.field);
		setCatSortDir(next.dir);
	};

	const handleItemSort = (field: keyof ItemModel) => {
		const next = toggleSortDirection(itemSortField, itemSortDir, field);
		setItemSortField(next.field);
		setItemSortDir(next.dir);
	};

	const handleOrderSort = (field: SortableOrderField) => {
		const next = toggleSortDirection(orderSortField, orderSortDir, field);
		setOrderSortField(next.field);
		setOrderSortDir(next.dir);
	};

	const handleOrderStatusChange = async (order: OrderModel, status: string) => {
		try {
			await UpdateOrderStatus(order.id, status);

			const updated = orders.map((o) => {
				if (o.id !== order.id) return o;
				return { ...o, status };
			});

			dispatch(setOrders(updated));
		} catch (error) {
			console.error('Failed to update order status:', error);
		}
	};

	const sortedCategories = useMemo(() => {
		return sortByField(categories, catSortField, catSortDir);
	}, [categories, catSortField, catSortDir]);

	const sortedItems = useMemo(() => {
		return sortByField(items, itemSortField, itemSortDir);
	}, [items, itemSortField, itemSortDir]);

	const sortedOrders = useMemo(() => {
		return sortOrdersByField(orders, orderSortField, orderSortDir);
	}, [orders, orderSortField, orderSortDir]);

	return (
		<div className='bg-secondary dark:bg-secondary-dark font-display antialiased '>
			<div className='relative mx-auto flex w-full flex-col overflow-x-auto shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800'>
				<DashBoardHeader
					showAdmin={true}
					backTo='/main'
					name={
						<div className='rounded-xl p-4'>
							<div className='flex flex-wrap items-center justify-between'>
								<div>
									<h1 className='text-2xl text-center font-bold tracking-tight text-foreground dark:text-white mb-5'>
										Admin felület
									</h1>
									<div className='flex items-center gap-2 overflow-x-auto no-scrollbar'>
										<button
											onClick={() => {
												setCategoryTableVisible(true);
												setItemTableVisible(false);
												setOrderTableVisible(false);
											}}
											className={
												'shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ' +
												(CategoryTableVisible
													? 'border-primary bg-primary text-white'
													: 'border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-foreground dark:text-zinc-200')
											}>
											Kategóriák
										</button>
										<button
											onClick={() => {
												setCategoryTableVisible(false);
												setItemTableVisible(true);
												setOrderTableVisible(false);
											}}
											className={
												'shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ' +
												(ItemTableVisible
													? 'border-primary bg-primary text-white'
													: 'border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-foreground dark:text-zinc-200')
											}>
											Termékek
										</button>
										<button
											onClick={() => {
												setCategoryTableVisible(false);
												setItemTableVisible(false);
												setOrderTableVisible(true);
											}}
											className={
												'shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ' +
												(orderTableVisible
													? 'border-primary bg-primary text-white'
													: 'border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-foreground dark:text-zinc-200')
											}>
											Rendelések
										</button>
									</div>
								</div>
							</div>
						</div>
					}
				/>
				<div className='p-4 md:p-6 space-y-5'>
					{CategoryTableVisible && (
						<div className='w-full xl:w-full rounded-xl border border-[#e6e0db] bg-surface dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5'>
							<div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
								<h2 className='text-xl font-bold text-foreground dark:text-white'>
									Kategóriák ({categories.length})
								</h2>
								<button
									onClick={() => {
										setSelectedCategory(undefined);
										setIsCreateCategoryOpen(true);
									}}
									className='flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#e07b1a] transition-colors'>
									<span className='text-base leading-none'>+</span>
									Kategória hozzáadása
								</button>
							</div>
							<CategoriesTable
								sortedCategories={sortedCategories}
								categories={categories}
								catSortField={catSortField}
								catSortDir={catSortDir}
								handleCatSort={handleCatSort}
								itemSortField={itemSortField}
								itemSortDir={itemSortDir}
								handleItemSort={handleItemSort}
								handleItemStatusToggle={handleItemStatusToggle}
								sortIcon={getSortIcon}
								handleCatDelete={handleCatDelete}
								setSelectedCategory={setSelectedCategory}
								setCreateCategoryOpen={setIsCreateCategoryOpen}
								setSelectedItem={setSelectedItem}
								setCreateItemOpen={setIsCreateItemOpen}
								handleItemDelete={handleItemDelete}
							/>
						</div>
					)}
					{ItemTableVisible && (
						<div className='min-w-0 w-full flex-1 rounded-xl border border-[#e6e0db] bg-surface dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5'>
							<div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
								<h2 className='text-xl font-bold text-foreground dark:text-white'>
									Termékek ({items.length})
								</h2>
								<div className='flex items-center gap-2'>
									<button
										onClick={() => setIsStockArrivalOpen(true)}
										className='flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e6e0db] bg-white text-foreground font-semibold text-sm hover:bg-surface transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
										<span className='text-base leading-none'>+</span>
										Raktárkészlet frissítése
									</button>
									<button
										onClick={() => setIsCreateItemOpen(true)}
										className='flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#e07b1a] transition-colors'>
										<span className='text-base leading-none'>+</span>
										Termék hozzáadása
									</button>
								</div>
							</div>
							<ItemsTable
								handleItemStatusToggle={handleItemStatusToggle}
								sortedItems={sortedItems}
								itemSortField={itemSortField}
								itemSortDir={itemSortDir}
								categories={categories}
								handleItemSort={handleItemSort}
								sortIcon={getSortIcon}
								setSelectedItem={setSelectedItem}
								setCreateItemOpen={setIsCreateItemOpen}
								handleItemDelete={handleItemDelete}
							/>
						</div>
					)}
					{orderTableVisible && (
						<div className='min-w-0 w-full flex-1 rounded-xl border border-[#e6e0db] bg-surface dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5'>
							<div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
								<h2 className='text-xl font-bold text-foreground dark:text-white'>
									Rendelések ({orders.length})
								</h2>
							</div>
							<OrdersTable
								sortedOrders={sortedOrders}
								orderSortField={orderSortField}
								orderSortDir={orderSortDir}
								handleOrderSort={handleOrderSort}
								handleOrderStatusChange={handleOrderStatusChange}
								sortIcon={getSortIcon}
							/>
						</div>
					)}
				</div>

				<CreateItemModal
					isOpen={isCreateItemOpen}
					onClose={() => {
						setIsCreateItemOpen(false);
						setSelectedItem(undefined);
					}}
					categories={categories}
					onCreated={handleItemCreated}
					item={selectedItem}
				/>
				<StockArrivalModal
					isOpen={isStockArrivalOpen}
					onClose={() => setIsStockArrivalOpen(false)}
					items={items}
					isSaving={isSavingStockArrival}
					onSubmit={handleStockArrivalSubmit}
				/>
				<CreateCatModal
					isOpen={isCreateCategoryOpen}
					onClose={() => {
						setIsCreateCategoryOpen(false);
						setSelectedCategory(undefined);
					}}
					onCreated={handleCatCreated}
					category={selectedCategory}
				/>
			</div>
		</div>
	);
};

export default AdminPage;

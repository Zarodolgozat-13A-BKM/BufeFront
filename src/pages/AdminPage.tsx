import {
	useState,
	useMemo,
	useEffect,
	type ReactNode,
	useRef,
	useCallback,
} from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import type { CategoryModel } from '../Models/CategoryModel';
import type { InventoryAdjustment, ItemModel } from '../Models/ItemModel';
import { CreateItemModal } from '../modals/CreateItemModal';
import { EnableStockItemsModal } from '../modals/EnableStockItemsModal';
import { StockArrivalModal } from '../modals/StockArrivalModal';
import CategoriesTable from '../components/adminPage/CategoriesTable';
import ItemsTable from '../components/adminPage/ItemsTable';
import { CreateCatModal } from '../modals/CreateCatModal';
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
import Swal from 'sweetalert2';
import { getThemePreference } from '../services/themeService';
import { PaginationControls } from '../components/common/paginationCtrl';
type SortDir = 'asc' | 'desc';
type SortableOrderField =
	| 'id'
	| 'user_username'
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
	const theme = getThemePreference();
	const mobileMenuRef = useRef<HTMLDivElement | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [CategoryTableVisible, setCategoryTableVisible] = useState(true);
	const [ItemTableVisible, setItemTableVisible] = useState(false);
	const [orderTableVisible, setOrderTableVisible] = useState(false);
	const ordersResponse = useAppSelector((state) => state.order.orders);
	const orders = ordersResponse?.data ?? [];
	const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
	const [isEnableStockItemsOpen, setIsEnableStockItemsOpen] = useState(false);
	const [isEnablingStockItems, setIsEnablingStockItems] = useState(false);
	const [isStockArrivalOpen, setIsStockArrivalOpen] = useState(false);
	const [isSavingStockArrival, setIsSavingStockArrival] = useState(false);
	const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<ItemModel | undefined>(
		undefined,
	);
	const [orderPage, setOrderPage] = useState(1);
	const [orderSortField, setOrderSortField] =
		useState<SortableOrderField>('id');
	const [orderSortDir, setOrderSortDir] = useState<SortDir>('asc');
	const [ordersHasNextPage, setOrdersHasNextPage] = useState(false);
	const [isOrdersLoading, setIsOrdersLoading] = useState(false);
	const latestOrdersRequestIdRef = useRef(0);

	const fetchOrdersPage = useCallback(
		async (page: number, sortField: SortableOrderField, sortDir: SortDir) => {
			const sanitizedPage = Math.max(1, page);
			const requestId = latestOrdersRequestIdRef.current + 1;
			latestOrdersRequestIdRef.current = requestId;

			setIsOrdersLoading(true);

			try {
				const updatedOrders = await GetAllOrders(
					sanitizedPage,
					sortField,
					sortDir,
				);
				if (latestOrdersRequestIdRef.current !== requestId) return;

				dispatch(setOrders(updatedOrders));
				setOrdersHasNextPage(Boolean(updatedOrders.links.next));
			} catch (error) {
				if (latestOrdersRequestIdRef.current !== requestId) return;
				console.error('Failed to fetch orders:', error);
			} finally {
				if (latestOrdersRequestIdRef.current !== requestId) return;
				setIsOrdersLoading(false);
			}
		},
		[dispatch],
	);

	useEffect(() => {
		const bootstrapAdminPage = async () => {
			try {
				const updatedCategories = await GetAllCategories();
				dispatch(setCategories(updatedCategories));
			} catch (error) {
				console.error('Failed to fetch categories:', error);
			}
		};
		bootstrapAdminPage();
	}, [dispatch]);

	useEffect(() => {
		fetchOrdersPage(orderPage, orderSortField, orderSortDir);
	}, [fetchOrdersPage, orderPage, orderSortField, orderSortDir]);
	useEffect(() => {
		if (!isMobileMenuOpen) return;

		const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
			const target = event.target as Node | null;
			if (!target) return;
			if (mobileMenuRef.current?.contains(target)) return;
			setIsMobileMenuOpen(false);
		};

		window.addEventListener('mousedown', handleOutsideClick);
		window.addEventListener('touchstart', handleOutsideClick);

		return () => {
			window.removeEventListener('mousedown', handleOutsideClick);
			window.removeEventListener('touchstart', handleOutsideClick);
		};
	}, [isMobileMenuOpen]);

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
		const theme = getThemePreference();
		if (
			await Swal.fire({
				title: 'Biztosan törölni szeretnéd a terméket?',
				text: `Biztosan törölni szeretnéd a(z) "${item.name}" terméket? Ez a művelet nem visszavonható!`,
				icon: 'warning',
				theme: theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Igen, törölni szeretném!',
				cancelButtonText: 'Mégsem',
			}).then((result) => result.isConfirmed)
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

	const applyInventoryIncrements = async (changes: InventoryAdjustment) => {
		const payload = changes.filter((change) => change.delta !== 0);

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

	const handleStockArrivalSubmit = async (changes: InventoryAdjustment) => {
		setIsSavingStockArrival(true);

		const decreases = changes.filter((change) => change.delta < 0);
		if (decreases.length > 0) {
			const itemNames = decreases
				.map(
					(change) =>
						items.find((item) => item.id === change.id)?.name ??
						`#${change.id}`,
				)
				.join(', ');
			const isConfirmed = await Swal.fire({
				title: 'Biztosan csökkenteni szeretnéd a készletet?',
				text: `Biztosan csökkenteni szeretnéd a készletet ezeknél: ${itemNames}?`,
				icon: 'warning',
				theme: theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Igen, csökkenteni szeretném!',
				cancelButtonText: 'Mégsem',
			}).then((result) => result.isConfirmed);

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
			await Swal.fire({
				title: 'Biztosan törölni szeretnéd a kategóriát?',
				text: `Biztosan törölni szeretnéd a "${cat.name}" kategóriát? Ez a művelet nem visszavonható, és minden termék, ami ehhez a kategóriához tartozik, szintén törlésre kerül!`,
				icon: 'warning',
				theme: theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto',
				showCancelButton: true,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Igen, törölni szeretném!',
				cancelButtonText: 'Mégsem',
			}).then((result) => result.isConfirmed)
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
	const [itemSearchQuery, setItemSearchQuery] = useState('');

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
		setOrderPage(1);
	};

	const handleOrderStatusChange = async (order: OrderModel, status: string) => {
		try {
			await UpdateOrderStatus(order.id, status);

			const updated = orders.map((o) => {
				if (o.id !== order.id) return o;
				return { ...o, status };
			});

			dispatch(
				setOrders({
					...ordersResponse,
					data: updated,
				}),
			);
		} catch (error) {
			console.error('Failed to update order status:', error);
		}
	};
	const handleOpenEnableStockItems = () => {
		const inactiveInStockItems = items.filter(
			(item) => !item.is_active && item.inventory_count > 0,
		);

		if (inactiveInStockItems.length === 0) {
			Swal.fire({
				title: 'Nincsenek olyan termékek, amik raktáron vannak és inaktívak.',
				icon: 'info',
				theme: theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'auto',
			});
			return;
		}

		setIsEnableStockItemsOpen(true);
	};

	const handleEnableStockItemsSubmit = async (selectedItemIds: number[]) => {
		setIsEnablingStockItems(true);

		try {
			await Promise.all(selectedItemIds.map((itemId) => ToggleActive(itemId)));

			const selectedIdsSet = new Set(selectedItemIds);
			const updatedCategories = categories.map((category) => ({
				...category,
				items: category.items.map((item) =>
					selectedIdsSet.has(item.id) ? { ...item, is_active: true } : item,
				),
			}));

			dispatch(setCategories(updatedCategories));
			setIsEnableStockItemsOpen(false);
		} catch (error) {
			console.error('Failed to enable selected stock items:', error);
		} finally {
			setIsEnablingStockItems(false);
		}
	};

	const sortedCategories = useMemo(() => {
		return sortByField(categories, catSortField, catSortDir);
	}, [categories, catSortField, catSortDir]);

	const sortedItems = useMemo(() => {
		return sortByField(items, itemSortField, itemSortDir);
	}, [items, itemSortField, itemSortDir]);

	const filteredSortedItems = useMemo(() => {
		const normalizedQuery = itemSearchQuery.trim().toLowerCase();
		if (!normalizedQuery) return sortedItems;

		return sortedItems.filter((item) => {
			return item.name.toLowerCase().includes(normalizedQuery);
		});
	}, [itemSearchQuery, sortedItems]);


	return (
		<div className='bg-secondary dark:bg-secondary-dark font-display antialiased '>
			<div className='relative mx-auto flex w-full flex-col overflow-x-auto shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800'>
				<DashBoardHeader
					showAdmin={true}
					showPos={true}
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
												setOrderPage(1);
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
							<div className='relative flex flex-wrap items-center justify-between gap-3 mb-4'>
								<h2 className='text-xl font-bold text-foreground dark:text-white'>
									Termékek ({filteredSortedItems.length}/{items.length})
								</h2>
								<div className='items-center gap-2 hidden lg:flex'>
									<label
										className='relative w-72'
										htmlFor='admin-items-search'>
										<span className='sr-only'>Termek keresése</span>
										<input
											id='admin-items-search'
											type='text'
											value={itemSearchQuery}
											onChange={(event) =>
												setItemSearchQuery(event.target.value)
											}
											placeholder='Keresés név alapján'
											className='h-10 w-full rounded-xl border border-[#e6e0db] bg-white px-3 pr-9 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500'
										/>
										{itemSearchQuery.trim() ? (
											<button
												type='button'
												aria-label='Keresés törlése'
												onClick={() => setItemSearchQuery('')}
												className='absolute inset-y-0 right-2 flex items-center text-muted hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200'>
												<span className='material-symbols-outlined text-base leading-none'>
													close
												</span>
											</button>
										) : null}
									</label>
									<button
										onClick={handleOpenEnableStockItems}
										className='inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-green-500 bg-green-300 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-green-200 dark:border-green-900 dark:bg-green-700 dark:text-zinc-200 dark:hover:bg-zinc-700'>
										<span className='material-symbols-outlined'>toggle_on</span>
										Raktáron levő termékek aktiválása
									</button>
									<button
										onClick={() => setIsStockArrivalOpen(true)}
										className='inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e6e0db] bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
										<span className='material-symbols-outlined'>update</span>
										Raktárkészlet frissítése
									</button>
									<button
										onClick={() => setIsCreateItemOpen(true)}
										className='inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-[#e07b1a]'>
										<span className='text-base leading-none'>+</span>
										Termék hozzáadása
									</button>
								</div>
								<div
									ref={mobileMenuRef}
									className='relative lg:hidden'>
									<button
										type='button'
										aria-label='Menü megnyitása'
										aria-expanded={isMobileMenuOpen}
										onClick={() => setIsMobileMenuOpen((prev) => !prev)}
										className='text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors'>
										<span className='material-symbols-outlined'>
											{isMobileMenuOpen ? 'close' : 'menu'}
										</span>
									</button>

									{isMobileMenuOpen ? (
										<div className='absolute right-0 top-12 z-30 w-56 space-y-2 rounded-xl border border-[#e6e0db] bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 lg:hidden'>
											<button
												onClick={() => {
													handleOpenEnableStockItems();
													setIsMobileMenuOpen(false);
												}}
												className='p-2 flex w-full items-center justify-start gap-2 rounded-xl border dark:border-green-900 dark:bg-green-700 bg-green-300 border-green-500 text-foreground font-semibold text-sm hover:bg-green-200 transition-colors dark:text-zinc-200 dark:hover:bg-zinc-700'>
												<span className='material-symbols-outlined '>
													toggle_on
												</span>
												Raktáron levő termékek aktiválása
											</button>
											<button
												onClick={() => {
													setIsStockArrivalOpen(true);
													setIsMobileMenuOpen(false);
												}}
												className='p-2 flex w-full items-center justify-start gap-2 rounded-xl border border-[#e6e0db] bg-white px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
												<span className='material-symbols-outlined'>
													update
												</span>
												Raktárkészlet frissítése
											</button>
											<button
												onClick={() => {
													setIsCreateItemOpen(true);
													setIsMobileMenuOpen(false);
												}}
												className='p-2 flex w-full items-center justify-start gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e07b1a]'>
												<span className='text-base leading-none'>+</span>
												Termék hozzáadása
											</button>
										</div>
									) : null}
								</div>
							</div>
							<div className='mb-4 lg:hidden'>
								<label
									className='relative block w-full'
									htmlFor='admin-items-search-mobile'>
									<span className='sr-only'>Termek keresése</span>
									<input
										id='admin-items-search-mobile'
										type='text'
										value={itemSearchQuery}
										onChange={(event) =>
											setItemSearchQuery(event.target.value)
										}
										placeholder='Keresés név alapján'
										className='h-10 w-full rounded-xl border border-[#e6e0db] bg-white px-3 pr-9 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-500'
									/>
									{itemSearchQuery.trim() ? (
										<button
											type='button'
											aria-label='Keresés törlése'
											onClick={() => setItemSearchQuery('')}
											className='absolute inset-y-0 right-2 flex items-center text-muted hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-200'>
											<span className='material-symbols-outlined text-base leading-none'>
												close
											</span>
										</button>
									) : null}
								</label>
							</div>
							<ItemsTable
								handleItemStatusToggle={handleItemStatusToggle}
								sortedItems={filteredSortedItems}
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
								sortedOrders={orders}
								orderSortField={orderSortField}
								orderSortDir={orderSortDir}
								handleOrderSort={handleOrderSort}
								handleOrderStatusChange={handleOrderStatusChange}
								sortIcon={getSortIcon}
							/>
							<div className='w-50 ml-[46vw]'>
								<PaginationControls
									currentPage={orderPage}
									totalPages={
										ordersResponse?.meta?.last_page ??
										(ordersHasNextPage ? orderPage + 1 : orderPage)
									}
									isLoading={isOrdersLoading}
									onPageChange={(nextPage) => {
										const canGoNext =
											ordersHasNextPage || nextPage <= orderPage;
										if (nextPage < 1 || !canGoNext) return;
										setOrderPage(nextPage);
									}}
								/>
							</div>
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
				<EnableStockItemsModal
					isOpen={isEnableStockItemsOpen}
					onClose={() => setIsEnableStockItemsOpen(false)}
					items={items}
					isSaving={isEnablingStockItems}
					onSubmit={handleEnableStockItemsSubmit}
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

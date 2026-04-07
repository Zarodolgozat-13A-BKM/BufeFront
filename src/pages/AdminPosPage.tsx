import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router';
import type { OrderCreateModel } from '../Models/OrderModel';
import type { Ringlist } from '../Models/RingModel';
import { GetAllCategories } from '../services/CategoryService';
import { CreateOrder } from '../services/OrderService';
import { GetRinging } from '../services/RingService';
import {
	addItemToCart,
	clearCart,
	removeItemFromCart,
	updateItemQuantity,
} from '../store/cartSlice';
import { selectAllItems, setCategories } from '../store/categorySlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { ItemModel } from '../Models/ItemModel';
import DashBoardHeader from '../components/common/dashBoardHeader';
import { QuantityControl } from '../components/mainPage/QuantityControl';
import { LoadingState } from '../components/common/LoadingState';

const toTwoDigits = (value: number): string => String(value).padStart(2, '0');

const formatLocalDate = (date: Date): string => {
	return `${date.getFullYear()}-${toTwoDigits(date.getMonth() + 1)}-${toTwoDigits(date.getDate())}`;
};

const formatLocalDateTime = (date: Date): string => {
	return `${formatLocalDate(date)}T${toTwoDigits(date.getHours())}:${toTwoDigits(date.getMinutes())}`;
};

const AdminPosPage = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const categories = useAppSelector((state) => state.category.categories);
	const allItems = useAppSelector(selectAllItems);
	const cartItems = useAppSelector((state) => state.cart.cart.items);
	const [ringing, setRinging] = useState<Ringlist[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [deliverydatetime, setDeliverydatetime] = useState('');
	const [comment, setComment] = useState('');
	const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
	const [checkoutError, setCheckoutError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isCancelled = false;

		const bootstrap = async () => {
			try {
				const data = await GetAllCategories();
				if (!isCancelled) {
					dispatch(setCategories(data));
				}
			} catch (error) {
				console.error('Failed to load POS categories:', error);
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		bootstrap();

		return () => {
			isCancelled = true;
		};
	}, [dispatch]);

	useEffect(() => {
		let isCancelled = false;

		const fetchRinging = async () => {
			try {
				const data = await GetRinging();
				if (!isCancelled && data && Array.isArray(data.breaks)) {
					setRinging(data.breaks);
				}
			} catch (error) {
				console.error('Failed to load ringing data for POS:', error);
			}
		};

		fetchRinging();

		return () => {
			isCancelled = true;
		};
	}, []);

	const quantityByItemId = useMemo(() => {
		const map: Record<number, number> = {};
		for (const cartItem of cartItems) {
			map[cartItem.id] = cartItem.quantity ?? 0;
		}
		return map;
	}, [cartItems]);

	const updateQuantity = (item: ItemModel, delta: number) => {
		if (delta === 0) return;

		const currentQuantity = quantityByItemId[item.id] ?? 0;
		const nextQuantity = currentQuantity + delta;

		if (nextQuantity > item.inventory_count) {
			return;
		}

		if (currentQuantity === 0 && delta > 0) {
			const itemToAdd = allItems.find((candidate) => candidate.id === item.id);
			if (!itemToAdd) return;
			dispatch(addItemToCart({ item: itemToAdd, quantity: delta }));
			return;
		}

		dispatch(updateItemQuantity({ item_id: item.id, delta }));
	};

	const totalItems = useMemo(
		() => cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
		[cartItems],
	);

	const totalPrice = useMemo(
		() =>
			cartItems.reduce(
				(sum, item) => sum + item.price * (item.quantity ?? 0),
				0,
			),
		[cartItems],
	);

	const normalizedQuery = searchQuery.trim().toLowerCase();
	const filteredCategories = useMemo(
		() =>
			categories
				.map((category) => ({
					...category,
					items: category.items.filter((item) => {
						if (!item.is_active) return false;
						if (!normalizedQuery) return true;
						return item.name.toLowerCase().includes(normalizedQuery);
					}),
				}))
				.filter((category) => category.items.length > 0),
		[categories, normalizedQuery],
	);

	const isPast = (endTime: string) => {
		const [h, m] = endTime.split(':').map((s) => Number(s));
		const now = new Date();
		const endDate = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			h,
			m,
		);
		return endDate.getTime() <= now.getTime();
	};

	const handleSubmitOrder = async () => {
		if (isSubmittingOrder) return;

		if (cartItems.length === 0) {
			setCheckoutError(
				'A kosar jelenleg ures. Adj hozza legalabb egy termeket.',
			);
			return;
		}

		setCheckoutError(null);
		setIsSubmittingOrder(true);

		try {
			const createdAt = new Date();
			const payload: OrderCreateModel = {
				delivery_date:
					deliverydatetime !== ''
						? `${formatLocalDate(createdAt)}T${deliverydatetime}`
						: formatLocalDateTime(createdAt),
				comment,
				items: cartItems.map((item) => ({
					item_id: item.id,
					quantity: item.quantity ?? 0,
				})),
				cash: true,
			};

			await CreateOrder(payload);
			dispatch(clearCart());
			setComment('');
			setDeliverydatetime('');
			navigate('/orderstatus', { replace: true });
		} catch (error) {
			let errorMessage = 'A rendeles rogzitese nem sikerult. Probald ujra.';

			if (isAxiosError(error) && error.response?.data?.message) {
				errorMessage = error.response.data.message;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			setCheckoutError(errorMessage);
			setIsSubmittingOrder(false);
		}
	};

	return (
		<div className='bg-secondary dark:bg-secondary-dark font-display antialiased'>
			<div className='relative mx-auto flex w-full flex-col overflow-x-hidden shadow-sm bg-surface dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800'>
				<DashBoardHeader
					showAdmin={true}
					backTo='/admin'
					name={<span className='text-xl font-bold'>Admin rendelőfelület</span>}
				/>

				<div className='p-4 md:p-6'>
					<div className='rounded-xl border border-[#e6e0db] bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900'>
						<div className='grid gap-3 lg:grid-cols-[1fr_auto]'>
							<input
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder='Keresés termékre...'
								className='h-11 w-full rounded-xl border border-[#e6e0db] bg-surface px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
							/>
							<div className='flex items-center gap-2'>
								<button
									type='button'
									onClick={() => dispatch(clearCart())}
									className='h-11 rounded-xl border border-[#e6e0db] bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-[#f5f0ea] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'>
									Új rendelés
								</button>
							</div>
						</div>
						<div className='mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted dark:text-zinc-400'>
							<p>Darab: {totalItems}</p>
							<p>Végösszeg: {Math.floor(totalPrice)} Ft</p>
						</div>
					</div>
				</div>

				<main className='px-4 pb-6 md:px-6'>
					{isLoading ? (
						<LoadingState message='POS kinalat betoltese...' />
					) : (
						<div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
							<section>
								{filteredCategories.length === 0 ? (
									<div className='rounded-xl border border-dashed border-[#d8d0c9] bg-surface p-8 text-center text-sm text-muted dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'>
										Nincs találat a keresésre.
									</div>
								) : (
									<div className='space-y-6'>
										{filteredCategories.map((category) => (
											<section
												key={category.id}
												className='space-y-3'>
												<h2 className='text-lg font-bold text-foreground dark:text-zinc-100'>
													{category.name}
												</h2>
												<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
													{category.items.map((item) => {
														const quantity = quantityByItemId[item.id] ?? 0;
														const isOutOfStock = item.inventory_count <= 0;

														return (
															<article
																key={item.id}
																className='rounded-xl border border-[#e6e0db] bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900'>
																<div className='mb-3 flex items-start justify-between gap-3'>
																	<div className='min-w-0'>
																		<p className='truncate text-sm font-semibold text-foreground dark:text-zinc-100'>
																			{item.name}
																		</p>
																		<p className='text-xs text-muted dark:text-zinc-400'>
																			Raktaron: {item.inventory_count} db
																		</p>
																	</div>
																	<p className='text-sm font-bold text-foreground dark:text-zinc-100'>
																		{item.price} Ft
																	</p>
																</div>

																<div className='flex items-center justify-end'>
																	{isOutOfStock ? (
																		<span className='rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'>
																			Nincs készleten
																		</span>
																	) : (
																		<QuantityControl
																			size='md'
																			quantity={quantity}
																			onIncrease={() => updateQuantity(item, 1)}
																			onDecrease={() =>
																				updateQuantity(item, -1)
																			}
																		/>
																	)}
																</div>
															</article>
														);
													})}
												</div>
											</section>
										))}
									</div>
								)}
							</section>

							<aside className='max-h-dvh flex flex-col rounded-xl border border-[#e6e0db] bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900'>
								<h2 className='text-base font-bold text-foreground dark:text-zinc-100'>
									Pénztár
								</h2>

								<div className='mt-4 space-y-3'>
									<div>
										<label className='mb-1 block text-xs font-medium text-muted dark:text-zinc-400'>
											Átvétel ideje
										</label>
										<select
											value={deliverydatetime}
											onChange={(e) => setDeliverydatetime(e.target.value)}
											className='h-10 w-full rounded-lg border border-[#e6e0db] bg-surface px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'>
											<option value=''>Lehető leghamarabb</option>
											{ringing.map((ring, index) => {
												const disabled = isPast(ring.end);
												return (
													<option
														key={`${ring.start}-${ring.end}-${index}`}
														value={ring.start}
														disabled={disabled}>
														{`${ring.start} - ${ring.end}`}
													</option>
												);
											})}
										</select>
									</div>

									<div>
										<label className='mb-1 block text-xs font-medium text-muted dark:text-zinc-400'>
											Megjegyzés
										</label>
										<textarea
											value={comment}
											onChange={(e) => setComment(e.target.value)}
											rows={3}
											maxLength={255}
											placeholder='Opcionális megjegyzés...'
											className='w-full resize-none rounded-lg border border-[#e6e0db] bg-surface px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
										/>
									</div>
								</div>

								<div className='my-4 h-px bg-[#e6e0db] dark:bg-zinc-700' />

								<div className='min-h-0 flex-1 space-y-2 overflow-y-auto pr-1'>
									{cartItems.length === 0 ? (
										<p className='rounded-lg border border-dashed border-[#d8d0c9] bg-surface px-3 py-4 text-center text-xs text-muted dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'>
											A kosár üres.
										</p>
									) : (
										cartItems.map((item) => (
											<div
												key={item.id}
												className='rounded-lg border border-[#eee7df] bg-surface p-2 dark:border-zinc-700 dark:bg-zinc-800'>
												<div className='flex items-start justify-between gap-2'>
													<div className='min-w-0'>
														<p className='truncate text-sm font-medium text-foreground dark:text-zinc-100'>
															{item.name}
														</p>
														<p className='text-xs text-muted dark:text-zinc-400'>
															{item.price * (item.quantity ?? 0)} Ft
														</p>
													</div>
													<button
														type='button'
														onClick={() =>
															dispatch(removeItemFromCart(item.id))
														}
														className='text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'>
														<span className='material-symbols-outlined text-sm'>
															close
														</span>
													</button>
												</div>
												<div className='mt-2 flex justify-end'>
													<QuantityControl
														size='sm'
														quantity={item.quantity ?? 0}
														onIncrease={() => updateQuantity(item, 1)}
														onDecrease={() => updateQuantity(item, -1)}
													/>
												</div>
											</div>
										))
									)}
								</div>

								<div className='my-4 h-px bg-[#e6e0db] dark:bg-zinc-700' />

								<div className='mb-3 flex items-center justify-between text-sm'>
									<span className='font-medium text-foreground dark:text-zinc-100'>
										Tételek
									</span>
									<span className='font-semibold text-foreground dark:text-zinc-100'>
										{totalItems} db
									</span>
								</div>
								<div className='mb-4 flex items-center justify-between text-sm'>
									<span className='font-medium text-foreground dark:text-zinc-100'>
										Végösszeg
									</span>
									<span className='text-base font-bold text-foreground dark:text-zinc-100'>
										{Math.floor(totalPrice)} Ft
									</span>
								</div>

								{checkoutError ? (
									<div className='mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'>
										{checkoutError}
									</div>
								) : null}

								<button
									type='button'
									onClick={handleSubmitOrder}
									disabled={isSubmittingOrder || cartItems.length === 0}
									className='h-11 w-full rounded-xl bg-primary text-sm font-bold text-white transition-colors hover:bg-[#e07b1a] disabled:cursor-not-allowed disabled:opacity-60'>
									{isSubmittingOrder
										? 'Rögzítés folyamatban...'
										: 'Rendelés rögzítése'}
								</button>
							</aside>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default AdminPosPage;

import { useEffect, useState } from 'react';
import { GetAllActiveOrders } from '../services/OrderService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { GetMe } from '../services/APIservice';
import { setMe } from '../store/authSlice';
import type { OrderModel } from '../Models/OrderModel';
import type { ItemModel } from '../Models/ItemModel';
import OrderItem from '../components/profilePage/orderItem';
import { addItemToCart, clearCart } from '../store/cartSlice';
import { useNavigate } from 'react-router';
import DashBoardHeader from '../components/common/dashBoardHeader';
import { LoadingState } from '../components/common/LoadingState';
import {
	ReorderAvailabilityModal,
	type ReorderUnavailableItem,
} from '../components/modals/ReorderAvailabilityModal';

type ReorderAvailableItem = { item: ItemModel; quantity: number };

const ProfilePage = () => {
	const me = useAppSelector((state) => state.auth.me);
	const category = useAppSelector((state) => state.category.categories);
	const [orders, setOrders] = useState<OrderModel[]>([]);
	const [isLoadingOrders, setIsLoadingOrders] = useState(true);
	const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
	const [availableReorderItems, setAvailableReorderItems] = useState<
		ReorderAvailableItem[]
	>([]);
	const [unavailableReorderItems, setUnavailableReorderItems] = useState<
		ReorderUnavailableItem[]
	>([]);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const applyReorder = (itemsToAdd: ReorderAvailableItem[]) => {
		dispatch(clearCart());
		itemsToAdd.forEach(({ item, quantity }) => {
			dispatch(addItemToCart({ item, quantity }));
		});
		navigate('/checkout');
	};

	const handleOrder = (order: OrderModel) => {
		if (order.items === undefined) return;

		const catalogItems = category.flatMap((cat) => cat.items || []);
		const nextAvailableItems: ReorderAvailableItem[] = [];
		const nextUnavailableItems: ReorderUnavailableItem[] = [];

		order.items.forEach((item) => {
			const cartItem = catalogItems.find(
				(catalogItem) => catalogItem.id === item.item_id,
			);

			if (!cartItem) {
				nextUnavailableItems.push({
					itemId: item.item_id,
					name: item.item_name,
					quantity: item.quantity,
					reason: 'A termék jelenleg nem érhető el.',
				});
				return;
			}

			if (!cartItem.is_active) {
				nextUnavailableItems.push({
					itemId: cartItem.id,
					name: cartItem.name,
					quantity: item.quantity,
					reason: 'A termék jelenleg inaktív.',
				});
				return;
			}

			if (cartItem.inventory_count < item.quantity) {
				nextUnavailableItems.push({
					itemId: cartItem.id,
					name: cartItem.name,
					quantity: item.quantity,
					reason: `Nincs elegendő készlet (kért: ${item.quantity}, elérhető: ${cartItem.inventory_count}).`,
				});
				return;
			}

			nextAvailableItems.push({ item: cartItem, quantity: item.quantity });
		});

		if (nextUnavailableItems.length > 0) {
			setAvailableReorderItems(nextAvailableItems);
			setUnavailableReorderItems(nextUnavailableItems);
			setIsAvailabilityModalOpen(true);
			return;
		}

		applyReorder(nextAvailableItems);
	};

	const handleContinueWithoutUnavailable = () => {
		if (availableReorderItems.length === 0) {
			dispatch(clearCart());
			setIsAvailabilityModalOpen(false);
			return;
		}

		setIsAvailabilityModalOpen(false);
		applyReorder(availableReorderItems);
	};

	const handleScrapCart = () => {
		dispatch(clearCart());
		setIsAvailabilityModalOpen(false);
	};
	useEffect(() => {
		const fetchUserData = async () => {
			if (me == null) {
				try {
					const data = await GetMe();
					dispatch(setMe({ me: data }));
				} catch (error) {
					console.error('Failed to fetch user data:', error);
				}
			}
		};
		fetchUserData();
	}, [me, dispatch]);

	useEffect(() => {
		const getOrders = async () => {
			setIsLoadingOrders(true);
			try {
				const data = await GetAllActiveOrders();
				setOrders(data);
			} catch (error) {
				console.error('Failed to fetch orders:', error);
			} finally {
				setIsLoadingOrders(false);
			}
		};
		getOrders();
	}, []);

	return (
		<div className='bg-secondary dark:bg-secondary-dark text-slate-900 dark:text-slate-100 font-display'>
			<div className='relative mx-auto flex w-full flex-col overflow-x-hidden shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800'>
				{me && (
					<DashBoardHeader
						name='Profilod'
						showAdmin={false}
						backTo='/main'
					/>
				)}
				<div className='px-4 pb-8 pt-5 sm:px-6'>
					<div className='rounded-xl border border-[#e6e0db] bg-surface p-6 dark:border-zinc-800 dark:bg-zinc-800/50'>
						<div className='flex w-full flex-col items-center gap-4'>
							<div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 dark:bg-primary/20'>
								<span className='material-symbols-outlined text-primary text-3xl'>
									person
								</span>
							</div>
							<div className='flex flex-col items-center justify-center'>
								<p className='text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] text-center'>
									{me?.full_name}
								</p>
								{/* <div className="flex items-center gap-1 mt-2 bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-primary text-sm">stars</span>
                  <p className="text-primary font-semibold text-sm leading-normal text-center">1,250 pont</p>
                </div> */}
							</div>
						</div>
					</div>
					<div className='mt-5 flex-1 rounded-xl border border-[#e6e0db] bg-surface p-4 dark:border-zinc-800 dark:bg-zinc-800/50 sm:p-5'>
						<div className='mb-4 flex items-center justify-between'>
							<h3 className='text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]'>
								Korábbi rendelések
							</h3>
							<span className='rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary'>
								{orders.length} db
							</span>
						</div>
						<div className='flex flex-col gap-3'>
							{isLoadingOrders ? (
								<LoadingState message='Rendelések betöltése...' />
							) : orders.length === 0 ? (
								<div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e0db] bg-white py-10 dark:border-zinc-700 dark:bg-zinc-800'>
									<span className='material-symbols-outlined text-3xl text-muted dark:text-zinc-400'>
										receipt_long
									</span>
									<p className='mt-2 text-muted dark:text-zinc-300 text-sm font-normal leading-normal text-center'>
										Még nem adtál le rendelést.
									</p>
								</div>
							) : (
								orders
									.slice()
									.sort((a, b) => b.id - a.id)
									.filter(
										(x) =>
											x.payment_intent_id == null ||
											(x.payment_intent_id != null &&
												x.status != 'Fizetésre vár'),
									)
									.map((order) =>
										order.status == 'Törölve' ? (
											order.delivery_date! > new Date().toISOString() && (
												<div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e0db] bg-white py-10 dark:border-zinc-700 dark:bg-zinc-800'>
													<span className='material-symbols-outlined text-3xl text-muted dark:text-zinc-400'>
														receipt_long
													</span>
													<p className='mt-2 text-muted dark:text-zinc-300 text-sm font-normal leading-normal text-center'>
														#{order.order_identifier_number} számú rendelésed
														törlésre került.
													</p>
												</div>
											)
										) : (
											<OrderItem
												key={order.id}
												handleOrder={handleOrder}
												order={order}
											/>
										),
									)
							)}
						</div>
					</div>
				</div>
			</div>

			<ReorderAvailabilityModal
				isOpen={isAvailabilityModalOpen}
				unavailableItems={unavailableReorderItems}
				onClose={() => setIsAvailabilityModalOpen(false)}
				onContinueWithoutUnavailable={handleContinueWithoutUnavailable}
				onScrapCart={handleScrapCart}
			/>
		</div>
	);
};

export default ProfilePage;

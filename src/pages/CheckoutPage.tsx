import { useEffect, useMemo, useState } from "react";
import { GetRinging } from "../services/RingService";
import type { Ringlist } from "../Models/RingModel";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Link, useNavigate } from "react-router";
import { removeItemFromCart, updateItemQuantity } from "../store/cartSlice";
import type { OrderCreateModel } from "../Models/OrderModel";
import { CreateOrder } from "../services/OrderService";
import { QuantityControl } from "../components/mainPage/QuantityControl";

const TAX_RATE = 0.27;
// const SERVICE_FEE_RATE = 0.1;
const SUBTOTAL_RATE = 1 - TAX_RATE; // 0.73
const ORDER_CUTOFF_HOUR = 14;
const ORDER_CUTOFF_MINUTE = 30;
const MIN_SPINNER_DISPLAY_MS = 400;

type CheckoutOrderResponse = {
	client_secret?: string;
	clientSecret?: string;
};

const toTwoDigits = (value: number): string => String(value).padStart(2, "0");

const formatLocalDate = (date: Date): string => {
	return `${date.getFullYear()}-${toTwoDigits(date.getMonth() + 1)}-${toTwoDigits(date.getDate())}`;
};

const formatLocalDateTime = (date: Date): string => {
	return `${formatLocalDate(date)}T${toTwoDigits(date.getHours())}:${toTwoDigits(date.getMinutes())}`;
};

const isAfterOrderCutoff = (date: Date) => {
	const currentMinutes = date.getHours() * 60 + date.getMinutes();
	const cutoffMinutes = ORDER_CUTOFF_HOUR * 60 + ORDER_CUTOFF_MINUTE;
	return currentMinutes >= cutoffMinutes;
};

const waitForNextPaint = () =>
	new Promise<void>((resolve) => {
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => resolve());
		});
	});

export const CheckoutPage = () => {
	const navigate = useNavigate();
	const [ringing, setRinging] = useState<Ringlist[]>([]);
	const [comment, setComment] = useState<string>("");
	const [isCommentOpen, setIsCommentOpen] = useState(false);
	const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
	const [checkoutError, setCheckoutError] = useState<string | null>(null);
	const [deliverydatetime, setDeliverydatetime] = useState<string>("");
	const [now, setNow] = useState(() => new Date());
	const dispatch = useAppDispatch();
	const cart = useAppSelector((state) => state.cart.cart);
	const orderingClosed = import.meta.env.PROD && isAfterOrderCutoff(now);

	const isPast = (endTime: string) => {
		const [h, m] = endTime.split(":").map((s) => Number(s));
		const now = new Date();
		const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
		return endDate.getTime() <= now.getTime();
	};

	const updateQuantity = (itemId: number, delta: number) => {
		dispatch(updateItemQuantity({ item_id: itemId, delta }));
	};

	const removeItem = (itemId: number) => {
		dispatch(removeItemFromCart(itemId));
	};
	const handleCheckout = async (cash: boolean) => {
		if (isSubmittingOrder) {
			return;
		}

		setCheckoutError(null);

		if (import.meta.env.PROD && isAfterOrderCutoff(new Date())) {
			setCheckoutError("Rendelést 14:30 után már nem lehet leadni.");
			return;
		}

		setIsSubmittingOrder(true);
		const submitStartedAt = Date.now();
		await waitForNextPaint();
		try {
			const createdAt = new Date();
			const orderData: OrderCreateModel = {
				delivery_date:
					deliverydatetime !== ""
						? `${formatLocalDate(createdAt)}T${deliverydatetime}`
						: formatLocalDateTime(createdAt),
				comment: comment,
				items: cart.items.map((item) => ({
					item_id: item.id,
					quantity: item.quantity ?? 0,

				})),
				cash: cash,
			};
			if (import.meta.env.DEV) {
				console.log(orderData);
			}
			const orderResponse = await CreateOrder(orderData);
			console.log("Order creation response:", orderResponse);
			if (!cash) {
				const paymentResponse = orderResponse as CheckoutOrderResponse;
				const clientSecret = paymentResponse.client_secret ?? paymentResponse.clientSecret;

				if (!clientSecret) {
					throw new Error('No client secret received from server. Payment initialization failed.');
				}

				const elapsed = Date.now() - submitStartedAt;
				if (elapsed < MIN_SPINNER_DISPLAY_MS) {
					await new Promise((resolve) =>
						window.setTimeout(resolve, MIN_SPINNER_DISPLAY_MS - elapsed),
					);
				}

				navigate("/payment", { state: { clientSecret }, replace: true });
			}
			else{
				navigate("/orderstatus", {replace: true})
			}
		} catch (error) {
			console.error("Failed to create order:", error);
			if (error instanceof Error) {
				setCheckoutError(error.message);
			} else {
				setCheckoutError("A rendelés leadása nem sikerült. Kérlek próbáld újra.");
			}
			setIsSubmittingOrder(false);
		}
	};

	useEffect(() => {
		const fetchRinging = async () => {
			try {
				const data = await GetRinging();
				if (data && Array.isArray(data.breaks) && data.breaks.length > 0) {
					setRinging(data.breaks);
				} else {
					console.error("Failed to fetch ringing data: unexpected response shape", data);
				}
			} catch (error) {
				console.error("Failed to fetch ringing data:", error);
			}
		};
		fetchRinging();
	}, []);

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			setNow(new Date());
		}, 30000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, []);

	const baseTotal = useMemo(
		() => cart.items.reduce((total, item) => total + item.price * (item.quantity ?? 0), 0),
		[cart.items],
	);

	return (
		<div className='bg-background-light dark:bg-background-dark font-display antialiased'>
			<div className='relative flex h-full min-h-screen w-full mx-auto flex-col overflow-x-hidden shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800'>
				<div className='flex items-center bg-white dark:bg-zinc-900 p-4 pb-2 justify-between sticky top-0 z-10'>
					<Link
						to='/main'
						className='text-text-dark dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors'>
						<span className='material-symbols-outlined'>arrow_back</span>
					</Link>
					<h2 className='text-text-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12'>
						Átvétel Kiválasztása
					</h2>
				</div>
				<main className='flex-1 pb-6'>
					<div className='block animate-fade-in' id='pickup-section'>
						<div className='px-4 pt-4 pb-2'>
							<h3 className='text-text-dark dark:text-white tracking-tight text-2xl font-bold leading-tight text-left'>
								Mikor szeretnéd átvenni?
							</h3>
						</div>
						<div className='flex flex-col gap-4 px-4 py-3'>
							<label className='flex flex-col flex-1'>
								<p className='text-text-dark dark:text-zinc-300 text-sm font-medium leading-normal pb-2'>
									Válassz szünetet
								</p>
								<div className='relative'>
									<select
										value={deliverydatetime}
										onChange={(e) => setDeliverydatetime(e.target.value)}
										className='appearance-none w-full rounded-xl border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 h-14 pl-4 pr-10 text-base font-normal leading-normal text-text-dark dark:text-white transition-shadow outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'>
										{orderingClosed ? (
											<option value='' disabled>
												Ma már nem lehet rendelni, kérlek térj vissza holnap!
											</option>
										) : null}
										<option value='' disabled={orderingClosed}>
											Lehető leghamarabb
										</option>
										{ringing.map((ring, index) => {
											const disabled = isPast(ring.end);

											return (
												<option
													key={`${ring.start}-${ring.end}-${index}`}
													value={`${ring.start}`}
													disabled={disabled}>
													{`${ring.start} - ${ring.end}`}
												</option>
											);
										})}
									</select>
									<div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-light dark:text-zinc-500'>
										<span className='material-symbols-outlined'>expand_more</span>
									</div>
								</div>
							</label>
						</div>
						<div className='px-4 pb-4'>
							<div className='flex items-center gap-2 p-3 bg-primary/10 rounded-lg border mt-5 mb-4 border-primary/20'>
								<span className='material-symbols-outlined text-primary text-xl'>storefront</span>
								<p className='text-text-dark dark:text-zinc-200 text-sm font-medium leading-normal '>
									Átvétel az iskolai büfében.
								</p>
							</div>
							{orderingClosed && (
								<div className='flex items-center gap-2 p-3 rounded-lg'>
									<span className='material-symbols-outlined text-red-500 dark:text-red-400 text-xl'>
										schedule
									</span>
									<p className='text-red-700 dark:text-red-400 text-sm font-medium leading-normal'>
										A rendelésfelvétel mára véget ért (14:30). Kérünk, gyere vissza holnap.
									</p>
								</div>
							)}
						</div>
					</div>
					<div className='h-px bg-[#e6e0db] dark:bg-zinc-800 mx-4 my-2'></div>
					<div className='px-4 py-4'>
						<div className='bg-bg-light dark:bg-zinc-800/50 rounded-xl p-4 border border-[#e6e0db] dark:border-zinc-800 mb-8'>
							<button
								type='button'
								onClick={() => setIsCommentOpen((current) => !current)}
								className='flex w-full items-center justify-between gap-3 text-left'>
								<div>
									<h4 className='text-text-dark dark:text-white text-lg font-bold'>
										Megjegyzés a rendeléshez
									</h4>
									<p className='mt-1 text-sm text-text-light dark:text-zinc-400'>
										Opcionális kérés vagy megjegyzés a büfének.
									</p>
								</div>
								<span className='material-symbols-outlined text-text-light dark:text-zinc-400'>
									{isCommentOpen ? "expand_less" : "expand_more"}
								</span>
							</button>
							{isCommentOpen && (
								<div className='mt-4'>
									<label
										className='block text-sm font-medium text-text-dark dark:text-zinc-200 mb-2'
										htmlFor='order-comment'>
										Opcionális megjegyzés
									</label>
									<textarea
										id='order-comment'
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										rows={4}
										maxLength={255}
										placeholder='Pl. kevesebb csipos, ne tegyetek szalvetat, kesobb megyek erte...'
										className='w-full resize-none rounded-xl border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-text-dark dark:text-white placeholder:text-text-light dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20'
									/>
									{comment && (
										<div className='mt-2 flex justify-end'>
											<span className='text-xs text-text-light dark:text-zinc-500'>
												{comment.length}/255
											</span>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
					<div className='h-px bg-[#e6e0db] dark:bg-zinc-800 mx-4 my-2'></div>
					<div className='px-4 py-4'>
						<h4 className='text-text-dark dark:text-white text-lg font-bold mb-4'>
							Rendelés összesítése
						</h4>
						<div className='bg-bg-light dark:bg-zinc-800/50 rounded-xl p-4 space-y-3 border border-[#e6e0db] dark:border-zinc-800'>
							{cart.items.map((cartItem, index) => (
								<div
									key={`${cartItem.id}-${index}`}
									className='flex justify-between mb-3 items-center'>
									<div className='flex gap-3'>
										<div
											className='w-12 h-12 bg-gray-200 rounded-lg bg-cover bg-center shrink-0 '
											data-alt={cartItem.name}
											style={{ backgroundImage: `url('${cartItem.picture_url ?? ""}')` }}></div>
										<div className='flex items-center justify-center'>
											<p className='text-text-dark dark:text-white text-sm font-medium'>
												{cartItem.name}
											</p>
										</div>
									</div>
									<div className='flex items-center gap-2 '>
										<div className='mt-1 flex items-center gap-2 float-end'>
											<QuantityControl
												size='sm'

												quantity={cartItem.quantity ?? 0}
												onIncrease={() => updateQuantity(cartItem.id, 1)}
												onDecrease={() => updateQuantity(cartItem.id, -1)}
											/>
										</div>
										<button
											onClick={() => removeItem(cartItem.id)}
											className='w-7 h-7 flex items-center justify-center hover:text-error/50 text-error rounded-md'>
											<span className='material-symbols-outlined text-sm'>close</span>
										</button>
										<p className='text-text-dark dark:text-white text-sm font-medium'>
											{cartItem.price * (cartItem.quantity ?? 0)}Ft
										</p>
									</div>
								</div>
							))}
							<hr className='pt-4 pb-4 text-text-light' />
							<div className='h-px bg-gray-200 dark:bg-zinc-700 my-3'></div>
							<div className='flex justify-between items-center mb-1'>
								<p className='text-text-light dark:text-zinc-400 text-sm'>Részösszeg</p>
								<p className='text-text-dark dark:text-white text-sm font-medium'>
									{Math.floor(baseTotal * SUBTOTAL_RATE)}Ft
								</p>
							</div>
							<div className='flex justify-between items-center mb-3'>
								<p className='text-text-light dark:text-zinc-400 text-sm'>Adó</p>
								<p className='text-text-dark dark:text-white text-sm font-medium'>
									{Math.ceil(baseTotal * TAX_RATE)}Ft
								</p>
							</div>
							<hr className='pt-4 pb-4 text-text-light' />
							<div className='flex justify-between items-center pt-1'>
								<p className='text-text-dark dark:text-white text-base font-bold'>Összesen</p>
								<p className='text-text-dark dark:text-white text-xl font-bold'>
									{Math.floor(baseTotal)}Ft
								</p>
							</div>
						</div>
					</div>
					{/* <div className="px-4 pb-6">
                        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-100 dark:border-yellow-900/40 mx-auto w-fit">
                            <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg">stars</span>
                            <p className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wide">+{Math.floor(baseTotal * SERVICE_FEE_RATE * 1.1)} pontot kapsz!</p>
                        </div>
                    </div> */}
				</main>
				<div className='w-full p-4 bg-white dark:bg-zinc-900 border-t border-[#e6e0db] dark:border-zinc-800'>
					{checkoutError ? (
						<div className='mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'>
							{checkoutError}
						</div>
					) : null}
					<div className='flex gap-5'>
					<button
						onClick={() => handleCheckout(true)}
						disabled={orderingClosed || isSubmittingOrder}
						className={
							"w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all " +
							(orderingClosed
								? "bg-zinc-200 text-zinc-500 border border-zinc-300 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
								: isSubmittingOrder
									? "bg-primary/90 text-white cursor-wait"
									: "bg-primary hover:bg-[#e07b1a] text-white shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.98]")
						}>
						{isSubmittingOrder ? (
							<>
								<span
									className='inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent'
									aria-hidden='true'></span>
								<span>Rendelés feldolgozása...</span>
							</>
						) : (
							<>
								<span>Fizetés átvételkor</span>
							</>
						)}
					</button>
					<button
						onClick={() => handleCheckout(false)}
						disabled={orderingClosed || isSubmittingOrder}
						className={
							"w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all " +
							(orderingClosed
								? "bg-zinc-200 text-zinc-500 border border-zinc-300 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
								: isSubmittingOrder
									? "bg-primary/90 text-white cursor-wait"
									: "bg-primary hover:bg-[#e07b1a] text-white shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.98]")
						}>
						{isSubmittingOrder ? (
							<>
								<span
									className='inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent'
									aria-hidden='true'></span>
								<span>Rendelés feldolgozása...</span>
							</>
						) : (
							<>
								<span>Bankkártyás fizetés</span>
							</>
						)}
					</button>
						</div>
				</div>
			</div>
		</div>
	);
};

export default CheckoutPage;

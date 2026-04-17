import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { GetRinging } from "../services/RingService";
import type { Ringlist } from "../Models/RingModel";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { Link, useNavigate } from "react-router";
import { clearCart, removeItemFromCart, updateItemQuantity } from "../store/cartSlice";
import type { CartItemModel, OrderCreateModel } from "../Models/OrderModel";
import { CreateOrder } from "../services/OrderService";
import { QuantityControl } from "../components/mainPage/QuantityControl";
import { GetOneItem } from "../services/ItemService";
import Swal from "sweetalert2";
import { isDarkTheme } from "../services/themeService";

const dph = 0.27;
const DealerIncome = 1 - dph;
const SpinnerDisplTime = 400;

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

export const CheckoutPage = () => {
	const navigate = useNavigate();
	const { me } = useAppSelector((state) => state.auth);
	const [ringing, setRinging] = useState<Ringlist[]>([]);
	const [comment, setComment] = useState<string>("");
	const [isCommentOpen, setIsCommentOpen] = useState(false);
	const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
	const [checkoutError, setCheckoutError] = useState<string | null>(null);
	const [deliverydatetime, setDeliverydatetime] = useState<string>("");
	const [isAvailabilityLoaded, setIsAvailabilityLoaded] = useState(false);
	const [isOrderingClosedByBackend, setIsOrderingClosedByBackend] = useState(true);
	const dispatch = useAppDispatch();
	const cart = useAppSelector((state) => state.cart.cart);
	const isCartEmpty = cart.items.length === 0;
	const orderingClosed = import.meta.env.PROD && isAvailabilityLoaded && isOrderingClosedByBackend;
	const orderingUnavailable = import.meta.env.PROD && (!isAvailabilityLoaded || orderingClosed);
	const orderingClosedMessage = orderingClosed
		? "A rendelésfelvétel szünetel. Kérünk, gyere vissza később."
		: null;

	const isPast = (endTime: string) => {
		const [h, m] = endTime.split(":").map((s) => Number(s));
		const now = new Date();
		const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
		return endDate.getTime() <= now.getTime();
	};

	const updateQuantity = (item: CartItemModel, delta: number) => {
		if (item.quantity && delta + item.quantity > item.inventory_count) {
			Swal.fire({
				title: "Nincs elég készlet",
				text: `Nincs elég készlet a "${item.name}"-ból. Jelenleg ${item.inventory_count} darab elérhető.`,
				icon: "error",
				theme: isDarkTheme() ? "dark" : "light",
			});
			return
		}
		dispatch(updateItemQuantity({ item_id: item.id, delta }));
	};

	const removeItem = (itemId: number) => {
		dispatch(removeItemFromCart(itemId));
	};
	const handleCheckout = async (cash: boolean) => {
		if (isSubmittingOrder) {
			return;
		}

		if (isCartEmpty) {
			setCheckoutError("A kosarad jelenleg üres. Kérlek adj hozzá legalább egy terméket.");
			return;
		}

		setCheckoutError(null);

		if (import.meta.env.PROD && !isAvailabilityLoaded) {
			setCheckoutError("A rendelhetőség ellenőrzése folyamatban van. Kérlek várj egy pillanatot.");
			return;
		}

		if (orderingClosed) {
			setCheckoutError(orderingClosedMessage ?? "A rendelésfelvétel jelenleg szünetel. Kérünk, gyere vissza később.");
			return;
		}

		setIsSubmittingOrder(true);
		const submitStartedAt = Date.now();
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
				if (elapsed < SpinnerDisplTime) {
					await new Promise((resolve) =>
						window.setTimeout(resolve, SpinnerDisplTime - elapsed),
					);
				}

				navigate("/payment", { state: { clientSecret }, replace: true });
			}
			else {
				navigate("/orderstatus", {
					replace: true,
				})
				dispatch(clearCart());
			}
		} catch (error) {
			let errorMessage = "A rendelés leadása nem sikerült. Kérlek próbáld újra.";

			if (isAxiosError(error) && error.response?.data?.message) {
				errorMessage = error.response.data.message;
				if (error.response.status === 400) {
					cart.items.forEach((item) => {
						GetOneItem(item.id)
							.then(async (data) => {
								if (item.quantity && data.inventory_count < item.quantity) {
									if (data.inventory_count === 0) {
										await Swal.fire({
											title: "Nincs elég készlet",
											text: `Sajnáljuk, de a "${item.name}" nevű termék jelenleg nincs készleten. Szeretnéd eltávolítani a kosárból?`,
											icon: "error",
											theme: isDarkTheme() ? "dark" : "light",
										}).then((result) => {
											if (result.isConfirmed) {
												dispatch(removeItemFromCart(item.id));
											}
										});

									}
									else {
										await Swal.fire({
											title: "Nincs elég készlet",
											text: `Sajnáljuk, de a "${item.name}" nevű termékből már csak ${data.inventory_count} darab elérhető. Szeretnéd frissíteni a kosárban lévő mennyiséget?`,
											icon: "error",
											theme: isDarkTheme() ? "dark" : "light",
										}).then((result) => {
											if (result.isConfirmed) {
												dispatch(updateItemQuantity({ item_id: item.id, delta: data.inventory_count - item.quantity! }));
											}
										})
									}
								}
							})
					})
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			console.error("Failed to create order:", errorMessage);
			setCheckoutError(errorMessage);
			setIsSubmittingOrder(false);
		}
	};

	useEffect(() => {
		const fetchRinging = async () => {
			try {
				const data = await GetRinging();
				if (data && Array.isArray(data.breaks) && data.breaks.length > 0) {
					setRinging(data.breaks);
					setIsOrderingClosedByBackend(false);
				} else {
					setRinging([]);
					setIsOrderingClosedByBackend(true);
				}
				setIsAvailabilityLoaded(true);
			} catch (error) {
				console.error(error);
				setIsOrderingClosedByBackend(true);
				setIsAvailabilityLoaded(true);
			}
		};
		fetchRinging();
	}, []);

	const baseTotal = useMemo(
		() => cart.items.reduce((total, item) => total + item.price * (item.quantity ?? 0), 0),
		[cart.items],
	);

	return (
		<div className='bg-surface dark:bg-secondary-dark font-display antialiased'>
			<div className='relative flex h-full min-h-full w-full mx-auto flex-col overflow-x-hidden shadow-sm bg-surface dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800'>
				<div className='flex items-center bg-surface dark:bg-zinc-900 p-4 pb-2 justify-between sticky top-0 z-10'>
					<Link
						to='/main'
						className='text-foreground dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors'>
						<span className='material-symbols-outlined'>arrow_back</span>
					</Link>
					<h2 className='text-foreground dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12'>
						Átvétel Kiválasztása
					</h2>
				</div>
				<main className='flex-1 pb-6'>
					<div className='block animate-fade-in' id='pickup-section'>
						<div className='px-4 pt-4 pb-2'>
							<h3 className='text-foreground dark:text-white tracking-tight text-2xl font-bold leading-tight text-left'>
								Mikor szeretnéd átvenni?
							</h3>
						</div>
						<div className='flex flex-col gap-4 px-4 py-3'>
							<label className='flex flex-col flex-1'>
								<p className='text-foreground dark:text-zinc-300 text-sm font-medium leading-normal pb-2'>
									Válassz szünetet
								</p>
								<div className='relative'>
									<select
										value={deliverydatetime}
										onChange={(e) => setDeliverydatetime(e.target.value)}
										className='appearance-none w-full rounded-xl border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 h-14 pl-4 pr-10 text-base font-normal leading-normal text-foreground dark:text-white transition-shadow outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20'>
										{orderingClosed ? (
											<option value='' disabled>
												{orderingClosedMessage ?? "Ma már nem lehet rendelni, kérlek térj vissza holnap!"}
											</option>
										) : null}
										<option value='' disabled={orderingUnavailable}>
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
									<div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted dark:text-zinc-500'>
										<span className='material-symbols-outlined'>expand_more</span>
									</div>
								</div>
							</label>
						</div>
						<div className='px-4 pb-4'>
							<div className='flex items-center gap-2 p-3 bg-primary/10 rounded-lg border mt-5 mb-4 border-primary/20'>
								<span className='material-symbols-outlined text-primary text-xl'>storefront</span>
								<p className='text-foreground dark:text-zinc-200 text-sm font-medium leading-normal '>
									Átvétel az iskolai büfében.
								</p>
							</div>
							{orderingClosed && (
								<div className='flex items-center gap-2 p-3 rounded-lg'>
									<span className='material-symbols-outlined text-red-500 dark:text-red-400 text-xl'>
										schedule
									</span>
									<p className='text-red-700 dark:text-red-400 text-sm font-medium leading-normal'>
										{orderingClosedMessage ?? "A rendelésfelvétel jelenleg szünetel. Kérünk, gyere vissza később."}
									</p>
								</div>
							)}
						</div>
					</div>
					<div className='h-px bg-[#e6e0db] dark:bg-zinc-800 mx-4 my-2'></div>
					<div className='px-4 py-4'>
						<div className='bg-white dark:bg-zinc-800/50 rounded-xl p-4 border border-[#e6e0db] dark:border-zinc-800 mb-8'>
							<button
								type='button'
								onClick={() => setIsCommentOpen((current) => !current)}
								className='flex w-full items-center justify-between gap-3 text-left'>
								<div>
									<h4 className='text-foreground dark:text-white text-lg font-bold'>
										Megjegyzés a rendeléshez
									</h4>
									<p className='mt-1 text-sm text-muted dark:text-zinc-400'>
										Opcionális kérés vagy megjegyzés a büfének.
									</p>
								</div>
								<span className='material-symbols-outlined text-muted dark:text-zinc-400'>
									{isCommentOpen ? "expand_less" : "expand_more"}
								</span>
							</button>
							{isCommentOpen && (
								<div className='mt-4'>
									<label
										className='block text-sm font-medium text-foreground dark:text-zinc-200 mb-2'
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
										className='w-full resize-none rounded-xl border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm text-foreground dark:text-white placeholder:text-muted dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20'
									/>
									{comment && (
										<div className='mt-2 flex justify-end'>
											<span className='text-xs text-muted dark:text-zinc-500'>
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
						<h4 className='text-foreground dark:text-white text-lg font-bold mb-4'>
							Rendelés összesítése
						</h4>
						<div className='bg-white dark:bg-zinc-800/50 rounded-xl p-4 space-y-3 border border-[#e6e0db] dark:border-zinc-800'>
								{isCartEmpty ? (
									<div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 dark:border-zinc-700 dark:bg-zinc-900/70'>
										<span className='material-symbols-outlined text-3xl text-muted dark:text-zinc-300'>shopping_cart_off</span>
										<p className='mt-2 text-muted dark:text-zinc-200 text-sm font-normal text-center'>
											A kosarad jelenleg üres.
										</p>
										<Link
											to='/main'
											className='mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e07b1a]'>
											Vissza a menühöz
										</Link>
									</div>
								) : (
									<>
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
														<p className='text-foreground dark:text-white text-sm font-medium'>
															{cartItem.name}
														</p>
													</div>
												</div>
												<div className='flex items-center gap-2 '>
													<div className='mt-1 flex items-center gap-2 float-end'>
														<QuantityControl
															size='sm'
															quantity={cartItem.quantity ?? 0}
															onIncrease={() => updateQuantity(cartItem, 1)}
															onDecrease={() => updateQuantity(cartItem, -1)}
														/>
													</div>
													<button
														onClick={() => removeItem(cartItem.id)}
														className='w-7 h-7 flex items-center justify-center hover:text-error/50 text-error rounded-md'>
														<span className='material-symbols-outlined text-sm'>close</span>
													</button>
													<p className='text-foreground dark:text-white text-sm font-medium'>
														{cartItem.price * (cartItem.quantity ?? 0)}Ft
													</p>
												</div>
											</div>
										))}
										<hr className='pt-4 pb-4 text-muted' />
										<div className='h-px bg-gray-200 dark:bg-zinc-700 my-3'></div>
										<div className='flex justify-between items-center mb-1'>
											<p className='text-muted dark:text-zinc-400 text-sm'>Részösszeg</p>
											<p className='text-foreground dark:text-white text-sm font-medium'>
												{Math.floor(baseTotal * DealerIncome)}Ft
											</p>
										</div>
										<div className='flex justify-between items-center mb-3'>
											<p className='text-muted dark:text-zinc-400 text-sm'>Adó</p>
											<p className='text-foreground dark:text-white text-sm font-medium'>
												{Math.ceil(baseTotal * dph)}Ft
											</p>
										</div>
										<hr className='pt-4 pb-4 text-muted' />
										<div className='flex justify-between items-center pt-1'>
											<p className='text-foreground dark:text-white text-base font-bold'>Összesen</p>
											<p className='text-foreground dark:text-white text-xl font-bold'>
												{Math.floor(baseTotal)}Ft
											</p>
										</div>
									</>
								)}
						</div>
					</div>
					{/* <div className="px-4 pb-6">
                        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-100 dark:border-yellow-900/40 mx-auto w-fit">
                            <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg">stars</span>
                            <p className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wide">+{Math.floor(baseTotal * SERVICE_FEE_RATE * 1.1)} pontot kapsz!</p>
                        </div>
                    </div> */}
				</main>
				<div className='w-full p-4 bg-surface dark:bg-zinc-900'>
					{checkoutError ? (
						<div className='mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'>
							{checkoutError}
						</div>
					) : null}
					{me?.role !== "admin" ? (
						<div className='flex gap-5'>
							<button
								onClick={() => handleCheckout(true)}
								disabled={orderingUnavailable || isSubmittingOrder}
								className={
									"w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all " +
									(orderingUnavailable
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
								disabled={orderingUnavailable || isSubmittingOrder}
								className={
									"w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all " +
									(orderingUnavailable
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
					) : (
						<div className='flex gap-5'>
							<button
								onClick={() => handleCheckout(true)}
								className={
									"w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all bg-primary hover:bg-[#e07b1a] text-white shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.98]"
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
										<span>Rendelés felvétele</span>
									</>
								)}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CheckoutPage;


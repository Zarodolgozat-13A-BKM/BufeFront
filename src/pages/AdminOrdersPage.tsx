import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { OrderModel } from "../Models/OrderModel";
import { GetAllActiveOrders, GetOneOrder } from "../services/OrderService";
import { echo } from "../lib/echo";
import DashBoardHeader from "../components/common/dashBoardHeader";
import { OrderComponent } from "../components/adminOrdersPage/OrderComponent";
import { GetRinging } from "../services/RingService";
import type { Ringlist } from "../Models/RingModel";
import { LoadingState } from "../components/common/LoadingState";

type OrderFilter = "upcoming-break" | "whole-day";
type SortDirection = "asc" | "desc";
type OrderSortKey = "order-number" | "status" | "username" | "pickup-time" | "total-price" | "created-at";

interface OrderStateChangedEvent {
	order_id: string | number;
}

const CLOSED_ORDER_STATUSES = new Set(["átadva", "törölve"]);

const isClosedOrder = (status: string): boolean => {
	return CLOSED_ORDER_STATUSES.has(status.trim().toLocaleLowerCase("hu-HU"));
};

const toMinutes = (time: string): number => {
	const [hour, minute] = time.split(":").map((value) => Number(value));
	return hour * 60 + minute;
};

const extractTime = (deliveryDate: string | null): string | null => {
	if (!deliveryDate) return null;
	const timeMatch = deliveryDate.match(/(\d{2}:\d{2})/);
	return timeMatch ? timeMatch[1] : null;
};

const toTimestamp = (value: string | null | undefined): number => {
	if (!value) return 0;
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? 0 : parsed;
};

const compareBySortKey = (a: OrderModel, b: OrderModel, key: OrderSortKey): number => {
	switch (key) {
		case "order-number":
			return a.order_identifier_number - b.order_identifier_number;
		case "status":
			return a.status.localeCompare(b.status, "hu-HU", { sensitivity: "base" });
		case "username":
			return a.user_username.localeCompare(b.user_username, "hu-HU", { sensitivity: "base" });
		case "pickup-time": {
			const aTime = extractTime(a.delivery_date) ?? "99:99";
			const bTime = extractTime(b.delivery_date) ?? "99:99";
			return aTime.localeCompare(bTime, "hu-HU", { numeric: true });
		}
		case "total-price":
			return (a.total_price ?? 0) - (b.total_price ?? 0);
		case "created-at":
		default:
			return toTimestamp(a.created_at ?? a.delivery_date) - toTimestamp(b.created_at ?? b.delivery_date);
	}
};

export const AdminOrdersPage = () => {
	const [orders, setOrders] = useState<OrderModel[]>([]);
	const [ringing, setRinging] = useState<Ringlist[]>([]);
	const [orderFilter, setOrderFilter] = useState<OrderFilter>("upcoming-break");
	const [sortKey, setSortKey] = useState<OrderSortKey>("created-at");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [isLoadingOrders, setIsLoadingOrders] = useState(true);
	const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
	const [latestAlert, setLatestAlert] = useState<string | null>(null);
	const [latestAlertOrderId, setLatestAlertOrderId] = useState<number | null>(null);
	const [highlightedOrderId, setHighlightedOrderId] = useState<number | null>(null);
	const [isAlertVisible, setIsAlertVisible] = useState(false);
	const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
		if (typeof window === "undefined") return true;
		return window.localStorage.getItem("admin-order-alert-sound") !== "off";
	});
	const audioContextRef = useRef<AudioContext | null>(null);
	const isAudioUnlockedRef = useRef(false);

	const ensureAudioContext = useCallback(async () => {
		if (typeof window === "undefined") {
			return null;
		}

		const AudioContextImpl = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioContextImpl) {
			return null;
		}

		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContextImpl();
		}

		if (audioContextRef.current.state === "suspended") {
			await audioContextRef.current.resume();
		}

		isAudioUnlockedRef.current = true;
		return audioContextRef.current;
	}, []);

	const playOrderAlertSound = useCallback(() => {
		if (!isSoundEnabled || typeof window === "undefined") {
			return;
		}

		try {
			const context = audioContextRef.current;
			if (!context || context.state !== "running") {
				void ensureAudioContext();
				return;
			}

			const oscillator = context.createOscillator();
			const gainNode = context.createGain();

			oscillator.type = "sine";
			oscillator.frequency.setValueAtTime(880, context.currentTime);
			gainNode.gain.setValueAtTime(0.001, context.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.02);
			gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.18);

			oscillator.connect(gainNode);
			gainNode.connect(context.destination);
			oscillator.start();
			oscillator.stop(context.currentTime + 0.2);
		} catch (audioError) {
			console.error("Failed to play admin alert sound:", audioError);
		}
	}, [ensureAudioContext, isSoundEnabled]);

	const triggerNewOrderAlert = useCallback((incomingOrder: OrderModel) => {
		setLatestAlert(`Uj rendeles #${incomingOrder.order_identifier_number} - ${incomingOrder.user_username.replaceAll(".", " ")}`);
		setLatestAlertOrderId(incomingOrder.id);
		setIsAlertVisible(true);
		playOrderAlertSound();
	}, [playOrderAlertSound]);

	const scrollToOrder = useCallback((orderId: number) => {
		const orderElement = document.getElementById(`admin-order-${orderId}`);
		if (!orderElement) return;

		orderElement.scrollIntoView({ behavior: "smooth", block: "center" });
		setHighlightedOrderId(orderId);

		window.setTimeout(() => {
			setHighlightedOrderId((current) => (current === orderId ? null : current));
		}, 3000);
	}, []);

	const handleAlertClick = useCallback(async () => {
		if (latestAlertOrderId == null) return;
		await ensureAudioContext();
		playOrderAlertSound();
		scrollToOrder(latestAlertOrderId);
	}, [ensureAudioContext, latestAlertOrderId, playOrderAlertSound, scrollToOrder]);

	const handleAlertClose = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setIsAlertVisible(false);
	}, []);

	const handleSoundToggle = useCallback(async () => {
		setIsSoundEnabled((prev) => !prev);
		await ensureAudioContext();
	}, [ensureAudioContext]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem("admin-order-alert-sound", isSoundEnabled ? "on" : "off");

		if (isSoundEnabled) {
			const unlockAudio = () => {
				void ensureAudioContext();
			};

			window.addEventListener("pointerdown", unlockAudio, { once: true });
			window.addEventListener("keydown", unlockAudio, { once: true });

			return () => {
				window.removeEventListener("pointerdown", unlockAudio);
				window.removeEventListener("keydown", unlockAudio);
			};
		}
	}, [ensureAudioContext, isSoundEnabled]);

	useEffect(() => {
		return () => {
			void audioContextRef.current?.close();
			audioContextRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!isAlertVisible) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setIsAlertVisible(false);
		}, 4500);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [isAlertVisible]);

	const refreshOrders = async () => {
		setIsRefreshingOrders(true);
		try {
			const freshOrders = await GetAllActiveOrders();
			setOrders(freshOrders.filter((order) => !isClosedOrder(order.status)));
		} catch (error) {
			console.error("Failed to refresh active orders:", error);
		} finally {
			setIsRefreshingOrders(false);
		}
	};

	useEffect(() => {
		let isDisposed = false;

		GetAllActiveOrders()
			.then((initialOrders) => {
				if (!isDisposed) {
					setOrders(initialOrders.filter((order) => !isClosedOrder(order.status)));
				}
			})
			.catch((error) => {
				console.error("Failed to load initial orders:", error);
			})
			.finally(() => {
				if (!isDisposed) {
					setIsLoadingOrders(false);
				}
			});

		const channelName = "orders_admin";
		const channel = echo.private(channelName);
		const pusherChannelName = `private-${channelName}`;
		const pusherChannel = echo.connector.pusher.channel(pusherChannelName);

		const handleOrderStateChanged = (event: OrderStateChangedEvent) => {
			console.log("order.state.changed event received:", event);
			GetOneOrder(String(event.order_id))
				.then((incomingOrder) => {
					if (isDisposed) return;
					setOrders((prev) => {
						const alreadyPresent = prev.some((order) => order.id === incomingOrder.id);
						const withoutCurrent = prev.filter((order) => order.id !== incomingOrder.id);
						if (isClosedOrder(incomingOrder.status)) {
							return withoutCurrent;
						}

						if (!alreadyPresent) {
							triggerNewOrderAlert(incomingOrder);
						}
						return [...withoutCurrent, incomingOrder];
					});
				})
				.catch((error) => {
					console.error("Failed to fetch updated order:", error);
				});
		};

		pusherChannel?.bind("pusher:subscription_succeeded", () => {
			console.log(`Echo subscribed to ${pusherChannelName}`);
		});

		pusherChannel?.bind("pusher:subscription_error", (status: number) => {
			console.error(`Echo subscription error on ${pusherChannelName}:`, status);
		});

		// Keep both variants: Laravel Echo may require a leading dot when using broadcastAs.
		channel.listen("order.state.changed", handleOrderStateChanged);
		channel.listen(".order.state.changed", handleOrderStateChanged);

		return () => {
			isDisposed = true;
			channel.stopListening("order.state.changed");
			channel.stopListening(".order.state.changed");
			pusherChannel?.unbind("pusher:subscription_succeeded");
			pusherChannel?.unbind("pusher:subscription_error");
			echo.leave(channelName);
		};
	}, [triggerNewOrderAlert]);

	useEffect(() => {
		const fetchRinging = async () => {
			try {
				const data = await GetRinging();
				if (data?.breaks) {
					setRinging(data.breaks);
				}
			} catch (error) {
				console.error("Failed to fetch ringing data:", error);
			}
		};

		fetchRinging();
	}, []);

	const nextBreakStart = useMemo(() => {
		if (ringing.length === 0) return null;

		const now = new Date();
		const nowMinutes = now.getHours() * 60 + now.getMinutes();
		const nextBreak = ringing.find((ring) => toMinutes(ring.end) > nowMinutes);
		return nextBreak ?? null;
	}, [ringing]);

	const filteredOrders = useMemo(() => {
		if (orderFilter === "whole-day") {
			return orders.filter((order) => order.items && order.items.length > 0);
		}

		if (!nextBreakStart) {
			return [];
		}

		const today = new Date().toISOString().split("T")[0];

		return orders
			.filter((order) => order.items && order.items.length > 0)
			.filter((order) => {
				const deliveryDate = order.delivery_date;
				const deliveryTime = extractTime(deliveryDate);

				return (
					deliveryDate?.split("T")[0] === today &&
					!!deliveryTime &&
					deliveryTime <= nextBreakStart.end
				);
			});
	}, [orders, nextBreakStart, orderFilter]);

	const sortedOrders = useMemo(() => {
		const directionMultiplier = sortDirection === "asc" ? 1 : -1;
		return filteredOrders
			.slice()
			.sort((a, b) => compareBySortKey(a, b, sortKey) * directionMultiplier);
	}, [filteredOrders, sortDirection, sortKey]);

	return (
		<div className='min-h-screen bg-background-light dark:bg-zinc-950 font-display antialiased'>
			<div className='relative mx-auto flex min-h-screen w-full flex-col overflow-x-auto shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800'>
				<DashBoardHeader name='Rendelések' showAdmin={false} backTo={"/admin"} />
				<div className='p-4 md:p-6 space-y-5'>
					<div className='w-full rounded-xl border border-[#e6e0db] bg-bg-light dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5'>
						<div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
							<div>
								<h2 className='text-xl font-bold text-text-dark dark:text-white tracking-tight'>
									Aktuális rendelések
								</h2>
								<p className='text-text-light dark:text-zinc-400 text-sm mt-1'>
									Éppen feldolgozás alatt lévő tételek
								</p>
								{orderFilter === "upcoming-break" && nextBreakStart?.start && (
									<span className='mt-1 block text-xs text-text-light dark:text-zinc-400'>
										Következő szünet kezdete: {nextBreakStart.start}
									</span>
								)}
							</div>
							<div className='flex flex-wrap items-center justify-end gap-2'>
								<div className='flex items-center gap-2 rounded-full border border-[#e6e0db] bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-800'>
									<span className='hidden text-[11px] font-semibold text-text-light dark:text-zinc-400 md:block'>Rendezés</span>
									<select
										value={sortKey}
										onChange={(event) => setSortKey(event.target.value as OrderSortKey)}
										className='rounded-full border border-transparent bg-transparent px-2 py-1 text-xs font-semibold text-text-dark outline-none focus:border-primary/40 dark:text-zinc-100 dark:[color-scheme:dark]'
									>
										<option className='bg-white text-text-dark dark:bg-zinc-900 dark:text-zinc-100' value='created-at'>Létrehozás ideje</option>
										<option className='bg-white text-text-dark dark:bg-zinc-900 dark:text-zinc-100' value='order-number'>Rendelésszám</option>
										<option className='bg-white text-text-dark dark:bg-zinc-900 dark:text-zinc-100' value='pickup-time'>Átvételi idő</option>
										<option className='bg-white text-text-dark dark:bg-zinc-900 dark:text-zinc-100' value='status'>Státusz</option>
										<option className='bg-white text-text-dark dark:bg-zinc-900 dark:text-zinc-100' value='username'>Felhasználó</option>
										<option className='bg-white text-text-dark dark:bg-zinc-900 dark:text-zinc-100' value='total-price'>Összeg</option>
									</select>
									<button
										type='button'
										onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
										className='rounded-full border border-[#e6e0db] px-2.5 py-1 text-xs font-semibold text-text-dark transition-colors hover:bg-bg-light dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-700'
									>
										{sortDirection === "asc" ? "Növekvő" : "Csökkenő"}
									</button>
								</div>
								<button
									type='button'
									onClick={handleSoundToggle}
									className='shrink-0 cursor-pointer rounded-full border border-[#e6e0db] bg-white px-3 py-1.5 text-xs font-semibold text-text-dark transition-colors hover:bg-bg-light dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
									<span className='inline-flex items-center gap-1'>
										<span className='material-symbols-outlined text-base leading-none'>
											{isSoundEnabled ? "notifications_active" : "notifications_off"}
										</span>
										{isSoundEnabled ? "Hang be" : "Hang ki"}
									</span>
								</button>
								<button
									type='button'
									onClick={refreshOrders}
									disabled={isRefreshingOrders}
									className='shrink-0 cursor-pointer rounded-full border border-[#e6e0db] bg-white px-3 py-1.5 text-xs font-semibold text-text-dark transition-colors hover:bg-bg-light disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
									{isRefreshingOrders ? 'Frissítés...' : 'Frissítés'}
								</button>
								<button
									type='button'
									onClick={() => setOrderFilter("upcoming-break")}
									className={
										"shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
										(orderFilter === "upcoming-break"
											? "border-primary bg-primary text-white"
											: "border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-dark dark:text-zinc-200")
									}>
									Következő szünet
								</button>
								<button
									type='button'
									onClick={() => setOrderFilter("whole-day")}
									className={
										"shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
										(orderFilter === "whole-day"
											? "border-primary bg-primary text-white"
											: "border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-dark dark:text-zinc-200")
									}>
									Egész nap
								</button>
								<span className='rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary'>
									{sortedOrders.length} db
								</span>
							</div>
						</div>

						{isLoadingOrders ? (
							<LoadingState message='Rendelések betöltése...' />
						) : sortedOrders.length === 0 ? (
							<div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e0db] bg-white py-10 dark:border-zinc-700 dark:bg-zinc-800'>
								<span className='material-symbols-outlined text-3xl text-text-light dark:text-zinc-400'>
									receipt_long
								</span>
								<p className='mt-2 text-text-light dark:text-zinc-300 text-sm font-normal leading-normal text-center'>
									{orderFilter === "upcoming-break"
										? nextBreakStart
											? "Jelenleg nincs rendelés a következő szünetig."
											: "Mára nincs több szünet."
										: "Jelenleg nincs aktív rendelés."}
								</p>
								<button
									type='button'
									onClick={refreshOrders}
									disabled={isRefreshingOrders}
									className='mt-4 rounded-lg border border-[#e6e0db] bg-white px-3 py-2 text-xs font-semibold text-text-dark transition-colors hover:bg-bg-light disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'>
									{isRefreshingOrders ? 'Frissítés...' : 'Frissítés'}
								</button>
							</div>
						) : (
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
								{sortedOrders.map((order) => (
									<OrderComponent key={order.id} order={order} highlighted={highlightedOrderId === order.id} />
								))}
							</div>
						)}
					</div>
				</div>
			</div>
			{isAlertVisible && latestAlert && (
				<div
					onClick={handleAlertClick}
					role='button'
					tabIndex={0}
					onKeyDown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							event.preventDefault();
							handleAlertClick();
						}
					}}
					className='fixed right-4 top-4 z-[100] max-w-sm cursor-pointer rounded-xl border border-emerald-200 bg-white px-4 py-3 text-emerald-800 shadow-2xl dark:border-emerald-900 dark:bg-zinc-900 dark:text-emerald-200'
				>
					<div className='flex items-start gap-2 pr-6'>
						<span className='material-symbols-outlined text-lg'>notifications_active</span>
						<div>
							<p className='text-xs font-semibold uppercase tracking-wide'>Új rendelés érkezett</p>
							<p className='mt-1 text-sm font-medium'>{latestAlert}</p>
						</div>
						<button
							type='button'
							onClick={handleAlertClose}
							aria-label='Értesítés bezárása'
							className='absolute right-2 top-2 rounded-full p-1 text-emerald-700 transition-colors hover:bg-emerald-100 dark:text-emerald-200 dark:hover:bg-zinc-800'
						>
							<span className='material-symbols-outlined text-base'>close</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrderModel } from "../Models/OrderModel";
import DashBoardHeader from "../components/dashBoardHeader";
import { echo } from "../lib/echo";
import { GetAllOrders, GetOneOrder } from "../services/OrderService";
import { useAppSelector } from "../store/hooks";

type WsOrderEvent = {
  order_id?: number | string;
  order_ids?: Array<number | string>;
  order?: OrderModel;
  orders?: OrderModel[];
};

const ORDER_STATUS = {
  PREPARING: "készítjük",
  READY: "átvehető",
  PAID: "fizetve",
  CANCELLED: "törölve",
  HANDED_OVER: "átadva",
  WAITING_PAYMENT: "fizetésre vár",
} as const;

const CLOSED_ORDER_STATUSES: Set<string> = new Set([ORDER_STATUS.CANCELLED, ORDER_STATUS.HANDED_OVER]);

const STATUS_PROGRESS: Record<string, number> = {
  [ORDER_STATUS.WAITING_PAYMENT]: 10,
  [ORDER_STATUS.PAID]: 35,
  [ORDER_STATUS.PREPARING]: 65,
  [ORDER_STATUS.READY]: 90,
  [ORDER_STATUS.HANDED_OVER]: 100,
  [ORDER_STATUS.CANCELLED]: 100,
};

const normalizeStatus = (status: string) => status.trim().toLocaleLowerCase("hu-HU");

const isOpenOrder = (order: OrderModel) => {
  return !CLOSED_ORDER_STATUSES.has(normalizeStatus(order.status));
};

const upsertOrders = (current: OrderModel[], next: OrderModel[]) => {
  const byId = new Map<number, OrderModel>(current.map((order) => [order.id, order]));
  next.forEach((order) => {
    if (isOpenOrder(order)) {
      byId.set(order.id, order);
    } else {
      byId.delete(order.id);
    }
  });
  return [...byId.values()];
};

const formatDeliveryDate = (deliveryDate: string | null) => {
  if (!deliveryDate) {
    return "Nincs megadva";
  }
  return new Date(deliveryDate).toLocaleString("hu-HU");
};

const formatPrice = (price: number) => `${price.toLocaleString("hu-HU")} Ft`;

const getStatusProgress = (status: string) => {
  return STATUS_PROGRESS[normalizeStatus(status)] ?? 45;
};

const getTimelineState = (status: string) => {
  const progress = getStatusProgress(status);
  if (progress >= 90) return 2;
  if (progress >= 55) return 1;
  return 0;
};

const getTimelineFillPercentage = (timelineState: number) => {
  if (timelineState >= 2) return 100;
  if (timelineState === 1) return 30;
  return 0;
};

const PostPaymentPage = () => {
  const me = useAppSelector((state) => state.auth.me);
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);

  const refreshOpenOrders = useCallback(async () => {
    const allOrders = await GetAllOrders();
    setOrders(allOrders.filter(isOpenOrder));
  }, []);

  const resolveOrdersFromEvent = useCallback(async (event: WsOrderEvent) => {
    const directOrders = (event.orders ?? (event.order ? [event.order] : [])).filter(isOpenOrder);
    if (directOrders.length > 0) {
      return directOrders;
    }

    const candidateIds = [
      ...(event.order_id != null ? [event.order_id] : []),
      ...(event.order_ids ?? []),
    ];

    if (candidateIds.length === 0) {
      return null;
    }

    const fetchedOrders = await Promise.all(
      candidateIds.map(async (orderId) => {
        try {
          return await GetOneOrder(String(orderId));
        } catch {
          return null;
        }
      })
    );

    const resolvedOrders = fetchedOrders.filter((order): order is OrderModel => order !== null);
    return resolvedOrders.length > 0 ? resolvedOrders : null;
  }, []);

  const sortedOrders = useMemo(() => {
    return orders.slice().sort((a, b) => b.id - a.id);
  }, [orders]);

  const selectedOrder = sortedOrders[selectedOrderIndex] ?? null;
  const timelineState = selectedOrder ? getTimelineState(selectedOrder.status) : 0;
  const timelineFill = getTimelineFillPercentage(timelineState);

  useEffect(() => {
    if (sortedOrders.length === 0) {
      setSelectedOrderIndex(0);
      return;
    }
    if (selectedOrderIndex > sortedOrders.length - 1) {
      setSelectedOrderIndex(0);
    }
  }, [sortedOrders, selectedOrderIndex]);

  useEffect(() => {
    const loadOpenOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await refreshOpenOrders();
      } catch (fetchError) {
        console.error("Failed to fetch open orders:", fetchError);
        setError("Nem sikerult betolteni a nyitott rendeleseidet.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOpenOrders();
  }, [refreshOpenOrders]);

  useEffect(() => {
    const timer = window.setTimeout(() => setCardsVisible(true), 40);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!me?.email) {
      return;
    }

    const channelName = `ordersOfUser.${me.email}`;
    const channel = echo.private(channelName);

    const handleOrderChange = async (event: WsOrderEvent) => {
      try {
        const resolvedOrders = await resolveOrdersFromEvent(event);

        if (resolvedOrders) {
          setOrders((prev) => upsertOrders(prev, resolvedOrders));
        } else {
          await refreshOpenOrders();
        }

        setLastUpdate(new Date());
      } catch (refreshError) {
        console.error("Failed to refresh orders after websocket event:", refreshError);
      }
    };

    channel.listen("order.state.changed", handleOrderChange);

    return () => {
      channel.stopListening("order.state.changed", handleOrderChange);
      echo.leave(channelName);
    };
  }, [me?.email, refreshOpenOrders, resolveOrdersFromEvent]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display antialiased">
      <div className="relative mx-auto flex min-h-screen w-full flex-col overflow-x-hidden shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800">
        <DashBoardHeader name="Rendeles kovetes" showAdmin={false} backTo="/me" />

        <div className="p-4 md:p-6">
          <div className="w-full rounded-xl border border-[#e6e0db] bg-bg-light dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-text-dark dark:text-white tracking-tight">
                  Nyitott rendeleseid
                </h2>
                <p className="text-text-light dark:text-zinc-400 text-sm mt-1">
                  A rendelesek allapota valos idoben frissul.
                </p>
                {lastUpdate && (
                  <span className="mt-1 block text-xs text-text-light dark:text-zinc-400">
                    Utolso frissites: {lastUpdate.toLocaleTimeString("hu-HU")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-text-light dark:text-zinc-300">Live kapcsolat</span>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                  {sortedOrders.length} db
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e0db] bg-white py-10 dark:border-zinc-700 dark:bg-zinc-800">
                <span className="material-symbols-outlined text-3xl text-text-light dark:text-zinc-400">sync</span>
                <p className="mt-2 text-text-light dark:text-zinc-300 text-sm font-normal leading-normal text-center">
                  Nyitott rendelések betöltése...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-white py-10 dark:border-red-900/60 dark:bg-zinc-800">
                <span className="material-symbols-outlined text-3xl text-red-500">error</span>
                <p className="mt-2 text-red-600 dark:text-red-300 text-sm font-medium text-center">{error}</p>
              </div>
            ) : sortedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e0db] bg-white py-10 dark:border-zinc-700 dark:bg-zinc-800">
                <span className="material-symbols-outlined text-3xl text-text-light dark:text-zinc-400">receipt_long</span>
                <p className="mt-2 text-text-light dark:text-zinc-300 text-sm font-normal leading-normal text-center">
                  Jelenleg nincs nyitott rendelés.
                </p>
              </div>
            ) : (
              selectedOrder && (
                <div
                  className={
                    "mx-auto w-full max-w-6xl rounded-2xl border border-[#e6e0db] bg-white/80 p-5 md:p-8 shadow-sm transition-all duration-500 dark:border-zinc-700 dark:bg-zinc-900/70 " +
                    (cardsVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
                  }
                >
                  <div className="mb-8 text-center flex items-center justify-center gap-2">
                    <div className="mt-3 flex items-center justify-center gap-3 text-sm font-semibold text-text-light dark:text-zinc-300">
                      <button
                        type="button"
                        aria-label="Előző rendelés"
                        onClick={() =>
                          setSelectedOrderIndex((prev) =>
                            prev === 0 ? sortedOrders.length - 1 : prev - 1
                          )
                        }
                        className="rounded-full p-1 text-primary transition-colors hover:bg-primary/10"
                      >
                        <span className="material-symbols-outlined">chevron_left</span>
                      </button>
                      <h2 className="text-3xl font-extrabold tracking-tight text-text-dark dark:text-white">
                        Rendelésszám: <span className="font-extrabold text-primary">#{selectedOrder.order_identifier_number}</span>
                      </h2>
                      <button
                        type="button"
                        aria-label="Következő rendelés"
                        onClick={() =>
                          setSelectedOrderIndex((prev) =>
                            prev === sortedOrders.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="rounded-full p-1 text-primary transition-colors hover:bg-primary/10"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                    <section className="md:col-span-7 rounded-2xl border border-[#e6e0db] bg-white p-6 md:p-8 dark:border-zinc-700 dark:bg-zinc-800">
                      <h3 className="mb-8 flex items-center gap-2 text-xl font-bold text-text-dark dark:text-white">
                        <span className="material-symbols-outlined text-primary">local_dining</span>
                        Rendelés állapota
                      </h3>
                      <div className="relative ml-2">
                        <div aria-hidden className="absolute left-4 top-10 bottom-10 w-0.5 bg-primary/20" />
                        <div
                          aria-hidden
                          className="absolute left-4 top-10 w-0.5 origin-top bg-primary transition-all duration-700 ease-out"
                          style={{ height: `${cardsVisible ? timelineFill : 0}%` }}
                        />

                        <div className="relative grid min-h-20 grid-cols-[24px_1fr] items-center gap-x-5">
                          <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <span className="material-symbols-outlined text-xs text-white">check</span>
                          </div>
                          <div>
                            <p className="font-bold text-text-dark dark:text-white">Rendelés fogadva</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-text-light dark:text-zinc-400">
                              {formatDeliveryDate(selectedOrder.delivery_date)}
                            </p>
                          </div>
                        </div>

                        <div className="relative grid min-h-20 grid-cols-[24px_1fr] items-center gap-x-4">
                          <div
                            className={
                              "z-10 flex h-8 w-8 items-center justify-center rounded-full " +
                              (timelineState === 1 ? "bg-primary animate-pulse" : "bg-primary/30")
                            }
                          >
                            <span className="material-symbols-outlined text-xs text-white">restaurant</span>
                          </div>
                          <div>
                            <p className="font-bold text-text-dark dark:text-white">Készítés alatt</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-text-light dark:text-zinc-400">
                              {selectedOrder.status}
                            </p>
                          </div>
                        </div>

                        <div className={"relative grid min-h-20 grid-cols-[24px_1fr] items-center gap-x-5 " + (timelineState >= 2 ? "opacity-100" : "opacity-45")}>
                          <div className={"z-10 flex h-8 w-8 items-center justify-center rounded-full " + (timelineState >= 2 ? "bg-primary" : "bg-primary/30")}>
                            <span className="material-symbols-outlined text-xs text-white">shopping_bag</span>
                          </div>
                          <div>
                            <p className="font-bold text-text-dark dark:text-white">Átvehető</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-text-light dark:text-zinc-400">
                              Várakozik
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6 md:col-span-5">
                      {selectedOrder.comment ? (
                      <article className="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg">
                        <div className="absolute inset-0 bg-linear-to-br from-primary to-[#ffae58]" />
                        <div className="relative z-10 flex flex-col items-center">
                          <span className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/80">Hozzáfűzésed</span>
                          <div className="mb-4 rounded-xl bg-white px-5 py-4 text-center shadow-md">
                            <p className="mt-1 text-2xl font-black tracking-[0.25em] text-[#6d3900]">
                              {selectedOrder.comment ? selectedOrder.comment.slice(0, 20).toUpperCase() : "N/A"}
                            </p>
                          </div>
                        </div>
                      </article>):null}

                      <article className="space-y-3 rounded-2xl border border-[#e6e0db] bg-bg-light p-5 dark:border-zinc-700 dark:bg-zinc-800/80">
                        <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3 dark:bg-zinc-900/60">
                          <span className="material-symbols-outlined mt-0.5 text-primary">schedule</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-light dark:text-zinc-400">Időpont</p>
                            <p className="mt-1 text-sm font-bold text-text-dark dark:text-zinc-100">{formatDeliveryDate(selectedOrder.delivery_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3 dark:bg-zinc-900/60">
                          <span className="material-symbols-outlined mt-0.5 text-primary">payments</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-light dark:text-zinc-400">Összeg</p>
                            <p className="mt-1 text-sm font-bold text-text-dark dark:text-zinc-100">{formatPrice(selectedOrder.total_price ?? 0)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3 dark:bg-zinc-900/60">
                          <span className="material-symbols-outlined mt-0.5 text-primary">timer</span>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-light dark:text-zinc-400">Becsült idő</p>
                            <p className="mt-1 text-sm font-bold text-text-dark dark:text-zinc-100">
                              {selectedOrder.default_completion_time != null ? `${selectedOrder.default_completion_time} perc` : "Nincs adat"}
                            </p>
                          </div>
                        </div>
                      </article>
                    </section>
                  </div>

                  <section className="mt-7 rounded-2xl border border-[#e6e0db] bg-white/70 p-5 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/60 md:p-6">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-light dark:text-zinc-400">Rendelt tételek</h3>
                    <ul className="space-y-3">
                      {(selectedOrder.items ?? []).map((item) => (
                        <li
                          key={item.item_id}
                          className="flex items-center justify-between gap-3 border-b border-primary/10 pb-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-bg-light dark:bg-zinc-700">
                              {item.picture_url ? (
                                <img
                                  src={item.picture_url}
                                  alt={item.item_name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-text-light dark:text-zinc-400">
                                  <span className="material-symbols-outlined text-[18px]">restaurant</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-text-dark dark:text-zinc-100">{item.item_name}</p>
                              <p className="text-xs text-text-light dark:text-zinc-400">{formatPrice(item.item_price)} / db</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-text-dark dark:text-zinc-100">x{item.quantity}</p>
                            <p className="text-xs font-semibold text-primary">{formatPrice(item.price)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPaymentPage;
import { useEffect, useMemo, useState } from "react";
import type { OrderModel } from "../Models/OrderModel";
import { GetAllActiveOrders } from "../services/OrderService";
import { echo } from "../lib/echo";
import DashBoardHeader from "../components/dashBoardHeader";
import { OrderComponent } from "../components/adminOrdersPage/OrderComponent";
import { GetRinging } from "../services/RingService";
import type { Ringlist } from "../Models/RingModel";

type OrderFilter = "upcoming-break" | "whole-day";

const toMinutes = (time: string): number => {
  const [hour, minute] = time.split(":").map((value) => Number(value));
  return hour * 60 + minute;
};

const extractTime = (deliveryDate: string | null): string | null => {
  if (!deliveryDate) return null;
  const timeMatch = deliveryDate.match(/(\d{2}:\d{2})/);
  return timeMatch ? timeMatch[1] : null;
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  const [ringing, setRinging] = useState<Ringlist[]>([]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("upcoming-break");

  useEffect(() => {
    GetAllActiveOrders().then(setOrders);
    echo.private("orders_admin").listen(".order.submitted", (e: any) => {
      setOrders((prev) => [...prev, e.order]);
    });
  }, []);

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

  const activeOrders = orders.filter((order) => order.items && order.items.length > 0);

  const nextBreakStart = useMemo(() => {
    if (ringing.length === 0) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nextBreak = ringing.find((ring) => toMinutes(ring.end) > nowMinutes);
    return nextBreak ?? null;
  }, [ringing]);

  useEffect(() => {
    if (!nextBreakStart && orderFilter === "upcoming-break") {
      setOrderFilter("whole-day");
    }
  }, [nextBreakStart, orderFilter]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "whole-day") {
      return activeOrders;
    }

    if (!nextBreakStart) {
      return [];
    }

    const today = new Date().toISOString().split("T")[0];

    return activeOrders.filter((order) => {
      const deliveryDate = order.delivery_date;
      const deliveryTime = extractTime(deliveryDate);

      return deliveryDate?.split("T")[0] === today && !!deliveryTime && deliveryTime <= nextBreakStart.end;
    });
  }, [activeOrders, nextBreakStart, orderFilter]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display antialiased">
      <div className="relative mx-auto flex min-h-screen w-full flex-col overflow-x-auto shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800">
        <DashBoardHeader name="Rendelések" showAdmin={false} backTo={"/admin"} />
        <div className="p-4 md:p-6 space-y-5">
          <div className="w-full rounded-xl border border-[#e6e0db] bg-bg-light dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-text-dark dark:text-white tracking-tight">Aktuális rendelések</h2>
                <p className="text-text-light dark:text-zinc-400 text-sm mt-1">Éppen feldolgozás alatt lévő tételek</p>
                {orderFilter === "upcoming-break" && nextBreakStart?.start && (
                  <span className="mt-1 block text-xs text-text-light dark:text-zinc-400">Következő szünet kezdete: {nextBreakStart.start}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOrderFilter("upcoming-break")}
                  className={"shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (orderFilter === "upcoming-break" ? "border-primary bg-primary text-white" : "border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-dark dark:text-zinc-200")}
                >
                  Következő szünet
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter("whole-day")}
                  className={"shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (orderFilter === "whole-day" ? "border-primary bg-primary text-white" : "border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-dark dark:text-zinc-200")}
                >
                  Egész nap
                </button>
                <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">{filteredOrders.length} db</span>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e0db] bg-white py-10 dark:border-zinc-700 dark:bg-zinc-800">
                <span className="material-symbols-outlined text-3xl text-text-light dark:text-zinc-400">receipt_long</span>
                <p className="mt-2 text-text-light dark:text-zinc-300 text-sm font-normal leading-normal text-center">{orderFilter === "upcoming-break" ? "Jelenleg nincs rendelés a következő szünetig." : "Jelenleg nincs aktív rendelés."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {filteredOrders.map((order) => (
                  <OrderComponent key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

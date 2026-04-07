import { useEffect, useMemo, useState } from "react";
import type { OrderModel } from "../../Models/OrderModel";
import { UpdateOrderStatus } from "../../services/OrderService";
import { useAppSelector } from "../../store/hooks";

const getOrderBaseDate = (order: OrderModel): Date | null => {
  const sourceDate = order.created_at ?? order.delivery_date;
  if (!sourceDate) return null;

  const parsedDate = new Date(sourceDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getSlaTone = (elapsedMinutes: number): "ok" | "warn" | "late" => {
  if (elapsedMinutes >= 25) return "late";
  if (elapsedMinutes >= 12) return "warn";
  return "ok";
};

export const OrderComponent = ({ order, highlighted = false }: { order: OrderModel; highlighted?: boolean }) => {
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const isCashPayment = order.payment_intent_id == null;
  const me = useAppSelector((state) => state.auth.me);
  const orderBaseDate = useMemo(() => getOrderBaseDate(order), [order]);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const elapsedMinutes = useMemo(() => {
    if (!orderBaseDate) return null;

    const elapsedMs = now - orderBaseDate.getTime();
    if (elapsedMs < 0) return 0;
    return Math.floor(elapsedMs / 60000);
  }, [now, orderBaseDate]);

  const slaTone = elapsedMinutes == null ? null : getSlaTone(elapsedMinutes);

  const trimmedComment = order.comment?.trim() ?? "";
  const hasComment = trimmedComment.length > 0;
  const commentText = hasComment ? trimmedComment : "Nincs megjegyzes";
  const canExpandComment = trimmedComment.length > 120;

  const handleStatusChange = async (newStatus: string) => {
    if (isUpdatingStatus) return;

    setStatusError(null);
    setIsUpdatingStatus(true);
    try {
      await UpdateOrderStatus(order.id, newStatus);
    } catch (error) {
      console.error("Failed to update order status:", error);
      setStatusError("A státusz frissítése nem sikerült. Próbáld újra.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  return <div id={`admin-order-${order.id}`} className={"bg-gray-200  dark:bg-zinc-800 rounded-xl p-4 md:p-5 border flex flex-col transition-all " + (highlighted ? "border-primary ring-2 ring-primary/40 shadow-lg shadow-primary/10 animate-pulse" : "border-[#e6e0db] dark:border-zinc-700 ") }>
    <div className="flex justify-between items-start mb-4">
      <div>
        <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-semibold rounded-full text-primary tracking-wider uppercase">{order.delivery_date}</span>
        <h4 className="mt-1 text-lg font-bold text-foreground dark:text-white">{order.user_username.replaceAll(".", " ") === me?.full_name ? "Helyben leadott rendelés" : order.user_username.replaceAll(".", " ")}</h4>
      </div>
      <div className="mt-1 flex flex-col items-end gap-1">
        <h4 className="text-lg text-end font-bold text-primary">#{order.order_identifier_number}</h4>
        {elapsedMinutes != null && (
          <span
            className={
              "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
              (slaTone === "late"
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/25 dark:text-red-300"
                : slaTone === "warn"
                  ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300")
            }
          >
            {elapsedMinutes} perc
          </span>
        )}
        <span className={"rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " + (isCashPayment ? (me?.full_name.replaceAll(" ", ".")!==order.user_username ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-300": "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-900/20 dark:text-purple-300" ): "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-900/20 dark:text-sky-300")}>
          {isCashPayment ? me?.full_name.replaceAll(" ", ".")!==order.user_username ? "Készpénz" : "Helyben" : "Kártya"}
        </span>
      </div>
    </div>
    <div className="grow space-y-2.5 mb-4">
      {order.items ? order.items.map((item) => (
        <div key={item.item_id} className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground dark:text-white">{item.quantity}x</span>
          <span className="text-sm font-medium text-foreground dark:text-zinc-200">{item.item_name}</span>
        </div>
      )) : ""}
    </div>
    {hasComment&&
    <div className="mb-6 rounded-lg border border-[#e6e0db] bg-surface px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted dark:text-zinc-400">Megjegyzés</p>
      <p className={"mt-1 text-sm text-foreground dark:text-zinc-200 wrap-break-word whitespace-pre-wrap " + (isCommentExpanded ? "" : "line-clamp-2")}>
        {commentText}
      </p>
      {hasComment && canExpandComment && (
        <button
          type="button"
          onClick={() => setIsCommentExpanded((prev) => !prev)}
          className="mt-2 text-xs font-semibold text-primary hover:text-primary-strong transition-colors"
        >
          {isCommentExpanded ? "Kevesebb" : "Teljes megjegyzés"}
        </button>
      )}
    </div>
}
    {statusError && (
      <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
        {statusError}
      </div>
    )}
    <div className="mt-auto flex gap-3">
      {order.status === "Fizetve" || order.payment_intent_id == null && order.status == "Fizetésre vár" ? (
        <button disabled={isUpdatingStatus} className="flex-1 min-h-12 rounded-xl bg-primary text-white text-sm font-semibold uppercase tracking-wide hover:bg-primary-strong transition-colors disabled:cursor-not-allowed disabled:opacity-70" onClick={() => handleStatusChange("Készítjük")}>{isUpdatingStatus ? "Mentés..." : "Készítem"}</button>
      ) :
        order.status === "Készítjük" ? (
          <button disabled={isUpdatingStatus} className="flex-1 min-h-12 rounded-xl bg-green-600 text-white text-sm font-semibold uppercase tracking-wide hover:bg-green-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70" onClick={() => handleStatusChange("Átvehető")}>{isUpdatingStatus ? "Mentés..." : "Kész"}</button>
        ) :
          order.status === "Átvehető" && order.payment_intent_id == null ? (
            <button disabled={isUpdatingStatus} className="flex-1 min-h-12 rounded-xl bg-red-600 text-white text-sm font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70" onClick={() => handleStatusChange("Átadva")}>{isUpdatingStatus ? "Mentés..." : "Fizetés után átadva"}</button>
          ) : order.status === "Átvehető" ? (
            <button disabled={isUpdatingStatus} className="flex-1 min-h-12 rounded-xl bg-gray-600 text-white text-sm font-semibold uppercase tracking-wide hover:bg-gray-700 transition-colors disabled:cursor-not-allowed disabled:opacity-70" onClick={() => handleStatusChange("Átadva")}>{isUpdatingStatus ? "Mentés..." : "Átadva"}</button>
          ) : null}
    </div>
  </div>;
};


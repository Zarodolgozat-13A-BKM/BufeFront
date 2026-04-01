import { useState } from "react";
import type { OrderModel } from "../../Models/OrderModel";
import { UpdateOrderStatus } from "../../services/OrderService";

export const OrderComponent = ({ order }: { order: OrderModel }) => {
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);

  const trimmedComment = order.comment?.trim() ?? "";
  const hasComment = trimmedComment.length > 0;
  const commentText = hasComment ? trimmedComment : "Nincs megjegyzes";
  const canExpandComment = trimmedComment.length > 120;

  const handleStatusChange = (newStatus: string) => {
    UpdateOrderStatus(order.id, newStatus);
  };
  return <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 md:p-5 border border-[#e6e0db] dark:border-zinc-700 flex flex-col hover:bg-bg-light dark:hover:bg-zinc-800/90 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
      <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-semibold rounded-full text-primary tracking-wider uppercase">{order.delivery_date}</span>
        <h4 className="text-lg font-bold text-text-dark dark:text-white mt-1">{order.user_username}</h4>
      </div>
        <h4 className="text-lg text-end font-bold text-primary mt-1">#{order.order_identifier_number}</h4>
    </div>
    <div className="grow space-y-2.5 mb-4">
      {order.items?order.items.map((item) => (
        <div key={item.item_id} className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-dark dark:text-white">{item.quantity}x</span>
          <span className="text-sm font-medium text-text-dark dark:text-zinc-200">{item.item_name}</span>
        </div>
      )):""}
    </div>
    <div className="mb-6 rounded-lg border border-[#e6e0db] bg-bg-light px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/60">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-light dark:text-zinc-400">Megjegyzes</p>
      <p className={"mt-1 text-sm text-text-dark dark:text-zinc-200 wrap-break-word whitespace-pre-wrap " + (isCommentExpanded ? "" : "line-clamp-2")}>
        {commentText}
      </p>
      {hasComment && canExpandComment && (
        <button
          type="button"
          onClick={() => setIsCommentExpanded((prev) => !prev)}
          className="mt-2 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          {isCommentExpanded ? "Kevesebb" : "Teljes megjegyzes"}
        </button>
      )}
    </div>
    <div className="flex gap-3 mt-auto">
      {order.status === "Fizetve"|| order.payment_intent_id== null && order.status=="Fizetésre vár" ? (
        <button className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition-colors" onClick={()=>handleStatusChange("Készítjük")}>Készítem</button>
      ):
      order.status === "Készítjük"? (
        <button className="flex-1 py-3 rounded-xl bg-green-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-green-700 transition-colors" onClick={()=>handleStatusChange("Átvehető")}>Kész</button>
      ):
      order.status === "Átvehető"? (
        <button className="flex-1 py-3 rounded-xl bg-gray-600 text-white text-xs font-semibold uppercase tracking-wider hover:bg-gray-700 transition-colors" onClick={()=>handleStatusChange("Átadva")}>Átadtam</button>
      ):null}
    </div>
  </div>;
};

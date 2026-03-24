import type { OrderModel } from "../../Models/OrderModel";

export const OrderComponent = ({ order }: { order: OrderModel }) => {
  return <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 md:p-5 border border-[#e6e0db] dark:border-zinc-700 flex flex-col hover:bg-bg-light dark:hover:bg-zinc-800/90 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div>
      <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-[10px] font-semibold rounded-full text-primary tracking-wider uppercase">{order.delivery_date}</span>
        <h4 className="text-lg font-bold text-text-dark dark:text-white mt-1">{order.user_username}</h4>
      </div>
        <h4 className="text-lg text-end font-bold text-primary mt-1">#{order.order_identifier_number}</h4>
    </div>
    <div className="flex-grow space-y-2.5 mb-6">
      {order.items?order.items.map((item) => (
        <div key={item.item_id} className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-dark dark:text-white">{item.quantity}x</span>
          <span className="text-sm font-medium text-text-dark dark:text-zinc-200">{item.item_name}</span>
        </div>
      )):""}
    </div>
    <div className="flex gap-3 mt-auto">
      <button className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition-colors">Kész</button>
    </div>
  </div>;
};

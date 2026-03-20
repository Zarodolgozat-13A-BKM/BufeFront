import type { OrderModel } from '../../Models/OrderModel'

type OrderItemProps = {
  order: OrderModel,
    handleOrder: (order: OrderModel) => void
}

const OrderItem = ({ order, handleOrder }: OrderItemProps) => {
    const formattedDate = order.delivery_date
      ? new Date(order.delivery_date).toLocaleString('hu-HU')
      : 'Nincs megadva'

    return (

            <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/20 dark:hover:bg-slate-900/30">
                <div className="mb-3 flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-700">
                    <div>
                        <p className="text-slate-900 dark:text-white text-sm font-semibold leading-normal">{formattedDate}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal mt-0.5">Rendelés #{order.order_identifier_number}</p>
                    </div>
                    <p className="text-primary font-bold leading-normal">{(order.total_price ?? 0).toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="flex justify-between gap-4">
                    <div className="flex flex-1 flex-col justify-center">
                        <ul className="text-slate-700 dark:text-slate-300 text-sm font-normal leading-relaxed list-disc list-inside">
                            {(order.items ?? []).map((lineItem) => (
                                <li key={lineItem.item_id}>
                                    {lineItem.item_name} x {lineItem.quantity}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="shrink-0 flex items-end">
                        <button className="flex h-9 w-fit items-center justify-center gap-1 rounded-lg bg-primary px-4 text-sm font-medium leading-normal text-white transition-colors hover:bg-primary-hover" onClick={() => handleOrder(order)}>
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            <span>Újra</span>
                        </button>
                    </div>
                </div>
            </div>
    )
}

export default OrderItem
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

            <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                    <div>
                        <p className="text-slate-900 dark:text-white text-sm font-semibold leading-normal">{formattedDate}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-normal leading-normal mt-0.5">Rendelés #{order.order_identifier_number}</p>
                    </div>
                    <p className="text-primary font-bold leading-normal">{(order.total_price ?? 0).toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="flex gap-4 justify-between">
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
                        <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary text-white text-sm font-medium leading-normal w-fit transition-colors hover:bg-primary/90 shadow-sm shadow-primary/30 gap-1" onClick={() => handleOrder(order)}>
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            <span>Újra</span>
                        </button>
                    </div>
                </div>
            </div>
    )
}

export default OrderItem
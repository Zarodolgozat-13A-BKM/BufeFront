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

            <div className="flex flex-col rounded-xl border border-[#e6e0db] bg-white p-4 transition-colors hover:bg-bg-light dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-800/80">
                <div className="mb-3 flex items-start justify-between border-b border-[#e6e0db] pb-3 dark:border-zinc-700">
                    <div>
                        <p className="text-text-dark dark:text-white text-sm font-semibold leading-normal">{formattedDate}</p>
                        <p className="text-text-light dark:text-zinc-400 text-xs font-normal leading-normal mt-0.5">Rendelés #{order.order_identifier_number}</p>
                    </div>
                    <p className="text-primary font-bold leading-normal">{(order.total_price ?? 0).toLocaleString('hu-HU')} Ft</p>
                </div>
                <div className="flex justify-between gap-4">
                    <div className="flex flex-1 flex-col justify-center">
                        <ul className="text-text-dark dark:text-zinc-300 text-sm font-normal leading-relaxed list-disc list-inside">
                            {(order.items ?? []).map((lineItem) => (
                                <li key={lineItem.item_id}>
                                    {lineItem.item_name} x {lineItem.quantity}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="shrink-0 flex items-end">
                        <button className="flex h-10 w-fit items-center justify-center gap-1 rounded-xl bg-primary px-4 text-sm font-bold leading-normal text-white transition-colors hover:bg-[#e07b1a]" onClick={() => handleOrder(order)}>
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            <span>Újra</span>
                        </button>
                    </div>
                </div>
            </div>
    )
}

export default OrderItem
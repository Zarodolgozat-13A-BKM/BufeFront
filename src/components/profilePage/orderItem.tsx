import { Link } from 'react-router'
import type { OrderModel } from '../../Models/OrderModel'
import BlinkingCircle from '../common/blinker'

type OrderItemProps = {
    order: OrderModel,
    handleOrder: (order: OrderModel) => void
}

const OrderItem = ({ order, handleOrder }: OrderItemProps) => {
    const formattedDate = order.delivery_date
        ? new Date(order.delivery_date).toLocaleString('hu-HU')
        : 'Nincs megadva'
    console.log(order)
    return (
        < div className="flex flex-col rounded-xl border border-[#e6e0db] bg-white p-4 transition-colors hover:bg-surface dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-800/80" >
            <div className="mb-3 flex items-start justify-between border-b border-[#e6e0db] pb-3 dark:border-zinc-700">
                <div>
                    <div className='flex items-center gap-5'>
                        <p className="text-foreground dark:text-white text-sm font-semibold leading-normal">{formattedDate}</p>
                        {order.status == "Fizetve" ?
                            <BlinkingCircle color='#3cff00ff' size='10px' ></BlinkingCircle> :
                            null
                        }
                    </div>
                    <p className="text-muted dark:text-zinc-400 text-xs font-normal leading-normal mt-0.5">Rendelés #{order.order_identifier_number}</p>
                </div>
                <p className="text-primary font-bold leading-normal">{(order.total_price ?? 0).toLocaleString('hu-HU')} Ft</p>
            </div>
            <div className="flex justify-between gap-4">
                <div className="flex flex-1 flex-col justify-center">
                    <ul className="text-foreground dark:text-zinc-300 text-sm font-normal leading-relaxed list-disc list-inside">
                        {(order.items ?? []).map((lineItem) => (
                            <li key={lineItem.item_id}>
                                {lineItem.item_name} x {lineItem.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="shrink-0 flex items-end">
                    {order.status !== "Átadva" && order.status !== "Törölve" ?
                        <Link to="/orderstatus" className="flex h-10 w-fit items-center justify-center gap-1 rounded-xl bg-[#006400] px-4 text-sm font-bold leading-normal text-white transition-colors hover:bg-[#004225]" ><span className="material-symbols-outlined">fastfood</span> Rendelés követése</Link>
                        :
                        <button className="flex h-10 w-fit items-center justify-center gap-1 rounded-xl bg-primary px-4 text-sm font-bold leading-normal text-white transition-colors hover:bg-[#e07b1a]" onClick={() => handleOrder(order)}>
                            <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                            <span>Újra</span>
                        </button>
                    }
                </div>
            </div>
        </div >
    )
}

export default OrderItem

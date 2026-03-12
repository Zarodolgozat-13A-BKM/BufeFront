import type { OrderModel } from '../../Models/OrderModel'
import { type ReactNode, useEffect, useRef, useState } from 'react'

type SortDir = 'asc' | 'desc'

type SortableOrderField = 'id' | 'user_id' | 'order_identifier_number' | 'status' | 'delivery_date'

const STATUSES = ['Fizetésre vár', 'Fizetve', 'Készítjük', 'Átvehető', 'Átadva', 'Törölve']

interface OrdersTableProps {
    sortedOrders: OrderModel[]
    orderSortField: SortableOrderField
    orderSortDir: SortDir
    handleOrderSort: (field: SortableOrderField) => void
    handleOrderStatusChange: (order: OrderModel, status: string) => void
    sortIcon: (field: string, activeField: string, dir: SortDir) => ReactNode
}

const STATUS_STYLES: Record<string, string> = {
    'Fizetve':        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    'Átadva':         'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    'Átvehető':       'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    'Készítjük':      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    'Fizetésre vár':  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    'Törölve':        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
}

const statusStyle = (status: string) =>
    STATUS_STYLES[status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'

const OrdersTable = ({
    sortedOrders,
    orderSortField,
    orderSortDir,
    handleOrderSort,
    handleOrderStatusChange,
    sortIcon,
}: OrdersTableProps) => {
    const [openStatusId, setOpenStatusId] = useState<number | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setOpenStatusId(null)
            }
        }

        if (openStatusId !== null) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [openStatusId])

    return (
        <div className="overflow-x-auto rounded-xl border border-primary/15">
            <table className="w-full text-sm text-left border-collapse min-w-180">
                <thead className="bg-primary/5 dark:bg-primary/10 border-b border-primary/20 text-gray-700 dark:text-gray-200">
                    <tr className="h-10">
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('id')}>
                            ID{sortIcon('id', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('order_identifier_number')}>
                            Rendelésszám{sortIcon('order_identifier_number', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('user_id')}>
                            Felhasználó ID{sortIcon('user_id', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('status')}>
                            Státusz{sortIcon('status', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('delivery_date')}>
                            Szállítási dátum{sortIcon('delivery_date', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 font-semibold uppercase tracking-wide text-[11px] text-center">
                            Termékek
                        </th>
                        <th className="py-2 px-3 font-semibold uppercase tracking-wide text-[11px] text-center">
                            Végösszeg
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedOrders.map((order: OrderModel) => (
                        <tr key={order.id} className="h-14 border-b border-primary/10 dark:border-primary/20 hover:bg-orange-50/70 dark:hover:bg-zinc-800/80 transition-colors">
                            <td className="py-2 px-3 font-medium text-black dark:text-white text-center">{order.id}</td>
                            <td className="py-2 px-3 font-medium text-black dark:text-white text-center">#{order.order_identifier_number}</td>
                            <td className="py-2 px-3 text-black dark:text-white text-center">{order.user_id}</td>
                            <td className="py-2 px-3 text-center">
                                <div className="relative inline-block" ref={openStatusId === order.id ? popoverRef : undefined}>
                                    <button
                                        type="button"
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:brightness-95 ${statusStyle(order.status)}`}
                                        onClick={() => setOpenStatusId(openStatusId === order.id ? null : order.id)}
                                    >
                                        <span>{order.status}</span>
                                        <span className="text-[10px]">▾</span>
                                    </button>
                                    {openStatusId === order.id && (
                                        <div className="absolute left-1/2 z-50 mt-2 w-40 -translate-x-1/2 overflow-hidden rounded-xl border border-primary/20 bg-white shadow-lg dark:bg-zinc-900">
                                            {STATUSES.map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    className={`block w-full px-3 py-2 text-left text-xs font-semibold transition hover:bg-primary/10 ${status === order.status ? 'bg-primary/10 text-primary' : 'text-gray-700 dark:text-gray-200'}`}
                                                    onClick={() => {
                                                        handleOrderStatusChange(order, status)
                                                        setOpenStatusId(null)
                                                    }}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-3 text-black dark:text-white text-center">
                                {order.delivery_date
                                    ? new Date(order.delivery_date).toLocaleDateString('hu-HU')
                                    : <span className="text-gray-400 dark:text-gray-600">—</span>
                                }
                            </td>
                            <td className="py-2 px-3 text-center">
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                                    {order.items?.length ?? 0} db
                                </span>
                            </td>
                            <td className="py-2 px-3 text-black dark:text-white text-center font-medium">
                                {(order.total_price ?? 0).toLocaleString('hu-HU')} Ft
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default OrdersTable

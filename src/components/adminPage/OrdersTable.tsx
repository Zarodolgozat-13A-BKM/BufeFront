import type { OrderModel } from '../../Models/OrderModel'
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react'

type SortDir = 'asc' | 'desc'

type SortableOrderField = 'id' | 'user_id' | 'order_identifier_number' | 'status' | 'delivery_date' | 'total_price'

const STATUSES = ['Fizetésre vár', 'Fizetve', 'Készítjük', 'Átvehető', 'Átadva', 'Törölve']

interface OrdersTableProps {
    sortedOrders: OrderModel[]
    orderSortField: SortableOrderField
    orderSortDir: SortDir
    handleOrderSort: (field: SortableOrderField) => void
    handleOrderStatusChange: (order: OrderModel, status: string) => Promise<void> | void
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
    const [pendingStatusId, setPendingStatusId] = useState<number | null>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([])

    const toggleExpanded = (id: number) => {
        setExpandedRowKeys((prev) => {
            if (prev.includes(id)) return prev.filter((rowId) => rowId !== id)
            return [...prev, id]
        })
    }

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
        <div className="overflow-x-auto rounded-xl border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800">
            <table className="w-full text-sm text-left border-collapse min-w-180">
            <thead className="bg-surface dark:bg-zinc-800/80 border-b border-[#e6e0db] dark:border-zinc-700 text-foreground dark:text-zinc-200">
                    <tr className="h-10">
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('id')}>
                            <span className="mr-1">▼</span>ID{sortIcon('id', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('order_identifier_number')}>
                            Rendelésszám{sortIcon('order_identifier_number', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('user_id')}>
                            Felhasználónév{sortIcon('user_id', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('status')}>
                            Státusz{sortIcon('status', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('delivery_date')}>
                            Szállítási dátum{sortIcon('delivery_date', orderSortField, orderSortDir)}
                        </th>
                        <th className="py-2 px-3 cursor-pointer select-none font-semibold uppercase tracking-wide text-[11px] text-center" onClick={() => handleOrderSort('total_price')}>
                            Végösszeg{sortIcon('total_price', orderSortField, orderSortDir)}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedOrders.map((order: OrderModel) => {
                        const isExpanded = expandedRowKeys.includes(order.id)
                        return (
                        <Fragment key={order.id}>
                        <tr
                            className="h-14 cursor-pointer border-b border-[#e6e0db] dark:border-zinc-700 hover:bg-surface dark:hover:bg-zinc-800/80 transition-colors"
                            onClick={() => toggleExpanded(order.id)}
                        >
                            <td className="py-2 px-3 font-medium text-foreground dark:text-white text-center select-none">
                                <span className="mr-1.5 text-xs text-muted dark:text-zinc-400">{isExpanded ? '▼' : '▶'}</span>
                                {order.id}
                            </td>
                            <td className="py-2 px-3 font-medium text-foreground dark:text-white text-center">#{order.order_identifier_number}</td>
                            <td className="py-2 px-3 text-foreground dark:text-white text-center">{order.user_username}</td>
                            <td className="py-2 px-3 text-center">
                                <div className="relative inline-block" ref={openStatusId === order.id ? popoverRef : undefined} onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        disabled={pendingStatusId === order.id}
                                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm md:text-xs font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 ${statusStyle(order.status)}`}
                                        onClick={() => setOpenStatusId(openStatusId === order.id ? null : order.id)}
                                    >
                                        <span>{order.status}</span>
                                        <span className="text-[10px]">▾</span>
                                    </button>
                                    {openStatusId === order.id && (
                                        <div className="absolute left-1/2 z-50 mt-2 w-40 -translate-x-1/2 overflow-hidden rounded-xl border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-900">
                                            {STATUSES.map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    disabled={pendingStatusId === order.id}
                                                    className={`block w-full px-3 py-2.5 text-left text-sm md:text-xs font-semibold transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-70 ${status === order.status ? 'bg-primary/10 text-primary' : 'text-foreground dark:text-zinc-200'}`}
                                                    onClick={async () => {
                                                        setPendingStatusId(order.id)
                                                        try {
                                                            await handleOrderStatusChange(order, status)
                                                            setOpenStatusId(null)
                                                        } finally {
                                                            setPendingStatusId(null)
                                                        }
                                                    }}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-2 px-3 text-foreground dark:text-white text-center">
                                {order.delivery_date
                                    ? new Date(order.delivery_date).toLocaleString('hu-HU')
                                    : <span className="text-muted dark:text-zinc-500">—</span>
                                }
                            </td>
                            <td className="py-2 px-3 text-foreground dark:text-white text-center font-medium">
                                {(order.total_price ?? 0).toLocaleString('hu-HU')} Ft
                            </td>
                        </tr>
                        {isExpanded && (
                            <tr className="bg-surface dark:bg-zinc-900/70 border-b border-[#e6e0db] dark:border-zinc-700">
                                <td colSpan={6} className="px-6 py-3">
                                    {!order.items || order.items.length === 0 ? (
                                        <p className="text-sm text-muted dark:text-zinc-400">Nincs termék ebben a rendelésben.</p>
                                    ) : (
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="text-muted dark:text-zinc-400 uppercase tracking-wide text-[10px] border-b border-[#e6e0db] dark:border-zinc-700">
                                                    <th className="py-1.5 pr-4 font-semibold">Termék neve</th>
                                                    <th className="py-1.5 pr-4 font-semibold text-center">Mennyiség</th>
                                                    <th className="py-1.5 pr-4 font-semibold text-right">Egységár</th>
                                                    <th className="py-1.5 font-semibold text-right">Összeg</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.items.map((item) => (
                                                    <tr key={item.item_id} className="border-b border-[#e6e0db] dark:border-zinc-800 last:border-0">
                                                        <td className="py-1.5 pr-4 font-medium text-foreground dark:text-white">{item.item_name}</td>
                                                        <td className="py-1.5 pr-4 text-center text-foreground dark:text-white">{item.quantity} db</td>
                                                        <td className="py-1.5 pr-4 text-right text-foreground dark:text-white">{item.item_price.toLocaleString('hu-HU')} Ft</td>
                                                        <td className="py-1.5 text-right font-semibold text-foreground dark:text-white">{item.price.toLocaleString('hu-HU')} Ft</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </td>
                            </tr>
                        )}
                        </Fragment>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default OrdersTable


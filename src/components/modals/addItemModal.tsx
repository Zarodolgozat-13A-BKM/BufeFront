import { useState } from 'react'
import { Modal } from './Modal'
import type { ItemModel } from '../../models/ItemModel'

interface AddItemModalProps {
    isOpen: boolean
    onClose: () => void
    item: ItemModel | null
    onUpdateQuantity: (itemId: number, delta: number) => void
    qty: number
}

export const AddItemModal = ({ isOpen, onClose, item, onUpdateQuantity, qty }: AddItemModalProps) => {
    if (!item) return null

    return (
        <AddItemModalContent
            key={`${isOpen}-${item.id}-${qty}`}
            isOpen={isOpen}
            onClose={onClose}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            qty={qty}
        />
    )
}

const AddItemModalContent = ({ isOpen, onClose, item, onUpdateQuantity, qty }: AddItemModalProps & { item: ItemModel }) => {
    const [quantity, setQuantity] = useState(qty > 0 ? qty : 1)

    const handleAddToCart = () => {
        const delta = quantity - qty
        if (delta !== 0) {
            onUpdateQuantity(item.id, delta)
        }
        onClose()
    }

    const totalPrice = item.price * quantity

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
            <div className="flex flex-col gap-6">
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                        src={item.picture_url ?? undefined}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                    {item.is_featured && (
                        <div className="absolute top-4 left-4 bg-primary px-3 py-1.5 rounded-full">
                            <span className="text-white text-sm font-bold">Featured</span>
                        </div>
                    )}
                    {!item.is_active && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xl font-bold">Unavailable</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {item.name}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {item.description || 'No description available.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-extrabold text-primary">
                            ${item.price}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">per item</span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Quantity
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                    className="w-12 h-12 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    disabled={!item.is_active}
                                >
                                    <span className="material-symbols-outlined">remove</span>
                                </button>
                                <span className="w-12 text-center font-bold text-gray-900 dark:text-white text-lg">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    disabled={!item.is_active}
                                >
                                    <span className="material-symbols-outlined">add</span>
                                </button>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                                Total: <span className="font-bold text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={!item.is_active}
                            className={`flex-1 py-3 rounded-lg font-bold bg-black text-white transition-all ${item.is_active
                                    ? 'bg-orange-500 hover:bg-primary/90 active:scale-[0.98]'
                                    : 'bg-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {item.is_active ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    Add to Cart
                                </span>
                            ) : (
                                'Currently Unavailable'
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

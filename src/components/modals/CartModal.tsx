import { Modal } from './Modal'
import type { ItemModel } from '../../models/ItemModel'
import type { OrderItem } from '../../Models/OrderModel'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: OrderItem[]
  allItems: ItemModel[]
  onUpdateQuantity: (itemId: number, delta: number) => void
  removeItem: (itemId: number) => void
  onCheckout: () => void
}

export const CartModal = ({
  isOpen,
  onClose,
  cartItems,
  allItems,
  onUpdateQuantity,
  removeItem,
  onCheckout
}: CartModalProps) => {
  const totalPrice = cartItems.reduce((sum, cartItem) => {
    const item = allItems.find(i => i.id === cartItem.item_id)
    return sum + (item ? item.price * cartItem.quantity : 0)
  }, 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kosarad" maxWidth="lg">
      <div className="space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            A kosarad üres
          </p>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cartItems.map((cartItem) => {
                const item = allItems.find(i => i.id === cartItem.item_id)
                if (!item) return null

                return (
                  <div key={cartItem.item_id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <img src={item.picture_url ?? undefined} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.price}Ft</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500" >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-8 text-center font-bold">{cartItem.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500" >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white min-w-15 text-right">
                      {(item.price * cartItem.quantity)}Ft
                    </div>
                    <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center bg-red-600 dark:bg-red-600 rounded-lg hover:bg-red-500 dark:hover:bg-red-500" >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Összesen:</span>
                <span className="dark:text-white text-primary">{totalPrice}Ft</span>
              </div>
              <button onClick={() => { onCheckout(); onClose() }} className="dark:bg-orange-500 dark:hover:bg-orange-600 w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors">Proceed to Checkout </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

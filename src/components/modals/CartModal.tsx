import { Modal } from './Modal'
import type { ItemModel } from '../../models/ItemModel'

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cartItems: { [key: string]: number }
  allItems: ItemModel[]
  onUpdateQuantity: (itemName: string, delta: number) => void
  onCheckout: () => void
}

export const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  allItems,
  onUpdateQuantity,
  onCheckout 
}: CartModalProps) => {
  const cartEntries = Object.entries(cartItems).filter(([_, count]) => count > 0)
  
  const totalPrice = cartEntries.reduce((sum, [itemName, count]) => {
    const item = allItems.find(i => i.name === itemName)
    return sum + (item ? item.price * count : 0)
  }, 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Your Cart" maxWidth="lg">
      <div className="space-y-4">
        {cartEntries.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Your cart is empty
          </p>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cartEntries.map(([itemName, count]) => {
                const item = allItems.find(i => i.name === itemName)
                if (!item) return null
                
                return (
                  <div key={itemName} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <img 
                      src={item.picture_url ?? undefined} 
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onUpdateQuantity(itemName, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-8 text-center font-bold">{count}</span>
                      <button 
                        onClick={() => onUpdateQuantity(itemName, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white min-w-[60px] text-right">
                      ${(item.price * count).toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  onCheckout()
                  onClose()
                }}
                className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

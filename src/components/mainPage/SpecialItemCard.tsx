import { useState } from 'react'
import type { ItemModel } from '../../Models/ItemModel'
import { QuantityControl } from './QuantityControl'

interface SpecialItemCardProps {
  item: ItemModel
  showModal: (item: ItemModel) => void
  quantity: number
  onUpdateQuantity: (itemId: number, delta: number) => void
}

export const SpecialItemCard = ({ item, showModal, quantity, onUpdateQuantity }: SpecialItemCardProps) => {
  const [isQtyHovered, setIsQtyHovered] = useState(false)

  return (
    <div className={`snap-center shrink-0 flex flex-col gap-3 rounded-2xl bg-white dark:bg-gray-900 border-2 border-primary/20 dark:border-primary/40 shadow-lg min-w-65 w-65 overflow-hidden transition-all duration-300 relative ${isQtyHovered ? '' : 'group hover:shadow-xl'}${item.is_active ? '' : ' opacity-50 cursor-not-allowed'}`}>
      <button onClick={() => item.is_active ? showModal(item) : null} className="cursor-pointer absolute inset-0 z-10 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-6xl text-white font-light material-symbols-outlined">add</span>
      </button>
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: `url("${item.picture_url}")` }}
        ></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-1 gap-3">
        <div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-black dark:text-white text-lg font-bold leading-tight line-clamp-1">
              {item.name}
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs font-medium leading-normal">
            {item.description?.substring(0, 60)}{item.description && item.description.length > 60 ? '...' : ''}
          </p>
        </div>
        <div className="mt-auto flex items-end justify-between">
          <p className="text-primary text-xl font-extrabold leading-normal">{item.price}Ft</p>
          <div
            className="z-20 relative"
            onMouseEnter={() => setIsQtyHovered(true)}
            onMouseLeave={() => setIsQtyHovered(false)}
          >
            {item.is_active ? (
              <QuantityControl
                quantity={quantity}
                onDecrease={() => onUpdateQuantity(item.id, -1)}
                onIncrease={() => onUpdateQuantity(item.id, 1)}
                size="sm"
                shadowClassName="shadow-lg"
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

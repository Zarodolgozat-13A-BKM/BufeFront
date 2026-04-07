import type { ItemModel } from '../../Models/ItemModel'
import { QuantityControl } from './QuantityControl'

interface MenuItemCardProps {
  item: ItemModel
  quantity: number
  showModal: (item: ItemModel) => void
  onUpdateQuantity: (item: ItemModel, delta: number) => void

}

export const MenuItemCard = ({ item, quantity, showModal, onUpdateQuantity }: MenuItemCardProps) => {
  return (
    <div className={"relative flex items-center gap-4 bg-white dark:bg-zinc-800/50 p-3 rounded-xl border border-[#e6e0db] dark:border-zinc-800 transition-all cursor-pointer overflow-hidden" + (item.is_active ? "" : " opacity-50 cursor-not-allowed")}>
      <button onClick={() => item.is_active? showModal(item) : null} className="cursor-pointer text-white text-4xl absolute inset-0 z-10 rounded-xl bg-black/40 opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-6xl text-white font-light material-symbols-outlined">add</span>
      </button>

      <div className="relative">
        <div
          className="w-24 h-24 shrink-0 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url("${item.picture_url}")` }}
        ></div>
      </div>
      {item.is_featured ? (
        <div className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full shadow-lg">
          <span className="material-symbols-outlined">star</span>
        </div>
      ):("")}
      <div className="flex flex-1 flex-col h-24 justify-between py-1">
        <div>
          <div className="flex justify-between">
            <h4 className="text-foreground dark:text-white font-bold text-base line-clamp-1">
              {item.name}
            </h4>
          </div>
          <p className="text-muted dark:text-zinc-400 text-xs mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-primary font-bold text-lg">
            {item.price}Ft
          </span>
          <div
            className="flex gap-5 items-center rounded-lg overflow-hidden z-20 relative"
          >
            {item.is_active? <QuantityControl
              quantity={quantity}
              onDecrease={() => onUpdateQuantity(item, -1)}
              onIncrease={() => onUpdateQuantity(item, 1)}
              size="sm"
              shadowClassName="shadow-md"
            />: null}
          </div>
        </div>
      </div>
    </div>
  )
}


import type { ItemModel } from '../../models/ItemModel'

interface MenuItemCardProps {
  item: ItemModel
  quantity: number
  showModal: (item: ItemModel) => void
}

export const MenuItemCard = ({ item, quantity, showModal }: MenuItemCardProps) => {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
      <div
        className="w-24 h-24 shrink-0 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url("${item.picture_url}")` }}
      ></div>
      <div className="flex flex-1 flex-col h-24 justify-between py-1">
        <div>
          <div className="flex justify-between">
            <h4 className="text-[#181411] dark:text-white font-bold text-base line-clamp-1">
              {item.name}
            </h4>
          </div>
          <p className="text-[#897561] dark:text-gray-400 text-xs mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[#181411] dark:text-white font-bold text-lg">
            ${item.price.toFixed(2)}
          </span>
          <div className="flex gap-5 items-center dark:bg-white/10 rounded-lg overflow-hidden">
            <button onClick={() => showModal(item)} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black text-white transition-transform active:scale-90 hover:bg-gray-800" >
                {quantity === 0 ? (
                  <span className="material-symbols-outlined text-sm">add</span>
                ) : (
                  <span className="text-sm">{quantity}</span>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

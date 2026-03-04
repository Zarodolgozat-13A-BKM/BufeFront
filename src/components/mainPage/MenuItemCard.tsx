import type { ItemModel } from '../../models/ItemModel'

interface MenuItemCardProps {
  item: ItemModel
  quantity: number
  showModal: (item: ItemModel) => void
}

export const MenuItemCard = ({ item, quantity, showModal }: MenuItemCardProps) => {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-orange-500/50 transition-all">
      <div className="relative">
        <div
          className="w-24 h-24 shrink-0 rounded-lg bg-cover bg-center ring-2 ring-orange-500/20"
          style={{ backgroundImage: `url("${item.picture_url}")` }}
        ></div>
      </div>
      <div className="flex flex-1 flex-col h-24 justify-between py-1">
        <div>
          <div className="flex justify-between">
            <h4 className="text-black dark:text-white font-bold text-base line-clamp-1">
              {item.name}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-orange-500 font-bold text-lg">
            ${item.price.toFixed(2)}
          </span>
          <div className="flex gap-5 items-center rounded-lg overflow-hidden">
            <button onClick={() => showModal(item)} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-all active:scale-90" >
                {quantity === 0 ? (
                  <span className="material-symbols-outlined text-sm">add</span>
                ) : (
                  <span className="text-sm font-bold">{quantity}</span>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import type { ItemModel } from '../../Models/ItemModel'

interface MenuItemCardProps {
  item: ItemModel
  quantity: number
  showModal: (item: ItemModel) => void
}

export const MenuItemCard = ({ item, quantity, showModal }: MenuItemCardProps) => {
  return (
    <div className="relative flex items-center gap-4 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary/50 transition-all group cursor-pointer">
      <button onClick={() => showModal(item)} className="cursor-pointer absolute inset-0 z-10 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-6xl text-white font-light material-symbols-outlined">add</span>
      </button>

      <div className="relative">
        <div
          className="w-24 h-24 shrink-0 rounded-lg bg-cover bg-center ring-2 ring-primary/20"
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
            <h4 className="text-black dark:text-white font-bold text-base line-clamp-1">
              {item.name}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-primary font-bold text-lg">
            {item.price}Ft
          </span>
          <div className="flex gap-5 items-center rounded-lg overflow-hidden z-20 relative">
            {quantity === 0 ? ('') : (
              <button onClick={() => showModal(item)} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-hover transition-all active:scale-90" >
                <span className="text-sm font-bold">{quantity}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

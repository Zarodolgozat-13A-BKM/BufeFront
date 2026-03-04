import type { ItemModel } from '../../models/ItemModel'

interface SpecialItemCardProps {
  item: ItemModel
  showModal: (item: ItemModel) => void
  quantity: number
}

export const SpecialItemCard = ({ item, showModal, quantity }: SpecialItemCardProps) => {
  return (
    <div 
      className={`snap-center shrink-0 flex flex-col gap-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm min-w-[260px] w-[260px] overflow-hidden group ${
        item.is_active ? '' : 'disabled'
      }`}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <div 
          className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-105 transition-transform duration-500" 
          style={{ backgroundImage: `url("${item.picture_url}")` }}
        ></div>
      </div>
      <div className="flex flex-col p-4 pt-1 gap-3">
        <div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-[#181411] dark:text-white text-lg font-bold leading-tight line-clamp-1">
              {item.name}
            </p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-normal">
            {item.description?.substring(0,60)}{item.description && item.description.length > 60 ? '...' : ''}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-primary text-xl font-extrabold leading-normal">${item.price}</p>
            <button onClick={() => showModal(item)} className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg shadow-black/30 transition-transform active:scale-90 hover:bg-gray-800" >
              {quantity === 0 ? (
                <span className="material-symbols-outlined text-sm">add</span>
              ) : (
                <span className=" text-sm">{quantity}</span>
              )}
            </button>
        </div>
      </div>
    </div>
  )
}

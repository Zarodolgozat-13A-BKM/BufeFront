import type { ItemModel } from '../../models/ItemModel'

interface SpecialItemCardProps {
  item: ItemModel
  showModal: (item: ItemModel) => void
  quantity: number
}

export const SpecialItemCard = ({ item, showModal, quantity }: SpecialItemCardProps) => {
  return (
    <div 
      className={`snap-center shrink-0 flex flex-col gap-3 rounded-2xl bg-white dark:bg-gray-900 border-2 border-orange-500/20 dark:border-orange-500/40 shadow-lg hover:shadow-xl min-w-65 w-65 overflow-hidden group transition-all duration-300 ${
        item.is_active ? '' : 'disabled'
      }`}
    >
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <div 
          className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-110 transition-transform duration-500" 
          style={{ backgroundImage: `url("${item.picture_url}")` }}
        ></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
        <div className="absolute top-2 right-2 w-10 h-10 text-center text-2xl font-bold bg-orange-500 text-white px-2 py-1 rounded-full  shadow-lg"><span className="material-symbols-outlined">star</span></div>
      </div>
      <div className="flex flex-col p-4 pt-1 gap-3">
        <div>
          <div className="flex justify-between items-start mb-1">
            <p className="text-black dark:text-white text-lg font-bold leading-tight line-clamp-1">
              {item.name}
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-xs font-medium leading-normal">
            {item.description?.substring(0,60)}{item.description && item.description.length > 60 ? '...' : ''}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-orange-500 text-xl font-extrabold leading-normal">${item.price}</p>
            <button onClick={() => showModal(item)} className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all active:scale-90" >
              {quantity === 0 ? (
                <span className="material-symbols-outlined text-sm">add</span>
              ) : (
                <span className="text-sm font-bold">{quantity}</span>
              )}
            </button>
        </div>
      </div>
    </div>
  )
}

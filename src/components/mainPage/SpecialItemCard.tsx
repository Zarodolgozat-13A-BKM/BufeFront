import type { ItemModel } from '../../Models/ItemModel'

interface SpecialItemCardProps {
  item: ItemModel
  showModal: (item: ItemModel) => void
  quantity: number
}

export const SpecialItemCard = ({ item, showModal, quantity }: SpecialItemCardProps) => {
  return (
    <div className={`snap-center shrink-0 group flex flex-col gap-3 rounded-2xl bg-white dark:bg-gray-900 border-2 border-primary/20 dark:border-primary/40 shadow-lg hover:shadow-xl min-w-65 w-65 overflow-hidden group transition-all duration-300 relative ${item.is_active ? '' : 'disabled'}`}>
      <button onClick={() => showModal(item)} className="cursor-pointer absolute inset-0 z-10 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-6xl text-white font-light material-symbols-outlined">add</span>
      </button>
      <div className="relative w-full aspect-4/3 overflow-hidden">
        <div
          className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-110 transition-transform duration-500"
          style={{ backgroundImage: `url("${item.picture_url}")` }}
        ></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
      </div>
      <div className="flex flex-col p-4 pt-1 gap-3">
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
        <div className="flex items-center justify-between mt-1">
          <p className="text-primary text-xl font-extrabold leading-normal">{item.price}Ft</p>
            {quantity !== 0 ? (  
          <button onClick={() => showModal(item)} className="flex size-10 z-20  cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover transition-all active:scale-90" >
              <span className="text-sm font-bold">{quantity}</span>
          </button>
            ) : (
              ''
            )}
        </div>
      </div>
    </div>
  )
}

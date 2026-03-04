interface CartBarProps {
  totalItems: number
  totalPrice: number
  onClick?: () => void
}

export const CartBar = ({ totalItems, totalPrice, onClick }: CartBarProps) => {
  if (totalItems === 0) return null

  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1a120b] border-t border-gray-100 dark:border-white/5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
      <button onClick={onClick} className="w-full bg-black hover:bg-gray-800 text-white rounded-xl h-14 flex items-center justify-between px-5 shadow-lg shadow-black/25 transition-all active:scale-[0.99]">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 rounded-lg px-2 py-1 text-sm font-bold">
            {totalItems}
          </div>
          <span className="text-sm font-medium opacity-90">Kosarad</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold">${totalPrice.toFixed(2)}</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </div>
      </button>
    </div>
  )
}

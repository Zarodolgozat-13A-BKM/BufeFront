interface CartBarProps {
  totalItems: number
  totalPrice: number
  onClick?: () => void
}

export const CartBar = ({ totalItems, totalPrice, onClick }: CartBarProps) => {
  if (totalItems === 0) return null

  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 z-50">
      <button onClick={onClick} className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-16 flex items-center justify-between px-6 shadow-2xl transition-all active:scale-[0.98] border-2 border-orange-400">
        <div className="flex items-center gap-3">
          <div className="bg-white/30 backdrop-blur-sm rounded-xl px-3 py-1.5 text-base font-bold shadow-lg">
            {totalItems}
          </div>
          <span className="text-base font-bold">Kosarad</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold">{totalPrice}Ft</span>
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </div>
      </button>
    </div>
  )
}

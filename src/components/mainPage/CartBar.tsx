interface CartBarProps {
  totalItems: number
  totalPrice: number
  onClick?: () => void
}

export const CartBar = ({ totalItems, totalPrice, onClick }: CartBarProps) => {
  if (totalItems === 0) return null

  return (
    <div
      className="w-full p-4 bg-white dark:bg-zinc-900 border-t border-[#e6e0db] dark:border-zinc-800"
    >
      <button onClick={onClick} className="w-full h-12 bg-primary hover:bg-[#e07b1a] text-white rounded-xl text-base font-bold flex items-center justify-between px-4 transition-all active:scale-[0.98]">
        <div className="flex items-center gap-3">
          <div className="bg-white/30 rounded-md px-2 py-0.5 text-sm font-bold">
            {totalItems}
          </div>
          <span className="text-sm font-bold">Kosarad</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">{totalPrice}Ft</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </div>
      </button>
    </div>
  )
}

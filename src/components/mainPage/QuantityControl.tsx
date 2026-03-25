interface QuantityControlProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  size?: 'sm' | 'md'
  shadowClassName?: string
}

export const QuantityControl = ({
  quantity,
  onIncrease,
  onDecrease,
  size = 'sm',
  shadowClassName = 'shadow-md',
}: QuantityControlProps) => {
  const isSmall = size === 'sm'
  const buttonSizeClass = isSmall ? 'h-9 w-9' : 'h-10 w-10'
  const minWidthClass = isSmall ? 'min-w-10' : 'min-w-11'
  const textClass = isSmall ? 'text-sm' : 'text-sm'

  if (quantity > 0) {
    return (
      <div className={`flex items-center rounded-full bg-primary text-white overflow-hidden ${shadowClassName}`}>
        <button
          type="button"
          onClick={onDecrease}
          aria-label="Mennyiség csökkentése"
          className={`${buttonSizeClass} flex cursor-pointer items-center justify-center hover:bg-primary-hover transition-all active:scale-90`}
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <button
          type="button"
          disabled={true}
          aria-label="Mennyiség növelése"
          className={`${buttonSizeClass} ${minWidthClass} px-2 flex cursor-pointer items-center justify-center ${textClass} font-bold border-x border-white/30 `}
        >
          {quantity}
        </button>
        <button
          type="button"
          onClick={onIncrease}
          aria-label="Mennyiség növelése"
          className={`${buttonSizeClass} flex cursor-pointer items-center justify-center hover:bg-primary-hover transition-all active:scale-90`}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onIncrease}
      aria-label="Hozzáadás a kosárhoz"
      className={`flex ${isSmall ? 'size-9' : 'size-10'} cursor-pointer items-center justify-center rounded-full bg-primary text-white ${shadowClassName} hover:bg-primary-hover transition-all active:scale-90`}
    >
      <span className="material-symbols-outlined">add</span>
    </button>
  )
}
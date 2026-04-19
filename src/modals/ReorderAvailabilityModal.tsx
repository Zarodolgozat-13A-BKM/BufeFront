import { Modal } from "./Modal"

export type ReorderUnavailableItem = {
  itemId: number
  name: string
  quantity: number
  reason: string
}

type ReorderAvailabilityModalProps = {
  isOpen: boolean
  unavailableItems: ReorderUnavailableItem[]
  onClose: () => void
  onContinueWithoutUnavailable: () => void
  onScrapCart: () => void
}

export const ReorderAvailabilityModal = ({
  isOpen,
  unavailableItems,
  onClose,
  onContinueWithoutUnavailable,
  onScrapCart,
}: ReorderAvailabilityModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Néhány tétel nem elérhető"
      maxWidth="lg"
    >
      <p className="text-sm text-muted dark:text-zinc-300">
        Az alábbi tételek nem tehetők most a kosárba:
      </p>

      <div className="mt-4 space-y-3">
        {unavailableItems.map((item) => (
          <div
            key={`${item.itemId}-${item.name}`}
            className="rounded-lg border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3"
          >
            <p className="text-sm font-semibold text-foreground dark:text-white">{item.name}</p>
            <p className="text-xs text-muted dark:text-zinc-300 mt-1">Kért mennyiség: {item.quantity}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{item.reason}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => onContinueWithoutUnavailable()}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e07b1a]"
        >
          Folytatás az elérhető tételekkel
        </button>
        <button
          type="button"
          onClick={() => onScrapCart()}
          className="flex-1 rounded-xl border border-[#e6e0db] dark:border-zinc-700 px-4 py-3 text-sm font-bold text-foreground dark:text-white transition-colors hover:bg-[#f5f1ec] dark:hover:bg-zinc-800"
        >
          Kosár elvetése
        </button>
      </div>
    </Modal>
  )
}


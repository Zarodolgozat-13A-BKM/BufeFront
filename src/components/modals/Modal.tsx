import { useEffect, useId } from 'react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: React.ReactNode
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) => {
	const titleId = useId()

	// Close modal on ESC key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
			document.body.style.overflow = 'hidden' // Prevent background scroll
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
			document.body.style.overflow = 'unset'
		}
	}, [isOpen, onClose])

	if (!isOpen) return null

	const maxWidthClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl'
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/35 backdrop-blur-sm"
				onClick={onClose}
			></div>

			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? titleId : undefined}
				className={`modal-shell relative bg-surface dark:bg-zinc-900 rounded-xl border border-[#e6e0db] dark:border-zinc-700 shadow-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden flex flex-col`}
			>
				{title && (
					<div className="flex items-center justify-between p-4 border-b border-[#e6e0db] dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/80">
						<h2 id={titleId} className="text-xl font-bold text-foreground dark:text-white">{title}</h2>
						<button
							onClick={onClose}
							aria-label="Bezárás"
							className="p-1 rounded-lg text-muted dark:text-zinc-400 hover:bg-primary/10 hover:text-primary transition-colors"
						>
							<span className="material-symbols-outlined">close</span>
						</button>
					</div>
				)}
				{!title && (
					<div className="flex justify-end px-3 pt-3">
						<button
							onClick={onClose}
							aria-label="Bezárás"
							className="p-1 rounded-lg text-muted dark:text-zinc-400 hover:bg-primary/10 hover:text-primary transition-colors"
						>
							<span className="material-symbols-outlined">close</span>
						</button>
					</div>
				)}

				<div className="p-6 overflow-y-auto flex-1 text-foreground dark:text-zinc-200">
					{children}
				</div>
			</div>
		</div>
	)
}


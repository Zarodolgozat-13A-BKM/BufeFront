import { useEffect } from 'react'

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title?: string
	children: React.ReactNode
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) => {
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
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			></div>

			{/* Modal Content */}
			<div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-hidden flex flex-col`}>
				{/* Header */}
				{title && (
					<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
						<button
							onClick={onClose}
							className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
						>
							<span className="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
						</button>
					</div>
				)}

				{/* Body */}
				<div className="p-6 overflow-y-auto flex-1">
					{children}
				</div>
			</div>
		</div>
	)
}

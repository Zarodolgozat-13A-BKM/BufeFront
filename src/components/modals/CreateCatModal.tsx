import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import type { CategoryModel } from '../../Models/CategoryModel'
import { CreateCategory, UpdateCategory } from '../../services/CategoryService'

interface CreateItemModalProps {
    isOpen: boolean
    onClose: () => void
    onCreated: () => void,
    category: CategoryModel | undefined
}


export const CreateCatModal = ({ isOpen, onClose, onCreated, category }: CreateItemModalProps) => {
    const [form, setForm] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!isOpen) return
        setForm(category?.name ?? '')
        setError(null)
    }, [isOpen, category])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!form.trim()) { setError('A kategória neve kötelező.'); return }
        setLoading(true)
        try {
            if(!category){
                await CreateCategory(form)
            } else {
                await UpdateCategory(category.id.toString(), form)
            }
            setForm('')
            onCreated()
            onClose()
        } catch {
            if(category)
            {
                setError('Hiba történt a kategória módosításakor.')
            }
            else
            setError('Hiba történt a kategória létrehozásakor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={category?"Kategória módosítása": "Új kategória hozzáadása"} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                {error && (
                    <div className="rounded-lg p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Név *</label>
                        <input name="name" value={form} required onChange={(e) => setForm(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                        className="flex-1 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors">
                        {loading ? 'Mentés...' : (category? "Kategória módosítása": "Új kategória hozzáadása")}
                    </button>
                    <button type="button" onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Mégse
                    </button>
                </div>
            </form>
        </Modal>
    )
}

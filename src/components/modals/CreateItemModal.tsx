import { useState } from 'react'
import { Modal } from './Modal'
import type { ItemCreateModel } from '../../Models/ItemModel'
import type { CategoryModel } from '../../Models/CategoryModel'
import { CreateItem } from '../../services/ItemService'

interface CreateItemModalProps {
    isOpen: boolean
    onClose: () => void
    categories: CategoryModel[]
    onCreated: () => void
}

const EMPTY_FORM: ItemCreateModel = {
    name: '',
    picture_url: null,
    description: null,
    price: 0,
    is_active: true,
    is_featured: false,
    default_time_to_deliver: 5,
    category_id: 0,
}

export const CreateItemModal = ({ isOpen, onClose, categories, onCreated }: CreateItemModalProps) => {
    const [form, setForm] = useState<ItemCreateModel>(EMPTY_FORM)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
        } else if (type === 'number') {
            setForm((prev) => ({ ...prev, [name]: Number(value) }))
        } else {
            setForm((prev) => ({ ...prev, [name]: value === '' ? null : value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!form.name.trim()) { setError('A termék neve kötelező.'); return }
        if (form.category_id === 0) { setError('Válassz kategóriát.'); return }
        if (form.price <= 0) { setError('Az árnak pozitívnak kell lennie.'); return }
        setLoading(true)
        try {
            await CreateItem(form)
            setForm(EMPTY_FORM)
            onCreated()
            onClose()
        } catch {
            setError('Hiba történt a termék létrehozásakor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Új termék hozzáadása" maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                {error && (
                    <div className="rounded-lg p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Név *</label>
                        <input name="name" value={form.name} onChange={handleChange} required
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Leírás</label>
                        <textarea name="description" value={form.description ?? ''} onChange={handleChange} rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                    </div>

                    {/* Picture URL */}
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kép URL</label>
                        <input name="picture_url" value={form.picture_url ?? ''} onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Ár (Ft) *</label>
                        <input name="price" type="number" min={1} value={form.price} onChange={handleChange} required
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>

                    {/* Delivery time */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Átfutási idő (perc) *</label>
                        <input name="default_time_to_deliver" type="number" min={1} value={form.default_time_to_deliver} onChange={handleChange} required
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                    </div>

                    {/* Category */}
                    <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Kategória *</label>
                        <select name="category_id" value={form.category_id} onChange={handleChange} required
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40">
                            <option value={0} disabled>Válassz kategóriát...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-2">
                        <input id="is_active" name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange}
                            className="w-4 h-4 accent-primary" />
                        <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aktív</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input id="is_featured" name="is_featured" type="checkbox" checked={form.is_featured} onChange={handleChange}
                            className="w-4 h-4 accent-primary" />
                        <label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Kiemelt</label>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                        className="flex-1 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary-hover disabled:opacity-50 transition-colors">
                        {loading ? 'Mentés...' : 'Termék létrehozása'}
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

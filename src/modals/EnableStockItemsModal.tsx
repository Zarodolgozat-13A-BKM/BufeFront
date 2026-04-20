import { useEffect, useMemo, useState } from 'react';
import type { ItemModel } from '../Models/ItemModel';
import { Modal } from './Modal';

interface EnableStockItemsModalProps {
	isOpen: boolean;
	isSaving: boolean;
	items: ItemModel[];
	onClose: () => void;
	onSubmit: (itemIds: number[]) => Promise<void>;
}

export const EnableStockItemsModal = ({
	isOpen,
	isSaving,
	items,
	onClose,
	onSubmit,
}: EnableStockItemsModalProps) => {
	const defaultSelectedItemIds = useMemo(
		() =>
			items
				.filter((item) => !item.is_active && item.inventory_count > 0)
				.map((item) => item.id),
		[items],
	);
	const [query, setQuery] = useState('');
	const [selectedItemIds, setSelectedItemIds] =
		useState<number[]>(defaultSelectedItemIds);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		setQuery('');
		setSelectedItemIds(defaultSelectedItemIds);
		setError(null);
	}, [isOpen, defaultSelectedItemIds]);

	const normalizedQuery = query.trim().toLocaleLowerCase('hu-HU');

	const eligibleItems = useMemo(() => {
		const filtered = items.filter(
			(item) => !item.is_active && item.inventory_count > 0,
		);
		if (!normalizedQuery) {
			return filtered.sort((a, b) =>
				a.name.localeCompare(b.name, 'hu-HU', { sensitivity: 'base' }),
			);
		}

		return filtered
			.filter((item) =>
				item.name.toLocaleLowerCase('hu-HU').includes(normalizedQuery),
			)
			.sort((a, b) =>
				a.name.localeCompare(b.name, 'hu-HU', { sensitivity: 'base' }),
			);
	}, [items, normalizedQuery]);

	const selectedCount = selectedItemIds.length;

	const resetStateAndClose = () => {
		setQuery('');
		setSelectedItemIds(defaultSelectedItemIds);
		setError(null);
		onClose();
	};

	const toggleItem = (itemId: number) => {
		setSelectedItemIds((prev) =>
			prev.includes(itemId)
				? prev.filter((id) => id !== itemId)
				: [...prev, itemId],
		);
	};

	const visibleIds = eligibleItems.map((item) => item.id);
	const areAllVisibleSelected =
		visibleIds.length > 0 &&
		visibleIds.every((id) => selectedItemIds.includes(id));

	const toggleSelectAllVisible = () => {
		setSelectedItemIds((prev) => {
			if (areAllVisibleSelected) {
				return prev.filter((id) => !visibleIds.includes(id));
			}

			const withVisible = new Set(prev);
			for (const id of visibleIds) {
				withVisible.add(id);
			}
			return [...withVisible];
		});
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setError(null);

		if (selectedItemIds.length === 0) {
			setError('Válassz ki legalább egy terméket.');
			return;
		}

		try {
			await onSubmit(selectedItemIds);
			setQuery('');
			setSelectedItemIds(defaultSelectedItemIds);
			setError(null);
		} catch (submitError) {
			console.error('Failed to enable selected stock items:', submitError);
			setError('Az aktivalas nem sikerult. Probald ujra.');
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={isSaving ? () => undefined : resetStateAndClose}
			title='Raktáron levő inaktív termékek'
			maxWidth='xl'>
			<form
			onSubmit={handleSubmit}
				className='space-y-4'>
				<div className='rounded-lg border border-[#e6e0db] bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/70'>
					<p className='text-sm font-semibold text-foreground dark:text-zinc-100'>
						Jelöld ki, melyik raktáron levő inaktív termékeket szeretnéd
						aktiválni.
					</p>
					<p className='mt-1 text-xs text-muted dark:text-zinc-400'>
						Összes lathato: {eligibleItems.length} db | Kiválasztva:{' '}
						{selectedCount} db
					</p>
				</div>

				<div className='grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto] md:items-end'>
					<div>
						<label className='mb-1 block text-xs font-semibold uppercase tracking-wide text-muted dark:text-zinc-400'>
							Keresés terméknév alapján
						</label>
						<input
							type='text'
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder='Példa: Hamburger'
							className='w-full rounded-lg border border-[#e6e0db] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
						/>
					</div>
					<button
						type='button'
						onClick={toggleSelectAllVisible}
						disabled={eligibleItems.length === 0}
						className='rounded-lg border border-[#e6e0db] bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'>
						{areAllVisibleSelected
							? 'Láthatók kijelölésének törlése'
							: 'Minden látható kijelölése'}
					</button>
				</div>

				<div className='max-h-[55vh] overflow-y-auto rounded-lg border border-[#e6e0db] dark:border-zinc-700'>
					<table className='w-full border-collapse text-sm'>
						<thead className='sticky top-0 z-10 bg-surface dark:bg-zinc-800'>
							<tr>
								<th className='px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400'>
									Termék
								</th>
								<th className='px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400'>
									Raktárkészlet
								</th>
								<th className='px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400'></th>
							</tr>
						</thead>
						<tbody>
							{eligibleItems.map((item) => {
								const isSelected = selectedItemIds.includes(item.id);
								return (
									<tr
										key={item.id}
										className='border-t border-[#e6e0db] bg-white dark:border-zinc-700 dark:bg-zinc-900/50'>
										<td className='px-3 py-2 font-medium text-foreground dark:text-zinc-100'>
											{item.name}
										</td>
										<td className='px-3 py-2 text-center text-foreground dark:text-zinc-100'>
											{item.inventory_count}
										</td>
										<td className='px-3 py-2 text-center'>
											<input
												type='checkbox'
												checked={isSelected}
												onChange={() => toggleItem(item.id)}
												className='h-4 w-4 accent-primary'
											/>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{error && (
					<div className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'>
						{error}
					</div>
				)}

				<div className='flex justify-end gap-2'>
					<button
						type='button'
						onClick={resetStateAndClose}
						disabled={isSaving}
						className='rounded-lg border border-[#e6e0db] px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'>
						Megse
					</button>
					<button
						type='submit'
						disabled={isSaving}
						className='rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70'>
						{isSaving ? 'Aktivalas...' : 'Kivalasztott termekek aktivalasa'}
					</button>
				</div>
			</form>
		</Modal>
	);
};

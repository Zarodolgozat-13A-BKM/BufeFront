import { useMemo, useState } from "react";
import type { ItemModel } from "../../Models/ItemModel";
import { Modal } from "./Modal";

interface StockArrivalChange {
    itemId: number;
    increaseBy: number;
}

interface StockArrivalModalProps {
    isOpen: boolean;
    isSaving: boolean;
    items: ItemModel[];
    onClose: () => void;
    onSubmit: (changes: StockArrivalChange[]) => Promise<void>;
}

const toNormalized = (value: string): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    if (parsed === 0) return 0;
    return Math.trunc(parsed);
};

export const StockArrivalModal = ({
    isOpen,
    isSaving,
    items,
    onClose,
    onSubmit,
}: StockArrivalModalProps) => {
    const [selectedItemQuery, setSelectedItemQuery] = useState("");
    const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
    const [changes, setChanges] = useState<Record<number, string>>({});
    const [error, setError] = useState<string | null>(null);

    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) =>
            a.name.localeCompare(b.name, "hu-HU", { sensitivity: "base" }),
        );
    }, [items]);

    const pickerOptions = useMemo(() => {
        return sortedItems.filter((item) => !selectedItemIds.includes(item.id));
    }, [selectedItemIds, sortedItems]);

    const toPickerValue = (item: ItemModel) => {
        return `${item.name} (${item.inventory_count} db) - #${item.id}`;
    };

    const pickerValueToItemId = useMemo(() => {
        return new Map(
            pickerOptions.map((item) => [toPickerValue(item), item.id]),
        );
    }, [pickerOptions]);

    const selectedItems = useMemo(() => {
        return sortedItems.filter((item) => selectedItemIds.includes(item.id));
    }, [selectedItemIds, sortedItems]);

    const canAddSelectedItem = useMemo(() => {
        return pickerValueToItemId.has(selectedItemQuery.trim());
    }, [pickerValueToItemId, selectedItemQuery]);

    const preparedChanges = useMemo(() => {
        return Object.entries(changes)
            .map(([itemId, value]) => ({
                itemId: Number(itemId),
                increaseBy: toNormalized(value),
            }))
            .filter((entry) => entry.increaseBy !== 0);
    }, [changes]);

    const totalUnits = useMemo(() => {
        return preparedChanges.reduce((sum, entry) => sum + entry.increaseBy, 0);
    }, [preparedChanges]);

    const touchedItemCount = preparedChanges.length;

    const resetStateAndClose = () => {
        setSelectedItemQuery("");
        setSelectedItemIds([]);
        setChanges({});
        setError(null);
        onClose();
    };

    const addSelectedItem = () => {
        const nextId = pickerValueToItemId.get(selectedItemQuery.trim());
        if (!nextId) {
            setError("Válassz terméket a listából.");
            return;
        }

        setSelectedItemIds((prev) =>
            prev.includes(nextId) ? prev : [...prev, nextId],
        );
        setSelectedItemQuery("");
        setError(null);
    };

    const removeSelectedItem = (itemId: number) => {
        setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
        setChanges((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
    };

    const setItemIncrease = (itemId: number, value: string) => {
        setChanges((prev) => ({ ...prev, [itemId]: value }));
    };

    const addQuickAmount = (itemId: number, amount: number) => {
        setChanges((prev) => {
            const currentValue = toNormalized(prev[itemId] ?? "0");
            return { ...prev, [itemId]: String(currentValue + amount) };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (preparedChanges.length === 0) {
            setError("Adj meg legalább egy nem nulla mennyiséget.");
            return;
        }

        try {
            await onSubmit(preparedChanges);
            setSelectedItemQuery("");
            setSelectedItemIds([]);
            setChanges({});
            setError(null);
        } catch (submitError) {
            console.error("Failed to receive stock shipment:", submitError);
            setError("A készletfrissítés nem sikerült. Próbáld újra.");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={isSaving ? () => undefined : resetStateAndClose}
            title="Beérkezett szállítmány"
            maxWidth="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-lg border border-[#e6e0db] bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/70">
                    <p className="text-sm font-semibold text-foreground dark:text-zinc-100">
                        Több termék készletét is növelheted egyszerre.
                    </p>
                    <p className="mt-1 text-xs text-muted dark:text-zinc-400">
                        Érintett termékek: {touchedItemCount} db | Összesen: {totalUnits} db
                    </p>
                    <p className="mt-1 text-xs text-muted dark:text-zinc-400">
                        Korrekcióhoz használj negatív értéket (pl. -2).
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted dark:text-zinc-400">
                            Termék választása (kereshető)
                        </label>
                        <input
                            type="text"
                            list="stock-arrival-item-options"
                            value={selectedItemQuery}
                            onChange={(event) => setSelectedItemQuery(event.target.value)}
                            placeholder="Kezdd el begépelni a termék nevét"
                            className="w-full rounded-lg border border-[#e6e0db] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                        <datalist id="stock-arrival-item-options">
                            {pickerOptions.map((item) => (
                                <option key={item.id} value={toPickerValue(item)} />
                            ))}
                        </datalist>
                    </div>
                    <button
                        type="button"
                        onClick={addSelectedItem}
                        disabled={!canAddSelectedItem}
                        className="rounded-lg border border-[#e6e0db] bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                        Hozzáadás
                    </button>
                </div>

                <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-[#e6e0db] dark:border-zinc-700">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-surface dark:bg-zinc-800">
                            <tr>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400">
                                    Termék
                                </th>
                                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400">
                                    Jelenlegi
                                </th>
                                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400">
                                    Változás (+/-)
                                </th>
                                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400">
                                    Gyors
                                </th>
                                <th className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-zinc-400">
                                    Eltávolítás
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-[#e6e0db] bg-white dark:border-zinc-700 dark:bg-zinc-900/50"
                                >
                                    <td className="px-3 py-2 font-medium text-foreground dark:text-zinc-100">
                                        {item.name}
                                    </td>
                                    <td className="px-3 py-2 text-center text-foreground dark:text-zinc-100">
                                        {item.inventory_count}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="number"
                                            value={changes[item.id] ?? ""}
                                            onChange={(event) =>
                                                setItemIncrease(item.id, event.target.value)
                                            }
                                            placeholder="0"
                                            className="w-24 rounded-md border border-[#e6e0db] bg-white px-2 py-1 text-right text-sm text-foreground outline-none focus:border-primary/50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                                        />
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => addQuickAmount(item.id, 1)}
                                                className="rounded-md border border-[#e6e0db] px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-surface dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                            >
                                                +1
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addQuickAmount(item.id, 5)}
                                                className="rounded-md border border-[#e6e0db] px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-surface dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                            >
                                                +5
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addQuickAmount(item.id, 10)}
                                                className="rounded-md border border-[#e6e0db] px-2 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-surface dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                            >
                                                +10
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedItem(item.id)}
                                            className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/60 dark:bg-red-900/25 dark:text-red-300 dark:hover:bg-red-900/40"
                                        >
                                            <span className="material-symbols-outlined">
                                                delete
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={resetStateAndClose}
                        disabled={isSaving}
                        className="rounded-lg border border-[#e6e0db] px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Mégse
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSaving ? "Mentés..." : "Készlet frissítése"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


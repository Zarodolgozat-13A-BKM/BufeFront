import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import type { ItemCreateModel, ItemModel } from "../Models/ItemModel";
import type { CategoryModel } from "../Models/CategoryModel";
import { CreateItem, UpdateItem } from "../services/ItemService";

interface CreateItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryModel[];
  onCreated: (item: ItemModel) => void;
  item?: ItemModel;
}

const EMPTY_FORM: ItemCreateModel = {
  name: "",
  picture_url: null,
  description: null,
  price: 0,
  is_active: true,
  is_featured: false,
  default_time_to_deliver: 5,
  category_id: 0,
  inventory_count: 0,
};

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

export const CreateItemModal = ({
  isOpen,
  onClose,
  categories,
  onCreated,
  item,
}: CreateItemModalProps) => {
  const [form, setForm] = useState<ItemCreateModel>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEditing = Boolean(item);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!isOpen) return;
    if (item) {
      setForm({
        name: item.name,
        picture_url: item.picture_url,
        description: item.description,
        price: item.price,
        is_active: item.is_active,
        is_featured: item.is_featured,
        default_time_to_deliver: item.default_time_to_deliver,
        category_id: item.category_id,
        inventory_count: item.inventory_count,
      });
      setImagePreview(item.picture_url);
    } else {
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
    setImageFile(null);
    setError(null);
  }, [isOpen, item]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (type === "number") {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value === "" ? null : value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      if (!isEditing) {
        setImagePreview(null);
      }
      setError(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Csak képfájl tölthető fel (image/*).");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("A kép maximális mérete 1 MB lehet.");
      e.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const buildItemFormData = (values: ItemCreateModel, file?: File | null) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description ?? "");
    formData.append("price", String(values.price));
    formData.append("is_active", values.is_active === true ? "1" : "0");
    formData.append("is_featured", values.is_featured === true ? "1" : "0");
    formData.append(
      "default_time_to_deliver",
      String(values.default_time_to_deliver),
    );
    formData.append("category_id", String(values.category_id));
    formData.append("inventory_count", String(values.inventory_count));
    if (file) {
      formData.append("image", file);
    }
    return formData;
  };

  const buildChangedFormData = (
    values: ItemCreateModel,
    original: ItemModel,
    file: File | null,
  ) => {
    const formData = new FormData();

    if (values.name !== original.name) {
      formData.append("name", values.name);
    }
    if ((values.description ?? "") !== (original.description ?? "")) {
      formData.append("description", values.description ?? "");
    }
    if (values.price !== original.price) {
      formData.append("price", String(values.price));
    }
    if (values.is_active !== original.is_active) {
      formData.append("is_active", values.is_active === true ? "1" : "0");
    }
    if (values.is_featured !== original.is_featured) {
      formData.append("is_featured", String(values.is_featured ? "1" : "0"));
    }
    if (values.default_time_to_deliver !== original.default_time_to_deliver) {
      formData.append(
        "default_time_to_deliver",
        String(values.default_time_to_deliver),
      );
    }
    if (values.inventory_count !== original.inventory_count) {
      formData.append("inventory_count", String(values.inventory_count));
    }
    if (values.category_id !== original.category_id) {
      formData.append("category_id", String(values.category_id));
    }
    if (file) {
      formData.append("image", file);
    }

    return formData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("A termék neve kötelező.");
      return;
    }
    if (form.category_id === 0) {
      setError("Válassz kategóriát.");
      return;
    }
    if (form.price <= 0) {
      setError("Az árnak pozitívnak kell lennie.");
      return;
    }
    if (form.inventory_count < 0) {
      setError("A raktárkészletnek nem lehet negatív értéke.");
      return;
    }
    setLoading(true);
    try {
      let savedItem: ItemModel;
      if (item) {
        const changedFormData = buildChangedFormData(form, item, imageFile);

        if ([...changedFormData.keys()].length === 0) {
          onClose();
          return;
        }

        savedItem = await UpdateItem(item.id, changedFormData);
      } else {
        const formData = buildItemFormData(form, imageFile);
        savedItem = await CreateItem(formData);
      }
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      onCreated(savedItem);
      onClose();
    } catch {
      setError(
        item
          ? "Hiba történt a termék módosításakor."
          : "Hiba történt a termék létrehozásakor.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Termék módosítása" : "Új termék hozzáadása"}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
        {error && (
          <div className="rounded-lg p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Név *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Leírás
            </label>
            <textarea
              name="description"
              value={form.description ?? ""}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kép feltöltése
            </label>
            <input
              id="item-picture-upload"
              name="picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="item-picture-upload"
              className="w-full min-h-28 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm flex items-center justify-center cursor-pointer overflow-hidden"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Kiválasztott kép"
                  className="h-24 w-full max-w-48 object-cover rounded-md"
                />
              ) : (
                "Fájlok kiválasztása"
              )}
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Csak képfájl (image/*), legfeljebb 1 MB.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ár (Ft) *
            </label>
            <input
              name="price"
              type="number"
              min={1}
              value={form.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Átfutási idő (perc) *
            </label>
            <input
              name="default_time_to_deliver"
              type="number"
              min={1}
              value={form.default_time_to_deliver}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Raktárkészlet *
            </label>
            <input
              name="inventory_count"
              type="number"
              min={0}
              value={form.inventory_count}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Kategória *
            </label>
            <select
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value={0} disabled>
                Válassz kategóriát...
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={handleChange}
              className="w-4 h-4 accent-primary"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Aktív
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_featured"
              name="is_featured"
              type="checkbox"
              checked={form.is_featured}
              onChange={handleChange}
              className="w-4 h-4 accent-primary"
            />
            <label
              htmlFor="is_featured"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Kiemelt
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg font-bold text-white bg-primary hover:bg-primary-strong disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Mentés..."
              : isEditing
                ? "Termék mentése"
                : "Termék létrehozása"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Mégse
          </button>
        </div>
      </form>
    </Modal>
  );
};

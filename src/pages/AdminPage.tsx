import { useState, useMemo, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import type { CategoryModel } from "../Models/CategoryModel";
import type { ItemModel } from "../Models/ItemModel";
import { CreateItemModal } from "../components/modals/CreateItemModal";
import CategoriesTable from "../components/adminPage/CategoriesTable";
import ItemsTable from "../components/adminPage/ItemsTable";
import { CreateCatModal } from "../components/modals/CreateCatModal";
import OrdersTable from "../components/adminPage/OrdersTable";
import type { OrderModel } from "../Models/OrderModel";
import {
  type SortDir,
  type SortableOrderField,
  getSortIcon,
  handleCategoryCreatedAction,
  handleCategoryDeleteAction,
  handleItemCreatedAction,
  handleItemDeleteAction,
  handleItemStatusToggleAction,
  handleOrderStatusChangeAction,
  initializeAdminPage,
  sortByField,
  sortOrdersByField,
  toggleSortDirection,
} from '../services/AdminPageService'
import DashBoardHeader from '../components/dashBoardHeader'


const AdminPage = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.category.categories);
  const items = useAppSelector((state) =>
    state.category.categories.flatMap((c) => c.items),
  );
  const [CategoryTableVisible, setCategoryTableVisible] = useState(true);
  const [ItemTableVisible, setItemTableVisible] = useState(false);
  const [orderTableVisible, setOrderTableVisible] = useState(false);
  const orders = useAppSelector((state) => state.order.orders ?? []);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemModel | undefined>(
    undefined,
  );

  useEffect(() => {
    const bootstrapAdminPage = async () => {
      try {
        await initializeAdminPage(dispatch);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    bootstrapAdminPage();
  }, []);

  const handleItemStatusToggle = async (
    id: number,
    field: "is_active" | "is_featured",
  ) => {
    await handleItemStatusToggleAction(dispatch, categories, id, field);
  };



  const handleItemCreated = async (item: ItemModel) => {
    await handleItemCreatedAction(dispatch, categories, item);
  };

  const handleItemDelete = async (item: ItemModel) => {
    await handleItemDeleteAction(dispatch, categories, item);
  };

  const handleCatDelete = async (cat: CategoryModel) => {
    await handleCategoryDeleteAction(dispatch, categories, cat);
  };

  const handleCatCreated = async (category: CategoryModel) => {
    await handleCategoryCreatedAction(dispatch, categories, category);
  };

  const [catSortField, setCatSortField] = useState<keyof CategoryModel>("id");
  const [catSortDir, setCatSortDir] = useState<SortDir>("asc");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryModel | undefined
  >(undefined);
  const [itemSortField, setItemSortField] = useState<keyof ItemModel>("id");
  const [itemSortDir, setItemSortDir] = useState<SortDir>("asc");

  const [orderSortField, setOrderSortField] =
    useState<SortableOrderField>("id");
  const [orderSortDir, setOrderSortDir] = useState<SortDir>("asc");

  const handleCatSort = (field: keyof CategoryModel) => {
    const next = toggleSortDirection(catSortField, catSortDir, field);
    setCatSortField(next.field);
    setCatSortDir(next.dir);
  };

  const handleItemSort = (field: keyof ItemModel) => {
    const next = toggleSortDirection(itemSortField, itemSortDir, field);
    setItemSortField(next.field);
    setItemSortDir(next.dir);
  };

  const handleOrderSort = (field: SortableOrderField) => {
    const next = toggleSortDirection(orderSortField, orderSortDir, field);
    setOrderSortField(next.field);
    setOrderSortDir(next.dir);
  };

  const handleOrderStatusChange = async (order: OrderModel, status: string) => {
    try {
      await handleOrderStatusChangeAction(dispatch, orders, order, status);
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  const sortedCategories = useMemo(() => {
    return sortByField(categories, catSortField, catSortDir);
  }, [categories, catSortField, catSortDir]);

  const sortedItems = useMemo(() => {
    return sortByField(items, itemSortField, itemSortDir);
  }, [items, itemSortField, itemSortDir]);

  const sortedOrders = useMemo(() => {
    return sortOrdersByField(orders, orderSortField, orderSortDir);
  }, [orders, orderSortField, orderSortDir]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display antialiased">
      <div className="relative mx-auto flex min-h-screen w-full flex-col overflow-x-auto shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800">
        <DashBoardHeader name={(<div className="rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-dark dark:text-white">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button onClick={() => { setCategoryTableVisible(true); setItemTableVisible(false); setOrderTableVisible(false) }} className={"shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (CategoryTableVisible ? "border-primary bg-primary text-white" : "border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-dark dark:text-zinc-200")}>
                  Kategóriák
                </button>
                <button onClick={() => { setCategoryTableVisible(false); setItemTableVisible(true); setOrderTableVisible(false) }} className={"shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (ItemTableVisible ? "border-primary bg-primary text-white" : "border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-dark dark:text-zinc-200")}>
                  Termékek
                </button>
                <button onClick={() => { setCategoryTableVisible(false); setItemTableVisible(false); setOrderTableVisible(true) }} className={"shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " + (orderTableVisible ? "border-primary bg-primary text-white" : "border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 text-text-dark dark:text-zinc-200")}>
                  Rendelések
                </button>
              </div>
            </div>
          </div>)} />
        <div className="p-4 md:p-6 space-y-5">
          



          {CategoryTableVisible && (
            <div className="w-full xl:w-full rounded-xl border border-[#e6e0db] bg-bg-light dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-text-dark dark:text-white mb-4">Kategóriák ({categories.length})</h2>
                <button
                  onClick={() => {
                    setSelectedCategory(undefined)
                    setIsCreateCategoryOpen(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#e07b1a] transition-colors"
                >
                  <span className="text-base">+</span>
                  Kategória hozzáadása
                </button>
              </div>
              <CategoriesTable sortedCategories={sortedCategories} categories={categories} catSortField={catSortField} catSortDir={catSortDir} handleCatSort={handleCatSort} itemSortField={itemSortField} itemSortDir={itemSortDir}
                handleItemSort={handleItemSort}
                handleItemStatusToggle={handleItemStatusToggle}
                sortIcon={getSortIcon}
                handleCatDelete={handleCatDelete}
                setSelectedCategory={setSelectedCategory}
                setCreateCategoryOpen={setIsCreateCategoryOpen}
                setSelectedItem={setSelectedItem}
                setCreateItemOpen={setIsCreateItemOpen}
                handleItemDelete={handleItemDelete}
              />
            </div>)}
          {ItemTableVisible && (
            <div className="min-w-0 w-full flex-1 rounded-xl border border-[#e6e0db] bg-bg-light dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-text-dark dark:text-white">Termékek ({items.length})</h2>
                <button
                  onClick={() => setIsCreateItemOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-[#e07b1a] transition-colors"
                >
                  <span className="text-base leading-none">+</span>
                  Termék hozzáadása
                </button>
              </div>
              <ItemsTable
                handleItemStatusToggle={handleItemStatusToggle}
                sortedItems={sortedItems}
                itemSortField={itemSortField}
                itemSortDir={itemSortDir}
                categories={categories}
                handleItemSort={handleItemSort}
                sortIcon={getSortIcon}
                setSelectedItem={setSelectedItem}
                setCreateItemOpen={setIsCreateItemOpen}
                handleItemDelete={handleItemDelete}
              />
            </div>
          )}
          {orderTableVisible && (
            <div className="min-w-0 w-full flex-1 rounded-xl border border-[#e6e0db] bg-bg-light dark:bg-zinc-800/50 dark:border-zinc-800 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-text-dark dark:text-white">Rendelések ({orders.length})</h2>
              </div>
              <OrdersTable
                sortedOrders={sortedOrders}
                orderSortField={orderSortField}
                orderSortDir={orderSortDir}
                handleOrderSort={handleOrderSort}
                handleOrderStatusChange={handleOrderStatusChange}
                sortIcon={getSortIcon}
              />
            </div>
          )}
        </div>

        <CreateItemModal
          isOpen={isCreateItemOpen}
          onClose={() => {
            setIsCreateItemOpen(false)
            setSelectedItem(undefined)
          }}
          categories={categories}
          onCreated={handleItemCreated}
          item={selectedItem}
        />
        <CreateCatModal
          isOpen={isCreateCategoryOpen}
          onClose={() => {
            setIsCreateCategoryOpen(false)
            setSelectedCategory(undefined)
          }}
          onCreated={handleCatCreated}
          category={selectedCategory}
        />
      </div>
    </div>
  );
};

export default AdminPage;

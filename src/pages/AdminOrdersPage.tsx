import { useEffect, useState } from "react";
import type { OrderModel } from "../Models/OrderModel";
import { GetAllActiveOrders } from "../services/OrderService";
import { echo } from "../lib/echo";
import { Link } from "react-router";

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<OrderModel[]>([]);
  useEffect(() => {
    GetAllActiveOrders().then(setOrders);
    echo.private("orders_admin").listen(".order.submitted", (e: any) => {
      setOrders((prev) => [...prev, e.order]);
    });
  }, []);
  return (
    <div className="min-h-screen bg-linear-to-b from-orange-50/60 to-white dark:from-zinc-900 dark:to-zinc-950 p-4 md:p-6 overflow-x-auto">
      <div className="mx-auto max-w-375 space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-5 md:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
                Élő Rendelések kezelése
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Folyamatban lévő rendelések áttekintése és kezelése
              </p>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>
          <nav className="mt-4">
            <ul className="flex flex-wrap gap-4 text-sm">
              <li>
                <Link to="/admin" className="text-primary hover:underline">
                  Vissza az adminfelületre
                </Link>
              </li>
              {/* <li><Link to="/admin/orders" className="text-primary hover:underline">Rendelések</Link></li>
              <li><button onClick={() => { if (confirm("Kijelentkezés megerősítése")) { handleLogout() } }} className="text-primary hover:underline">Kijelentkezés</button></li> */}
            </ul>
          </nav>
        </div>
        <div className="w-full xl:w-full rounded-2xl border border-primary/20 bg-white dark:bg-zinc-900 shadow-sm p-4 md:p-5">
          {/* <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-black dark:text-white mb-4">
              Rendelések
            </h2>
          </div> */}
          {/* táblázat */}
          {orders.map((order) => (
            <div
              key={order.id}
              className="border-b border-gray-200 dark:border-zinc-600 py-4"
            >
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Rendelés #{order.id}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Állapot: {order.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import type { OrderModel } from "../Models/OrderModel";
import { GetAllActiveOrders } from "../services/OrderService";
import { echo } from "../lib/echo";
import { Link } from "react-router";
import DashBoardHeader from "../components/dashBoardHeader";

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
        <DashBoardHeader name="Rendelések" showAdmin={false} backTo={"/admin"}/>
        <div className="w-full xl:w-full rounded-2xl border border-primary/20 bg-white dark:bg-zinc-900 shadow-sm p-4 md:p-5">
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

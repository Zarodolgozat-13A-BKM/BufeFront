import { useEffect, useState } from "react"
import { GetAllOrders } from "../services/OrderService"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { GetMe } from "../services/APIservice"
import { setMe } from "../store/authSlice"
import type { OrderModel } from "../Models/OrderModel"
import OrderItem from "../components/profilePage/orderItem"
import { addItemToCart, clearCart } from "../store/cartSlice"
import { Link, useNavigate } from "react-router"
import type { ItemModel } from "../Models/ItemModel"


const ProfilePage = () => {
  const me = useAppSelector((state) => state.auth.me)
  const category = useAppSelector((state) => state.category.categories)
  const [orders, setOrders] = useState<OrderModel[]>([])
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const handleOrder = (order: OrderModel) => {
    if (order.items === undefined) return
    dispatch(clearCart())
    order.items.forEach((item) => {
      const cartItem = category.flatMap((i) => i.items || []).find((j) => j.id === item.item_id) as ItemModel
      dispatch(addItemToCart({ item: cartItem, quantity: item.quantity }))
    })
    navigate('/checkout')
  }
  useEffect(() => {
    const fetchUserData = async () => {
      if (me == null) {
        try {
          const data = await GetMe()
          dispatch(setMe({ me: data }))
        } catch (error) {
          console.error('Failed to fetch user data:', error)
        }
      }
    }
    fetchUserData()
  }, [me, dispatch])

  useEffect(() => {
    const getOrders = async () => {
      try {
        const data = await GetAllOrders()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      }
    }
    getOrders()
  }, [])
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col overflow-x-hidden">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 p-4 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/90">
          <div className="flex items-center justify-between">
            <Link to='/main' className="text-primary transition-colors hover:text-primary-hover material-symbols-outlined">
            <span className="material-symbols-outlined">
              arrow_back
            </span>
          </Link>
            <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Profil</h2>
            <div className="w-6" />
          </div>
        </div>
        <div className="px-4 pb-8 pt-5 sm:px-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex w-full flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 dark:bg-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] text-center">{me?.full_name}</p>
                <div className="flex items-center gap-1 mt-2 bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-primary text-sm">stars</span>
                  <p className="text-primary font-semibold text-sm leading-normal text-center">1,250 pont</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Korábbi rendelések</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">{orders.length} db</span>
            </div>
            <div className="flex flex-col gap-3">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 dark:border-slate-600 dark:bg-slate-700/30">
                  <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-300">receipt_long</span>
                  <p className="mt-2 text-slate-500 dark:text-slate-300 text-sm font-normal leading-normal text-center">Még nem adtál le rendelést.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <OrderItem key={order.id} handleOrder={handleOrder} order={order} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default ProfilePage
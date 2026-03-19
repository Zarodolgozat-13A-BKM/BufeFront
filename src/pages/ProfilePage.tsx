import { useEffect, useState } from "react"
import { GetAllOrders } from "../services/OrderService"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { GetMe } from "../services/APIservice"
import { setMe } from "../store/authSlice"
import type { OrderModel } from "../Models/OrderModel"
import OrderItem from "../components/profilePage/orderItem"
import { addItemToCart } from "../store/cartSlice"
import { useNavigate } from "react-router"


const ProfilePage = () => {
  const me  = useAppSelector((state) => state.auth.me)
  const [orders, setOrders] = useState<OrderModel[]>([])
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
    const handleOrder = (order: OrderModel) => {
      // order.items.forEach((item) => {
      //               dispatch(addItemToCart({ item: item, quantity: item.quantity }))
      //           })
      console.log("added items")
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
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark group/design-root overflow-x-hidden">
        <div className="flex items-center bg-white dark:bg-slate-800 p-4 pb-2 justify-between sticky top-0 z-10 shadow-sm">
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Profil</h2>
        </div>
        <div className="flex p-6 @container bg-white dark:bg-slate-800 mb-2">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center">
              <div className="flex flex-col items-center justify-center">
                <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] text-center">{me?.full_name}</p>
                <div className="flex items-center gap-1 mt-1 bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-primary text-sm">stars</span>
                  <p className="text-primary font-semibold text-sm leading-normal text-center">1,250 pont</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col px-4 pt-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Korábbi rendelések</h3>
            <button className="text-primary text-sm font-medium hover:underline">Összes</button>
          </div>
        <div className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center py-10">Még nem adtál le rendelést.</p>
          ) : (
            orders.map((order) => (
              <OrderItem key={order.id} handleOrder={handleOrder} order={order} />
            ))
          )}
        </div>
        </div>
        
      </div>
    </div>

  )
}

export default ProfilePage
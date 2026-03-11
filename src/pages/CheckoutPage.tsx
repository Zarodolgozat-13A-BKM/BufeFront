import { useEffect, useState } from 'react'
import { GetRinging } from '../services/RingService'
import type { RingModel } from '../Models/RingModel'
import { useAppSelector } from '../store/hooks'
import { Link } from 'react-router'

const CheckoutPage = () => {
    const [ringing, setRinging] = useState<RingModel | null>(null)
    const { cart } = useAppSelector((state) => ({ cart: state.cart.cart }))
    useEffect(() => {
        const fetchRinging = async () => {
            try {
                const data: RingModel = await GetRinging()
                if (data.status === 'OK') {
                    setRinging(data)
                } else {
                    console.error('Failed to fetch ringing data: Invalid status', data.status)
                }
            } catch (error) {
                console.error('Failed to fetch ringing data:', error)
            }
        }
        fetchRinging()
    }, [])

    return (
        <div className="bg-background-light dark:bg-background-dark font-display antialiased">
            <div className="relative flex h-full min-h-screen w-full mx-auto flex-col overflow-x-hidden shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800">
                <div className="flex items-center bg-white dark:bg-zinc-900 p-4 pb-2 justify-between sticky top-0 z-10">
                    <Link to="/main" className="text-text-dark dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h2 className="text-text-dark dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Átvétel Kiválasztása</h2>
                </div>
                <main className="flex-1 overflow-y-auto pb-32">
                    <div className="block animate-fade-in" id="pickup-section">
                        <div className="px-4 pt-4 pb-2">
                            <h3 className="text-text-dark dark:text-white tracking-tight text-2xl font-bold leading-tight text-left">Mikor szeretnéd átvenni?</h3>
                        </div>
                        <div className="flex flex-col gap-4 px-4 py-3">
                            <label className="flex flex-col flex-1">
                                <p className="text-text-dark dark:text-zinc-300 text-sm font-medium leading-normal pb-2">Válassz szünetet</p>
                                <div className="relative">
                                    <select
                                        className="appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-dark dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 h-14 pl-4 pr-10 text-base font-normal leading-normal transition-shadow"
                                        defaultValue=""
                                    >
                                        <option disabled value="">Válassz időpontot...</option>
                                        <option value={`${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`}>Most</option>
                                        {ringing?.data?.ringlist.slice(0, -1).map((ring, index) => {
                                            const nextRing = ringing.data.ringlist[index + 1]

                                            return (
                                                new Date() < new Date(`${new Date().toDateString()} ${nextRing.becsengetés}`)
                                                    ? (
                                                        <option key={`${ring['óra']}-${ring.becsengetés}-${ring.kicsengetés}-${index}`} value={`${ring.kicsengetés}`}>
                                                            {`${ring.kicsengetés} - ${nextRing.becsengetés}`}
                                                        </option>
                                                    )
                                                    : <option key={`${ring['óra']}-${ring.becsengetés}-${ring.kicsengetés}-${index}`} value={`${ring.kicsengetés}`} disabled>
                                                            {`${ring.kicsengetés} - ${nextRing.becsengetés}`}
                                                        </option>
                                            )
                                        })}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-light dark:text-zinc-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div className="px-4 pb-4">
                            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-xl">storefront</span>
                                <p className="text-text-dark dark:text-zinc-200 text-sm font-medium leading-normal">Átvétel az iskolai büfében.</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-px bg-[#e6e0db] dark:bg-zinc-800 mx-4 my-2"></div>
                    <div className="px-4 py-4">
                        <h4 className="text-text-dark dark:text-white text-lg font-bold mb-4">Rendelés összesítése</h4>
                        <div className="bg-bg-light dark:bg-zinc-800/50 rounded-xl p-4 border border-[#e6e0db] dark:border-zinc-800">
                            {cart.items.map((cartItem, index) => (

                                <div key={`${cartItem.id}-${index}`} className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg bg-cover bg-center shrink-0" data-alt={cartItem.name} style={{ backgroundImage: `url('${cartItem.picture_url ?? ''}')` }}></div>
                                        <div>
                                            <p className="text-text-dark dark:text-white text-sm font-medium">{cartItem.name}</p>
                                            <p className="text-text-light dark:text-zinc-500 text-xs">x{cartItem.quantity ?? 0}</p>
                                        </div>
                                    </div>
                                    <p className="text-text-dark dark:text-white text-sm font-medium">{cartItem.price * (cartItem.quantity ?? 0)}Ft</p>
                                </div>
                            ))}

                            <div className="h-px bg-gray-200 dark:bg-zinc-700 my-3"></div>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-text-light dark:text-zinc-400 text-sm">Részösszeg</p>
                                <p className="text-text-dark dark:text-white text-sm font-medium">{Math.floor(cart.items.reduce((total, item) => total + (item.price * (item.quantity ?? 0)), 0) * 0.73)}Ft</p>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-text-light dark:text-zinc-400 text-sm">Adó</p>
                                <p className="text-text-dark dark:text-white text-sm font-medium">{Math.ceil(cart.items.reduce((total, item) => total + (item.price * (item.quantity ?? 0)), 0) * 0.27)}Ft</p>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-text-light dark:text-zinc-400 text-sm">Szervizdíj</p>
                                <p className="text-text-dark dark:text-white text-sm font-medium">{Math.floor(cart.items.reduce((total, item) => total + (item.price * (item.quantity ?? 0)), 0) * 0.1)}Ft</p>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <p className="text-text-dark dark:text-white text-base font-bold">Összesen</p>
                                <p className="text-text-dark dark:text-white text-xl font-bold">{Math.floor(cart.items.reduce((total, item) => total + (item.price * (item.quantity ?? 0)), 0)*1.1)}Ft</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 pb-6">
                        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-100 dark:border-yellow-900/40 mx-auto w-fit">
                            <span className="material-symbols-outlined text-amber-500 dark:text-amber-400 text-lg">stars</span>
                            <p className="text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wide">+{Math.floor(cart.items.reduce((total, item) => total + (item.price * (item.quantity ?? 0)), 0) * 0.11)} pontot kapsz!</p>
                        </div>
                    </div>
                </main>
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-[#e6e0db] dark:border-zinc-800 mx-auto z-20">
                    <button className="w-full h-12 bg-primary hover:bg-[#e07b1a] text-white rounded-xl text-base font-bold shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        <span>Rendelés leadása</span>
                        <span className="w-1 h-1 rounded-full bg-white/40"></span>
                        <span>{Math.floor(cart.items.reduce((total, item) => total + (item.price * (item.quantity ?? 0)), 0)*1.1)}Ft</span>
                    </button>
                </div>
            </div>

        </div>
    )
}

export default CheckoutPage

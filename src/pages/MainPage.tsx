import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCategories } from '../store/categorySlice'
import { GetAllCategories } from '../services/CategoryService'
import { setItems } from '../store/itemSlice'
import type { CategoryModel } from '../models/CategoryModel'
import type { ItemModel } from '../models/ItemModel'

const MainPage = () => {
    const dispatch = useAppDispatch()
    const { categories } = useAppSelector((state) => ({ categories: state.category.categories }))
    const username = useAppSelector((state) => state.auth.username)

    const [searchQuery, setSearchQuery] = useState('')
    const [cartItems, setCartItems] = useState<{ [key: string]: number }>({})
    const [activeCategory, setActiveCategory] = useState<CategoryModel | null>(null)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await GetAllCategories()
                dispatch(setCategories(data))
            } catch (error) {
                console.error('Failed to fetch categories:', error)
            }
        }

        fetchCategories()
    }, [dispatch])

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(setItems([]))
            return
        }

        const data: ItemModel[] = categories.flatMap((category) => category.items)
        dispatch(setItems(data))
        console.log('Fetched items:', data)
        setActiveCategory((current) => current ?? null)
    }, [categories, dispatch])

    useEffect(() => {
        const links = [
            'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
        ]
        links.forEach(href => {
            if (!document.querySelector(`link[href="${href}"]`)) {
                const link = document.createElement('link')
                link.rel = 'stylesheet'
                link.href = href
                document.head.appendChild(link)
            }
        })

        const style = document.createElement('style')
        style.textContent = `
            body {
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .material-symbols-outlined.filled {
                font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
        `
        document.head.appendChild(style)

        return () => {
            document.head.removeChild(style)
        }
    }, [])
    const addToCart = (itemName: string) => {
        setCartItems(prev => ({
            ...prev,
            [itemName]: (prev[itemName] || 0) + 1
        }))
    }

    const updateQuantity = (itemName: string, delta: number) => {
        setCartItems(prev => {
            const newCount = (prev[itemName] || 0) + delta
            if (newCount <= 0) {
                const { [itemName]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [itemName]: newCount }
        })
    }

    const totalItems = Object.values(cartItems).reduce((sum, count) => sum + count, 0)

    return (
        <div className="relative flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden bg-background-light dark:bg-background-dark">
            <div className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-sm border-2 border-white dark:border-white/10"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAv181Jcv1iyrzlNfYDzhyaS7SmGaJAAFH-mAjDRGzdSXP_qIb91aWY7omR3-61YC9zfk0PI3WfBqZ5CJOKnHIXf-brB0TzB6mCS00ID5eL91mmLchaltyhtnjd1c2NBL4Ow5hdqHXfuTPK9eqcMLDaHXO0hONNtFe77ykSW8kjjL9KnxkpjbVzb94Nh_p9Pi-wAZw159raP4tvu9J1IgszFXGA6l_0fYL8mq8uKrqtfNdHmMfU_i-zj58iNmwuhMjuTdGqZLRjtpgF")' }}
                        ></div>
                        <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Szia,</p>
                        <h2 className="text-[#181411] dark:text-white text-lg font-bold leading-tight">{username?.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center bg-white dark:bg-white/10 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-transparent">
                        <span className="text-primary material-symbols-outlined text-lg mr-1 filled">star</span>
                        <p className="text-[#897561] dark:text-gray-200 text-sm font-bold leading-normal">150 pts</p>
                    </div>
                </div>
            </div>
            <div className="px-4 py-4 sticky top-[72px] z-30 bg-background-light dark:bg-background-dark">
                <label className="flex flex-col h-12 w-full shadow-sm rounded-xl transition-all duration-300 focus-within:shadow-md focus-within:shadow-primary/20">
                    <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white dark:bg-white/5 border border-transparent focus-within:border-primary/50 overflow-hidden">
                        <div className="text-[#897561] dark:text-gray-400 flex items-center justify-center pl-4 pr-2">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-[#181411] dark:text-white focus:outline-0 focus:ring-0 border-none h-full placeholder:text-[#897561] dark:placeholder:text-gray-500 px-2 text-base font-normal leading-normal"
                            placeholder="Craving a burger? Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </label>
            </div>

            <div className="flex gap-2 px-4 py-2 overflow-x-auto overflow-y-visible no-scrollbar items-center min-h-[44px]">
                <button
                    key="0"
                    onClick={() => setActiveCategory(null)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full bg-gray-500 text-sm font-medium whitespace-nowrap border transition-colors ${!activeCategory ? 'border-primary bg-primary text-white' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                    style={{ lineHeight: 1.2 }}
                >
                    Minden termék
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category)}
                        className={`flex-shrink-0 px-3 py-1.5 bg-gray-500 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${activeCategory?.id === category.id
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                            }`}
                        style={{ lineHeight: 1.2 }}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            <div className="pt-6 pb-2">
                <div className="flex items-center justify-between px-4 pb-3">
                    <h2 className="text-[#181411] dark:text-white text-[22px] font-bold leading-tight">Daily Specials</h2>
                    <a className="text-primary text-sm font-bold" href="#">See All</a>
                </div>
                <div className="flex overflow-x-auto scroll-pl-4 snap-x pb-4 px-4 gap-4">
                    {categories.flatMap(category => category.items).filter(item => item.is_featured).map((item) => (

                        <div key={item.id} className={`snap-center shrink-0 flex flex-col gap-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm min-w-[260px] w-[260px] overflow-hidden group ${item.is_active ? '' : 'disabled'}`}>
                            <div className="relative w-full aspect-[4/3] overflow-hidden">
                                <div
                                    className="w-full h-full bg-center bg-no-repeat bg-cover transform group-hover:scale-105 transition-transform duration-500"
                                    style={{ backgroundImage: `url("${item.picture_url}")` }}
                                ></div>
                            </div>
                            <div className="flex flex-col p-4 pt-1 gap-3">
                                <div>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[#181411] dark:text-white text-lg font-bold leading-tight line-clamp-1">{item.name}</p>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-normal">{item.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-primary text-xl font-extrabold leading-normal">${item.price}</p>
                                    <button
                                        onClick={() => addToCart(item.name)}
                                        className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg shadow-black/30 transition-transform active:scale-90 hover:bg-gray-800"
                                    >
                                        <span className="material-symbols-outlined text-xl">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4 px-4 pt-2">
                <h3 className="text-[#181411] dark:text-white text-lg font-bold leading-tight">{activeCategory?.name || 'All Items'}</h3>
                {activeCategory ? activeCategory.items.map((item) => (

                    <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                        <div
                            className="w-24 h-24 shrink-0 rounded-lg bg-cover bg-center"
                            style={{ backgroundImage: `url("${item.picture_url}")` }}
                        ></div>
                        <div className="flex flex-1 flex-col h-24 justify-between py-1">
                            <div>
                                <div className="flex justify-between">
                                    <h4 className="text-[#181411] dark:text-white font-bold text-base line-clamp-1">{item.name}</h4>
                                </div>
                                <p className="text-[#897561] dark:text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[#181411] dark:text-white font-bold text-lg">${item.price}</span>
                                <div className="flex items-center bg-gray-100 dark:bg-white/10 rounded-lg overflow-hidden h-8">
                                    <button
                                        onClick={() => updateQuantity(item.name, -1)}
                                        className="w-8 h-full flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center dark:text-white">
                                        {cartItems[item.name] || 0}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.name, 1)}
                                        className="w-8 h-full flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) :
                    categories.flatMap(category => category.items).map((item) => (
                        <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div
                                className="w-24 h-24 shrink-0 rounded-lg bg-cover bg-center"
                                style={{ backgroundImage: `url("${item.picture_url}")` }}
                            ></div>
                            <div className="flex flex-1 flex-col h-24 justify-between py-1">
                                <div>
                                    <div className="flex justify-between">
                                        <h4 className="text-[#181411] dark:text-white font-bold text-base line-clamp-1">{item.name}</h4>
                                    </div>
                                    <p className="text-[#897561] dark:text-gray-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[#181411] dark:text-white font-bold text-lg">${item.price}</span>
                                    <div className="flex items-center bg-gray-100 dark:bg-white/10 rounded-lg overflow-hidden h-8">
                                        <button
                                            onClick={() => updateQuantity(item.name, -1)}
                                            className="w-8 h-full flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="text-sm font-bold w-4 text-center dark:text-white">
                                            {cartItems[item.name] || 0}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.name, 1)}
                                            className="w-8 h-full flex items-center justify-center text-black dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
                <div className="h-6"></div>
            </div>

            {totalItems > 0 && (
                <div className="sticky bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1a120b] border-t border-gray-100 dark:border-white/5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                    <button className="w-full bg-black hover:bg-gray-800 text-white rounded-xl h-14 flex items-center justify-between px-5 shadow-lg shadow-black/25 transition-all active:scale-[0.99]">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 rounded-lg px-2 py-1 text-sm font-bold">{totalItems}</div>
                            <span className="text-sm font-medium opacity-90">Kosarad</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-bold">${Object.values(cartItems).reduce((sum, count, index) => {
                                const item = categories.flatMap(category => category.items)[index]
                                return sum + (item ? item.price * count : 0)
                            }, 0)}</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}

export default MainPage
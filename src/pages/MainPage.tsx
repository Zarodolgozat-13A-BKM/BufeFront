import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCategories, selectAllItems } from '../store/categorySlice'
import { GetAllCategories } from '../services/CategoryService'
import { addItemToCart, updateItemQuantity } from '../store/cartSlice'
import type { CategoryModel } from '../Models/CategoryModel'
import type { ItemModel } from '../Models/ItemModel'
import { TopAppBar } from '../components/mainPage/TopAppBar'
import { SearchBar } from '../components/mainPage/SearchBar'
import { CategoryChips } from '../components/mainPage/CategoryChips'
import { SpecialItemCard } from '../components/mainPage/SpecialItemCard'
import { MenuItemCard } from '../components/mainPage/MenuItemCard'
import { setMe } from '../store/authSlice'
import { GetMe } from '../services/APIservice'
import { useNavigate } from 'react-router'
import { AddItemModal } from '../components/modals/addItemModal'
import { LoadingState } from '../components/common/LoadingState'

const MainPage = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const categories = useAppSelector((state) => state.category.categories)
    const me = useAppSelector((state) => state.auth.me)
    const cartItems = useAppSelector((state) => state.cart.cart.items)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<CategoryModel | null>(null)
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<ItemModel | null>(null)
    const [isLoadingMainData, setIsLoadingMainData] = useState(true)
    const [headerHeight, setHeaderHeight] = useState(0)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const stickyHeaderRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        let isDisposed = false

        const fetchCategories = async () => {
            try {
                const data = await GetAllCategories()
                if (!isDisposed) {
                    dispatch(setCategories(data))
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error)
                localStorage.clear()
                navigate('/login')
            }
        }
        const fetchMe = async () => {
            try {
                const data = await GetMe()
                if (!isDisposed) {
                    dispatch(setMe({ me: data }))
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error)
                localStorage.clear()
                navigate('/login')
            }
        }

        const bootstrapData = async () => {
            setIsLoadingMainData(true)
            if (!me) {
                await fetchMe()
            }
            await fetchCategories()
            if (!isDisposed) {
                setIsLoadingMainData(false)
            }
        }

        bootstrapData()

        return () => {
            isDisposed = true
        }
    }, [dispatch, me, navigate])

    const allItems = useAppSelector(selectAllItems)

    const itemQuantityById = useMemo(() => {
        const map: Record<number, number> = {}
        for (const item of cartItems) {
            map[item.id] = item.quantity ?? 0
        }
        return map
    }, [cartItems])

    const updateQuantity = (itemId: number, delta: number) => {
        if (delta === 0) return

        const currentQuantity = itemQuantityById[itemId] ?? 0

        if (currentQuantity === 0 && delta > 0) {
            const itemToAdd = allItems.find((item) => item.id === itemId)
            if (!itemToAdd) return

            dispatch(addItemToCart({ item: itemToAdd, quantity: delta }))
            return
        }

        dispatch(updateItemQuantity({ item_id: itemId, delta }))
    }

    const showModal = (item: ItemModel) => {
        setSelectedItem(item)
        setIsAddItemModalOpen(true)
    }


    const handleCheckout = () => {
        navigate('/checkout')
    }

    const totalItems = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
        [cartItems]
    )

    const totalPrice = useMemo(
        () => cartItems.reduce((sum, item) => sum + (item.price * (item.quantity ?? 0)), 0),
        [cartItems]
    )

    const featuredItems = useMemo(
        () => allItems.filter((item: ItemModel) => item.is_featured),
        [allItems]
    )

    const filteredCategories = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase()
        if (!normalizedQuery) {
            return categories.map((category, categoryIndex) => ({
                category,
                categoryIndex,
                filteredItems: category.items,
            }))
        }

        return categories.map((category, categoryIndex) => ({
            category,
            categoryIndex,
            filteredItems: category.items.filter((item) => item.name.toLowerCase().includes(normalizedQuery)),
        }))
    }, [categories, searchQuery])

    const hasSearchQuery = searchQuery.trim().length > 0
    const hasAnySearchResults = useMemo(
        () => filteredCategories.some(({ filteredItems }) => filteredItems.length > 0),
        [filteredCategories]
    )

    const suggestedCategories = useMemo(
        () => categories
            .map((category, categoryIndex) => ({ category, categoryIndex }))
            .filter(({ category }) => category.items.length > 0)
            .slice(0, 3),
        [categories]
    )

    const scrollToCategory = useCallback((categoryId: number | null) => {
        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer) return

        if (categoryId === null) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        window.requestAnimationFrame(() => {
            const targetElement = scrollContainer.querySelector(`[data-category-id="${categoryId}"]`) as HTMLDivElement | null
            if (!targetElement) return

            const topOffset = headerHeight || stickyHeaderRef.current?.offsetHeight || 0
            const containerTop = scrollContainer.getBoundingClientRect().top
            const targetTop = targetElement.getBoundingClientRect().top
            const containerScrollTop = scrollContainer.scrollTop + (targetTop - containerTop) - topOffset - 8

            scrollContainer.scrollTo({ top: Math.max(0, containerScrollTop), behavior: 'smooth' })

            // Fallback for cases where page scroll is driven by window instead of the inner container.
            const windowScrollTop = targetElement.getBoundingClientRect().top + window.scrollY - topOffset - 8
            window.scrollTo({ top: Math.max(0, windowScrollTop), behavior: 'smooth' })
        })
    }, [headerHeight])

    useEffect(() => {
        const updateHeaderHeight = () => {
            setHeaderHeight(stickyHeaderRef.current?.offsetHeight ?? 0)
        }

        updateHeaderHeight()
        window.addEventListener('resize', updateHeaderHeight)

        return () => {
            window.removeEventListener('resize', updateHeaderHeight)
        }
    }, [categories.length, searchQuery])

    const resetSearch = () => {
        setSearchQuery('')
        setActiveCategory(null)
        scrollToCategory(null)
    }

    return (
        <div className="mx-auto min-h-screen bg-background-light dark:bg-zinc-900 font-display antialiased ">
            <div
                ref={scrollContainerRef}
                className="mainpage-scrollbar relative flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800"
            >
            <div className=" fixed top-0 left-0 right-0 z-50">
                <div ref={stickyHeaderRef} className="w-full bg-white dark:bg-zinc-900 border-b border-x border-[#e6e0db] dark:border-zinc-800">
                    <TopAppBar
                        username={me?.full_name ?? 'Guest'}
                        totalItems={totalItems}
                        totalPrice={totalPrice}
                        onCartClick={handleCheckout}
                    />
                    <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    <CategoryChips categories={categories} searchQuery={searchQuery} activeCategory={activeCategory} onCategoryClick={(category) => { setActiveCategory(category); scrollToCategory(category.id) }} />
                </div>
            </div>

            <div aria-hidden style={{ height: headerHeight }} className="min-h-[160px]" />

            <main className="flex-1 max-w-[1920px] mx-auto w-full pb-8 md:pb-10">
            {isLoadingMainData ? (
                <div className="px-4 pt-5">
                    <LoadingState message="Kínálat betöltése..." />
                </div>
            ) : (
                <>
            <div className="pt-5 pb-2">
                <div className="flex items-center justify-between px-4 lg:px-6 2xl:px-8 pb-3">
                    <h2 className="text-text-dark dark:text-white tracking-tight text-xl sm:text-2xl lg:text-3xl 2xl:text-4xl font-bold leading-tight">
                        <span className="text-primary"></span> Napi válogatás
                    </h2>
                </div>
                <div className="flex overflow-x-auto scroll-pl-4 snap-x pb-4 px-4 lg:px-6 2xl:px-8 gap-3 lg:gap-4 2xl:gap-5 no-scrollbar">
                    {featuredItems.map((item: ItemModel) => (
                        <SpecialItemCard key={item.id} item={item} showModal={showModal} quantity={itemQuantityById[item.id] ?? 0} onUpdateQuantity={updateQuantity}/>
                    ))
                    }
                </div>
            </div>

            <div className="h-px bg-[#e6e0db] dark:bg-zinc-800 mx-4 lg:mx-6 2xl:mx-8 my-2"></div>

            {hasSearchQuery && !hasAnySearchResults ? (
                <div className="px-4 pt-8 ">
                    <div className="rounded-2xl border border-[#e6e0db] bg-bg-light px-5 py-6 text-center dark:border-zinc-700 dark:bg-zinc-800/60 max-w-2xl mx-auto">
                        <span className="material-symbols-outlined text-3xl text-text-light dark:text-zinc-400">search_off</span>
                        <h3 className="mt-3 text-base sm:text-lg lg:text-xl font-bold text-text-dark dark:text-white">Nincs találat erre: "{searchQuery.trim()}"</h3>
                        <p className="mt-2 text-sm text-text-light dark:text-zinc-400">
                            Próbálj rövidebb keresést, vagy válassz egy ajánlott kategóriát.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={resetSearch}
                                className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                            >
                                Keresés törlése
                            </button>
                            {suggestedCategories.map(({ category, categoryIndex }) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('')
                                        setActiveCategory(category)
                                        scrollToCategory(category.id)
                                    }}
                                    className="rounded-full border border-[#e6e0db] bg-white px-3 py-2 text-xs font-semibold text-text-dark transition-colors hover:border-primary/45 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {filteredCategories.map(({ category, categoryIndex, filteredItems }) => {
                if (filteredItems.length === 0) return <span key={category.id} />

                return (
                    <div key={category.id} data-category-id={category.id} className="flex flex-col gap-3 lg:gap-4 2xl:gap-6 px-4 lg:px-6 2xl:px-8 pt-6 scroll-mt-32">
                        <h3 className="text-text-dark dark:text-white text-base sm:text-lg lg:text-xl 2xl:text-2xl font-bold leading-tight flex items-center gap-2 mt-5">
                            <span className="w-1 h-5 bg-primary rounded-full"></span>
                            {category.name}
                        </h3>
                        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 4xl:grid-cols-4 gap-3 lg:gap-4 2xl:gap-6">
                            {filteredItems.map((item) => (
                                <MenuItemCard key={item.id} item={item} onUpdateQuantity={updateQuantity} quantity={itemQuantityById[item.id] ?? 0} showModal={showModal} />
                            ))}
                        </div>
                    </div>
                )
            })}
            <div className="h-6"></div>
                </>
            )}
            </main>
            <AddItemModal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} item={selectedItem} onUpdateQuantity={updateQuantity} qty={selectedItem ? (itemQuantityById[selectedItem.id] ?? 0) : 0} />
        </div>
        </div>
    )
}

export default MainPage
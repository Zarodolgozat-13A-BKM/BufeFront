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
import { CartBar } from '../components/mainPage/CartBar'
import { AddItemModal } from '../components/modals/addItemModal'
import { setMe } from '../store/authSlice'
import { GetMe } from '../services/APIservice'
import { useNavigate } from 'react-router'

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
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const stickyHeaderRef = useRef<HTMLDivElement | null>(null)
    const categoryRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await GetAllCategories()
                dispatch(setCategories(data))
            } catch (error) {
                console.error('Failed to fetch categories:', error)
                localStorage.clear()
                navigate('/login')
            }
        }
        const fetchMe = async () => {
            try {
                const data = await GetMe()
                dispatch(setMe({ me: data }))
            } catch (error) {
                console.error('Failed to fetch user data:', error)
                localStorage.clear()
                navigate('/login')
            }
        }
        if(!me)
        {
            fetchMe()
        } 
        fetchCategories()
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

    const scrollToCategory = useCallback((categoryIndex: number | null) => {
        const scrollContainer = scrollContainerRef.current
        if (!scrollContainer) return

        if (categoryIndex === null) {
            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        const targetElement = categoryRefs.current[categoryIndex]
        if (!targetElement) return

        const headerHeight = stickyHeaderRef.current?.offsetHeight ?? 0
        const scrollTop = targetElement.offsetTop - headerHeight - 8

        scrollContainer.scrollTo({ top: Math.max(0, scrollTop), behavior: 'smooth' })
    }, [])

    return (
        <div className="bg-background-light dark:bg-background-dark font-display antialiased">
            <div
                ref={scrollContainerRef}
                className="mainpage-scrollbar relative flex h-screen w-full mx-auto flex-col overflow-y-auto overflow-x-hidden shadow-sm bg-white dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800"
            >
            <div ref={stickyHeaderRef} className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-[#e6e0db] dark:border-zinc-800">
                <TopAppBar username={me?.full_name ?? 'Guest'} />
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <CategoryChips categories={categories} searchQuery={searchQuery} activeCategory={activeCategory} onCategoryClick={(category, categoryIndex) => { setActiveCategory(category); scrollToCategory(categoryIndex) }} />
            </div>

            <main className="flex-1 pb-28">
            <div className="pt-5 pb-2">
                <div className="flex items-center justify-between px-4 pb-3">
                    <h2 className="text-text-dark dark:text-white tracking-tight text-2xl font-bold leading-tight">
                        <span className="text-primary"></span> Napi válogatás
                    </h2>
                </div>
                <div className="flex overflow-x-auto scroll-pl-4 snap-x pb-4 px-4 gap-4 no-scrollbar">
                    {featuredItems.map((item: ItemModel) => (
                        <SpecialItemCard key={item.id} item={item} showModal={showModal} quantity={itemQuantityById[item.id] ?? 0} onUpdateQuantity={updateQuantity}/>
                    ))
                    }
                </div>
            </div>

            <div className="h-px bg-[#e6e0db] dark:bg-zinc-800 mx-4 my-2"></div>

            {filteredCategories.map(({ category, categoryIndex, filteredItems }) => {
                if (filteredItems.length === 0) return <span key={category.id} />

                return (
                    <div key={category.id} ref={(el) => { categoryRefs.current[categoryIndex] = el }} className="flex flex-col gap-3 px-4 pt-6 scroll-mt-32">
                        <h3 className="text-text-dark dark:text-white text-lg font-bold leading-tight flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary rounded-full"></span>
                            {category.name}
                        </h3>
                        {filteredItems.map((item) => (
                            <MenuItemCard key={item.id} item={item} onUpdateQuantity={updateQuantity} quantity={itemQuantityById[item.id] ?? 0} showModal={showModal} />
                        ))}
                    </div>
                )
            })}
            <div className="h-6"></div>
            </main>

            <CartBar totalItems={totalItems} totalPrice={totalPrice} onClick={handleCheckout}/>

            <AddItemModal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} item={selectedItem} onUpdateQuantity={updateQuantity} qty={selectedItem ? (itemQuantityById[selectedItem.id] ?? 0) : 0}/>
        </div>
        </div>
    )
}

export default MainPage
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCategories } from '../store/categorySlice'
import { GetAllCategories } from '../services/CategoryService'
import { setItems } from '../store/itemSlice'
import { updateItemQuantity, removeItemFromCart } from '../store/cartSlice'
import type { CategoryModel } from '../Models/CategoryModel'
import type { ItemModel } from '../Models/ItemModel'
import { TopAppBar } from '../components/mainPage/TopAppBar'
import { SearchBar } from '../components/mainPage/SearchBar'
import { CategoryChips } from '../components/mainPage/CategoryChips'
import { SpecialItemCard } from '../components/mainPage/SpecialItemCard'
import { MenuItemCard } from '../components/mainPage/MenuItemCard'
import { CartBar } from '../components/mainPage/CartBar'
import { CartModal } from '../components/modals/CartModal'
import { AddItemModal } from '../components/modals/addItemModal'

const MainPage = () => {
    const dispatch = useAppDispatch()
    const { categories } = useAppSelector((state) => ({ categories: state.category.categories }))
    const username = useAppSelector((state) => state.auth.name)
    const cartItems = useAppSelector((state) => state.cart.cart.items)

    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<CategoryModel | null>(null)
    const [isCartModalOpen, setIsCartModalOpen] = useState(false)
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
            }
        }
        
        fetchCategories()
    }, [dispatch])

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(setItems([]))
            return
        }

        const data: ItemModel[] = categories.flatMap((category: CategoryModel) => category.items)
        dispatch(setItems(data))
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

    // Helper to get item quantity from Redux cart
    const getItemQuantity = (itemId: number): number => {
        const cartItem = cartItems.find(item => item.item_id === itemId)
        return cartItem?.quantity || 0
    }

    const updateQuantity = (itemId: number, delta: number) => {
        dispatch(updateItemQuantity({ item_id: itemId, delta }))
    }

    // dispatching wrapper for removing an item from the cart
    const handleRemoveItem = (itemId: number) => {
        dispatch(removeItemFromCart(itemId))
    }

    const showModal = (item: ItemModel) => {
        setSelectedItem(item)
        setIsAddItemModalOpen(true)
    }


    const handleCheckout = () => {
        console.log('Proceeding to checkout with items:', cartItems)
    }

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cartItems.reduce((sum, cartItem) => {
        const item = categories.flatMap((category: CategoryModel) => category.items).find(i => i.id === cartItem.item_id)
        return sum + (item ? item.price * cartItem.quantity : 0)
    }, 0)

    const getFilteredItems = (items: ItemModel[]) => {
        if (!searchQuery.trim()) return items
        return items.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    }

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
        <div ref={scrollContainerRef} className="mainpage-scrollbar relative flex h-screen w-full flex-col overflow-y-auto overflow-x-hidden bg-white dark:bg-black">
            <div ref={stickyHeaderRef} className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-sm border-b border-primary/20 dark:border-primary/30">
                <TopAppBar username={username} loyaltyPoints={150} />
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
                <CategoryChips categories={categories} activeCategory={activeCategory} onCategoryClick={(category, categoryIndex) => { setActiveCategory(category); scrollToCategory(categoryIndex) }} />
            </div>

            <div className="pt-6 pb-2">
                <div className="flex items-center justify-between px-4 pb-3">
                    <h2 className="text-black dark:text-white text-[22px] font-bold leading-tight">
                        <span className="text-primary"></span> Daily Specials
                    </h2>
                </div>
                <div className="flex overflow-x-auto scroll-pl-4 snap-x pb-4 px-4 gap-4">
                    {categories.flatMap((category: CategoryModel) => category.items).filter((item: ItemModel) => item.is_featured).map((item: ItemModel) => (
                        <SpecialItemCard key={item.id} item={item} showModal={showModal} quantity={getItemQuantity(item.id)} />
                    ))
                    }
                </div>
            </div>

            {categories.map((category: CategoryModel, categoryIndex: number) => {
                const filteredItems = getFilteredItems(category.items)
                if (filteredItems.length === 0) return null

                return (
                    <div key={category.id} ref={(el) => { categoryRefs.current[categoryIndex] = el }} className="flex flex-col gap-4 px-4 pt-6 scroll-mt-32">
                        <h3 className="text-black dark:text-white text-lg font-bold leading-tight flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary rounded-full"></span>
                            {category.name}
                        </h3>
                        {filteredItems.map((item) => (
                            <MenuItemCard key={item.id} item={item} quantity={getItemQuantity(item.id)} showModal={showModal} />
                        ))}
                    </div>
                )
            })}
            <div className="h-6"></div>

            <CartBar totalItems={totalItems} totalPrice={totalPrice} onClick={() => setIsCartModalOpen(true)}/>

            <CartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} removeItem={handleRemoveItem} cartItems={cartItems} allItems={categories.flatMap((category: CategoryModel) => category.items)} onUpdateQuantity={updateQuantity} onCheckout={handleCheckout}/>

            <AddItemModal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} item={selectedItem} onUpdateQuantity={updateQuantity} qty={selectedItem ? getItemQuantity(selectedItem.id) : 0}/>
        </div>
    )
}

export default MainPage
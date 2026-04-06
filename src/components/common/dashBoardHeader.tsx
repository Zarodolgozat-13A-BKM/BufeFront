import type { ReactNode } from 'react'
import { Link } from "react-router";
import { Logout as ApiLogout } from '../../services/APIservice'
import { getThemePreference, toggleTheme, type ThemePreference } from "../../services/themeService";
import { logout } from "../../store/authSlice";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
const DashBoardHeader = ({ name, showAdmin, backTo }: { name: ReactNode; showAdmin: boolean; backTo: string }) => {
    const [theme, setTheme] = useState<ThemePreference>(() => getThemePreference())
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const me = useAppSelector((state) => state.auth.me)
    const dispatch = useAppDispatch();
    const handleThemeToggle = () => {
        setTheme(toggleTheme())
        setIsMobileMenuOpen(false)
    }
    const handleLogout = async () => {
        try {
            await ApiLogout()
        } catch (err) {
            console.warn('API logout failed, continuing to clear local state', err)
        }
        dispatch(logout())
        setIsMobileMenuOpen(false)
    }
    return (
        <div className="sticky top-0 z-20 border-b border-[#e6e0db] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative flex items-center justify-center">
                <Link to={backTo} className="absolute left-0 text-foreground dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h2 className="text-foreground dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">{name}</h2>
                <div className="absolute right-0 hidden shrink-0 items-center gap-1 md:flex">
                    {showAdmin && me?.role === 'admin' ?
                        <Link to="/orders" className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><span className="material-symbols-outlined">order_play</span></Link> :""
                    }
                    <button
                        onClick={handleThemeToggle}
                        aria-label="Téma váltása"
                        title="Téma váltása"
                        className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">
                            {theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'computer'}
                        </span>
                    </button>
                    <button onClick={() => { if (confirm('Kijelentkezés megerősítése')) { handleLogout() } }} className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
                <div className="absolute right-0 md:hidden">
                    <button
                        type="button"
                        aria-label="Menü megnyitása"
                        aria-expanded={isMobileMenuOpen}
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>

                {isMobileMenuOpen ? (
                    <div className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-[#e6e0db] bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 md:hidden">
                        {showAdmin && me?.role === 'admin' ? (
                            <Link
                                to="/orders"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800"
                            >
                                <span className="material-symbols-outlined text-[20px]">order_play</span>
                                Rendeléskezelő
                            </Link>
                        ) : null}

                        <button
                            type="button"
                            onClick={handleThemeToggle}
                            className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'computer'}
                            </span>
                            Téma váltása
                        </button>

                        <button
                            type="button"
                            onClick={() => { if (confirm('Kijelentkezés megerősítése')) { handleLogout() } }}
                            className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-zinc-800"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Kijelentkezés
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default DashBoardHeader




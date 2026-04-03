import type { ReactNode } from 'react'
import { Link } from "react-router";
import { Logout as ApiLogout } from '../../services/APIservice'
import { getThemePreference, toggleTheme, type ThemePreference } from "../../services/themeService";
import { logout } from "../../store/authSlice";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
const DashBoardHeader = ({ name, showAdmin, backTo }: { name: ReactNode; showAdmin: boolean; backTo: string }) => {
    const [theme, setTheme] = useState<ThemePreference>(() => getThemePreference())
    const me = useAppSelector((state) => state.auth.me)
    const dispatch = useAppDispatch();
    const handleThemeToggle = () => {
        setTheme(toggleTheme())
    }
    const handleLogout = async () => {
        try {
            await ApiLogout()
        } catch (err) {
            console.warn('API logout failed, continuing to clear local state', err)
        }
        dispatch(logout())
    }
    return (
        <div className="sticky top-0 z-20 border-b border-[#e6e0db] bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative flex items-center justify-center">
                <Link to={backTo} className="absolute left-0 text-text-dark dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h2 className="text-text-dark dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">{name}</h2>
                <div className="absolute right-0 flex items-center gap-1 shrink-0">
                    {showAdmin && me?.role === 'admin' ?
                        <Link to="/orders" className="text-text-dark dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><span className="material-symbols-outlined">order_play</span></Link> :""
                    }
                    <button
                        onClick={handleThemeToggle}
                        aria-label="Téma váltása"
                        title="Téma váltása"
                        className="text-text-dark dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">
                            {theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'computer'}
                        </span>
                    </button>
                    <button onClick={() => { if (confirm('Kijelentkezés megerősítése')) { handleLogout() } }} className="text-text-dark dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DashBoardHeader



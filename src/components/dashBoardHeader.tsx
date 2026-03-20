import type { ReactNode } from 'react'
import { useDispatch } from "react-redux";
import { Link } from "react-router";
import { Logout as ApiLogout } from '../services/APIservice'
import { isDarkTheme, toggleTheme } from "../services/themeService";
import { logout } from "../store/authSlice";
import { useEffect, useState } from "react";
const DashBoardHeader = ({ name }: { name: ReactNode }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const dispatch = useDispatch();
    useEffect(() => {
        setTheme(isDarkTheme() ? 'dark' : 'light')
    }, [])
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
            <div className="flex items-center justify-between">
                <Link to='/main' className="text-text-dark dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h2 className="text-text-dark dark:text-white text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{name}</h2>
                <button
                    onClick={handleThemeToggle}
                    aria-label="Dark mode váltása"
                    title="Dark mode váltása"
                    className="text-text-dark dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">
                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>
                <button onClick={() => { if (confirm('Kijelentkezés megerősítése')) { handleLogout() } }} className="text-text-dark dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <span className="material-symbols-outlined">logout</span>
                </button>
            </div>
        </div>
    )
}

export default DashBoardHeader



import type { ReactNode } from "react";
import { Link } from "react-router";
import { Logout as ApiLogout } from "../../services/APIservice";
import {
  getThemePreference,
  toggleTheme,
  type ThemePreference,
} from "../../services/themeService";
import { logout } from "../../store/authSlice";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Swal from "sweetalert2";
type DashBoardHeaderProps = {
  name: ReactNode;
  showAdmin: boolean;
  showPos?: boolean;
  backTo: string;
  isSoundEnabled?: boolean;
  onSoundToggle?: () => void | Promise<void>;
};

const DashBoardHeader = ({
  name,
  showAdmin = false,
  showPos = false,
  backTo,
  isSoundEnabled,
  onSoundToggle,
}: DashBoardHeaderProps) => {
  const [theme, setTheme] = useState<ThemePreference>(() =>
    getThemePreference(),
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const me = useAppSelector((state) => state.auth.me);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (mobileMenuRef.current?.contains(target)) return;
      setIsMobileMenuOpen(false);
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("touchstart", handleOutsideClick);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  const handleThemeToggle = () => {
    setTheme(toggleTheme());
    setIsMobileMenuOpen(false);
  };

  const handleSoundToggle = async () => {
    if (!onSoundToggle) return;
    await onSoundToggle();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await ApiLogout();
    } catch (err) {
      console.warn("API logout failed, continuing to clear local state", err);
    }
    dispatch(logout());
    setIsMobileMenuOpen(false);
  };
  return (
    <div className="sticky top-0 z-20 border-b border-[#e6e0db] bg-surface p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative flex items-center justify-center">
        <Link
          to={backTo}
          className="absolute left-0 text-foreground dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h2 className="text-foreground dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
          {name}
        </h2>
        <div className="absolute right-0 hidden shrink-0 items-center gap-1 md:flex">
          {showAdmin && me?.role === "admin" ? (
            <Link
              to="/admin/orders"
              className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">order_play</span>
            </Link>
          ) : (
            ""
          )}
          {showPos && me?.role === "admin" ? (
            <Link
              to="/admin/pos"
              className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">point_of_sale</span>
            </Link>
          ) : (
            ""
          )}
          {typeof isSoundEnabled === "boolean" && onSoundToggle ? (
            <button
              type="button"
              onClick={handleSoundToggle}
              aria-label={
                isSoundEnabled
                  ? "Értesítési hang kikapcsolása"
                  : "Értesítési hang bekapcsolása"
              }
              title={
                isSoundEnabled ? "Értesítési hang be" : "Értesítési hang ki"
              }
              className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">
                {isSoundEnabled ? "notifications_active" : "notifications_off"}
              </span>
            </button>
          ) : null}
          <button
            onClick={handleThemeToggle}
            aria-label="Téma váltása"
            title="Téma váltása"
            className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">
              {theme === "dark"
                ? "dark_mode"
                : theme === "light"
                  ? "light_mode"
                  : "computer"}
            </span>
          </button>
          <button
            onClick={async () => {
              if (
                await Swal.fire({
                  title: "Kijelentkezés megerősítése",
                  text: "Biztosan ki szeretnél jelentkezni?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Igen, kijelentkezem",
                  cancelButtonText: "Mégse",
                  theme:
                    theme === "dark"
                      ? "dark"
                      : theme === "light"
                        ? "light"
                        : "auto",
                }).then((result) => result.isConfirmed)
              ) {
                handleLogout();
              }
            }}
            className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
        <div ref={mobileMenuRef} className="absolute right-0 md:hidden">
          <button
            type="button"
            aria-label="Menü megnyitása"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="text-foreground dark:text-white flex size-12 items-center justify-center cursor-pointer hover:bg-surface-hover dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>

          {isMobileMenuOpen ? (
            <div className="absolute right-0 top-12 z-30 w-56 rounded-xl border border-[#e6e0db] bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 md:hidden">
              {showAdmin && me?.role === "admin" ? (
                <Link
                  to="/admin/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    order_play
                  </span>
                  Rendeléskezelő
                </Link>
              ) : null}
              {showPos && me?.role === "admin" ? (
                <Link
                  to="/admin/pos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    point_of_sale
                  </span>
                  Pult mód
                </Link>
              ) : null}
              {typeof isSoundEnabled === "boolean" && onSoundToggle ? (
                <button
                  type="button"
                  onClick={handleSoundToggle}
                  className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isSoundEnabled
                      ? "notifications_active"
                      : "notifications_off"}
                  </span>
                  {isSoundEnabled ? "Hang be" : "Hang ki"}
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleThemeToggle}
                className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {theme === "dark"
                    ? "dark_mode"
                    : theme === "light"
                      ? "light_mode"
                      : "computer"}
                </span>
                Téma váltása
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (
                    await Swal.fire({
                      title: "Kijelentkezés megerősítése",
                      text: "Biztosan ki szeretnél jelentkezni?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Igen, kijelentkezem",
                      cancelButtonText: "Mégse",
                      theme:
                        theme === "dark"
                          ? "dark"
                          : theme === "light"
                            ? "light"
                            : "auto",
                    }).then((result) => result.isConfirmed)
                  ) {
                    handleLogout();
                  }
                }}
                className="text-foreground dark:text-white flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-300 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                Kijelentkezés
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DashBoardHeader;

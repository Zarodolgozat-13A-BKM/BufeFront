import { Link } from "react-router";

interface TopAppBarProps {
  username?: string;
  totalItems?: number;
  totalPrice?: number;
  onCartClick?: () => void;
  // loyaltyPoints?: number;
}

export const TopAppBar = ({
  username,
  totalItems = 0,
  totalPrice = 0,
  onCartClick,
  // loyaltyPoints = 150,
}: TopAppBarProps) => {
  const displayName = username
    ?.split(".")
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="p-4 pb-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-text-light dark:text-zinc-400 font-medium">Szia,</p>
          <Link
            to="/admin"
            className="group inline-flex items-center gap-1.5 text-text-dark dark:text-white text-lg font-bold leading-tight"
          >
            <span>{displayName}</span>
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-base text-text-light dark:text-zinc-400 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 group-hover:animate-[spin_2.8s_linear_infinite] group-focus-visible:animate-[spin_2.8s_linear_infinite]"
            >
              settings
            </span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {totalItems > 0 && onCartClick ? (
          <button
            type="button"
            onClick={onCartClick}
            className="inline-flex min-h-10 items-center gap-2.5 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-primary shadow-sm"
            aria-label="Kosár megnyitása"
          >
            <span className="text-sm font-bold">{totalItems}</span>
            <span className="material-symbols-outlined text-lg">shopping_cart</span>
            <span className="text-sm font-semibold">{totalPrice}Ft</span>
          </button>
        ) : null}
        {/* <div className="flex items-center justify-center bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
          <span className="text-primary material-symbols-outlined text-lg mr-1 filled">
            star
          </span>
          <p className="text-primary text-sm font-bold leading-normal">
            {loyaltyPoints} pts
          </p>
        </div> */}
      </div>
    </div>
  );
};

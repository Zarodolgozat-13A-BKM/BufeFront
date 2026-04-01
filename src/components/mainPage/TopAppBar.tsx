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
          <Link to="/admin" className="text-text-dark dark:text-white text-lg font-bold leading-tight">
            {displayName}
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {totalItems > 0 && onCartClick ? (
          <button
            type="button"
            onClick={onCartClick}
            className="md:hidden inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-primary"
            aria-label="Kosár megnyitása"
          >
            <span className="text-xs font-bold">{totalItems}</span>
            <span className="material-symbols-outlined text-base">shopping_cart</span>
            <span className="text-xs font-semibold">{totalPrice}Ft</span>
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

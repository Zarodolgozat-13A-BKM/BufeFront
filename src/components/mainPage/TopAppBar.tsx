interface TopAppBarProps {
  username?: string;
  loyaltyPoints?: number;
}

export const TopAppBar = ({
  username,
  loyaltyPoints = 150,
}: TopAppBarProps) => {
  const displayName = username
    ?.split(".")
    .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <div className="p-4 pb-2 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-orange-500 font-semibold">Szia,</p>
          <h2 className="text-black dark:text-white text-lg font-bold leading-tight">
            {displayName || "Guest"}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center bg-orange-500 px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-white material-symbols-outlined text-lg mr-1 filled">
            star
          </span>
          <p className="text-white text-sm font-bold leading-normal">
            {loyaltyPoints} pts
          </p>
        </div>
      </div>
    </div>
  );
};

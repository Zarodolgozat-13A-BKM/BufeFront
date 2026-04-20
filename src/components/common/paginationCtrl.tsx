interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginationControlsProps) => {
  if (totalPages <= 1) return null;

  const isOnFirstPage = currentPage <= 1;
  const isOnLastPage = currentPage >= totalPages;

  const pageItems: Array<number | "ellipsis"> = [];

  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      pageItems.push(page);
    }
  } else {
    pageItems.push(1);

    if (currentPage > 3) {
      pageItems.push("ellipsis");
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let page = startPage; page <= endPage; page += 1) {
      pageItems.push(page);
    }

    if (currentPage < totalPages - 2) {
      pageItems.push("ellipsis");
    }

    pageItems.push(totalPages);
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={isLoading || isOnFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-lg border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-foreground dark:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Előző
      </button>
      <div className="flex items-center gap-1">
        {pageItems.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1 text-xs font-medium text-muted dark:text-zinc-400"
              >
                ...
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              disabled={isLoading || isActive}
              onClick={() => onPageChange(item)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:cursor-not-allowed ${
                isActive
                  ? "border-transparent bg-primary text-white "
                  : "border-[#e6e0db] bg-white text-foreground dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 disabled:opacity-50"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={isLoading || isOnLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-lg border border-[#e6e0db] dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-foreground dark:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Következő
      </button>
    </div>
  );
};
export { PaginationControls };
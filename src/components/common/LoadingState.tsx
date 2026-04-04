interface LoadingStateProps {
  message?: string;
  className?: string;
  action?: React.ReactNode;
}

export const LoadingState = ({
  message = "Betoltes...",
  className = "",
  action,
}: LoadingStateProps) => {
  return (
    <div className={"flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e0db] bg-white py-10 dark:border-zinc-700 dark:bg-zinc-800 " + className}>
      <span className="material-symbols-outlined text-3xl text-muted dark:text-zinc-400 animate-spin">sync</span>
      <p className="mt-2 text-muted dark:text-zinc-300 text-sm font-normal leading-normal text-center">
        {message}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};


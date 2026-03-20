interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchBar = ({ value, onChange, placeholder = "Nem találsz valamit?" }: SearchBarProps) => {
  return (
    <div className="px-4 py-3">
      <label className="flex flex-col h-12 w-full rounded-xl">
        <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white dark:bg-zinc-800 border border-[#e6e0db] dark:border-zinc-700 focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden">
          <div className="text-text-light dark:text-zinc-400 flex items-center justify-center pl-4 pr-2">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-text-dark dark:text-white focus:outline-0 focus:ring-0 border-none h-full placeholder:text-text-light dark:placeholder:text-zinc-500 px-2 text-base font-normal leading-normal" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      </label>
    </div>
  )
}

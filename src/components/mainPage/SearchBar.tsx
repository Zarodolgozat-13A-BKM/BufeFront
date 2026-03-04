interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchBar = ({ value, onChange, placeholder = "Craving a burger? Search menu..." }: SearchBarProps) => {
  return (
    <div className="px-4 py-4">
      <label className="flex flex-col h-12 w-full shadow-sm rounded-xl transition-all duration-300 focus-within:shadow-md focus-within:shadow-primary/20">
        <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white dark:bg-white/5 border border-transparent focus-within:border-primary/50 overflow-hidden">
          <div className="text-[#897561] dark:text-gray-400 flex items-center justify-center pl-4 pr-2">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input 
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden bg-transparent text-[#181411] dark:text-white focus:outline-0 focus:ring-0 border-none h-full placeholder:text-[#897561] dark:placeholder:text-gray-500 px-2 text-base font-normal leading-normal" 
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </label>
    </div>
  )
}

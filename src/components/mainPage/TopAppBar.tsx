interface TopAppBarProps {
  username?: string
  loyaltyPoints?: number
}

export const TopAppBar = ({ username, loyaltyPoints = 150 }: TopAppBarProps) => {
  const displayName = username?.split('.').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

  return (
    <div className="p-4 pb-2 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full size-10 shadow-sm border-2 border-white dark:border-white/10" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAv181Jcv1iyrzlNfYDzhyaS7SmGaJAAFH-mAjDRGzdSXP_qIb91aWY7omR3-61YC9zfk0PI3WfBqZ5CJOKnHIXf-brB0TzB6mCS00ID5eL91mmLchaltyhtnjd1c2NBL4Ow5hdqHXfuTPK9eqcMLDaHXO0hONNtFe77ykSW8kjjL9KnxkpjbVzb94Nh_p9Pi-wAZw159raP4tvu9J1IgszFXGA6l_0fYL8mq8uKrqtfNdHmMfU_i-zj58iNmwuhMjuTdGqZLRjtpgF")' }}
          ></div>
          <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark"></div>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Szia,</p>
          <h2 className="text-[#181411] dark:text-white text-lg font-bold leading-tight">
            {displayName || 'Guest'}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center bg-white dark:bg-white/10 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-transparent">
          <span className="text-primary material-symbols-outlined text-lg mr-1 filled">star</span>
          <p className="text-[#897561] dark:text-gray-200 text-sm font-bold leading-normal">{loyaltyPoints} pts</p>
        </div>
      </div>
    </div>
  )
}

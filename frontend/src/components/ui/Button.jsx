import { cn } from "../../lib/utils";

export function Button({ className, variant = "primary", size = "md", isLoading, children, ...props }) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080c14] disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 border border-emerald-500/30 focus:ring-emerald-500 active:scale-[0.98]",
    secondary: "bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 focus:ring-slate-500 active:scale-[0.98]",
    outline: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 focus:ring-emerald-500",
    ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/50 focus:ring-slate-500",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 focus:ring-red-500",
    success: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 focus:ring-emerald-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
    xl: "px-8 py-3.5 text-base font-semibold",
    icon: "p-2",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}

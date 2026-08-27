import * as React from "react";

const buttonVariants = {
  default: "bg-[#18181B] text-white hover:bg-[#F07020]",
  secondary: "bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7] hover:bg-[#E4E4E7]",
  outline: "border border-[#E4E4E7] bg-white text-[#18181B] hover:bg-[#F4F4F5]",
  ghost: "hover:bg-[#F4F4F5] text-[#18181B]",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
};

const buttonSizes = {
  default: "h-10 px-4 py-2 text-xs",
  sm: "h-8 rounded-full px-3 text-[11px]",
  lg: "h-12 rounded-2xl px-6 text-sm",
  icon: "h-9 w-9 p-0 justify-center",
};

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", disabled, children, ...props }, ref) => {
    const variantClass = buttonVariants[variant] || buttonVariants.default;
    const sizeClass = buttonSizes[size] || buttonSizes.default;

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center font-bold tracking-tight rounded-full transition-all cursor-pointer border-none disabled:opacity-50 disabled:pointer-events-none select-none ${variantClass} ${sizeClass} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

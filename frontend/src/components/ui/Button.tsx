import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

export type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
  secondary: "bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-500",
  success: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
  warning: "bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500",
  danger: "bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500",
  ghost: "bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500",
  outline: "border border-neutral-300 bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500"
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs",
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
  xl: "px-6 py-3 text-base"
};

export const Button = ({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  isLoading,
  fullWidth,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.11 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};


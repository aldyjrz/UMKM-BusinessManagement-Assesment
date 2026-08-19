import { forwardRef } from "react";
import { clsx } from "clsx";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, helperText, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="mb-1 block text-sm font-medium text-neutral-700">{label}</label>}
      <textarea
        ref={ref}
        className={clsx(
          "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
          error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      {helperText && <p className="mt-1 text-xs text-neutral-500">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = "Textarea";


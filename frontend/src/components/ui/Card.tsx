import type { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  noPadding?: boolean;
}

export const Card = ({ title, children, className, headerAction, noPadding }: CardProps) => {
  return (
    <div className={clsx("rounded-xl bg-white shadow-sm border border-neutral-200", className)}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          {title && <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>}
          {headerAction}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
};


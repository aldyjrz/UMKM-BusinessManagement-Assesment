import type { ReactNode } from "react";
import { clsx } from "clsx";

interface TableProps {
  headers: Array<{ key: string; label: string; align?: "left" | "center" | "right" }>;
  children: ReactNode;
}

export const Table = ({ headers, children }: TableProps) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr className="bg-neutral-50 text-neutral-700">
            {headers.map((header) => (
              <th
                key={header.key}
                className={clsx(
                  "px-4 py-3 font-medium",
                  header.align === "center" && "text-center",
                  header.align === "right" && "text-right"
                )}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

interface TableRowProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export const TableRow = ({ onClick, children, className }: TableRowProps) => {
  return (
    <tr
      className={clsx(
        "border-b border-neutral-100 transition-colors last:border-0",
        onClick && "cursor-pointer hover:bg-neutral-50",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export const TableCell = ({ children, align = "left", className }: TableCellProps) => {
  return (
    <td
      className={clsx(
        "px-4 py-3 whitespace-nowrap text-neutral-700",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

   if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={clsx(
          "rounded-lg border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50",
          currentPage > 1 && "hover:bg-neutral-100"
        )}
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              "h-8 w-8 rounded-lg text-sm",
              page === currentPage
                ? "bg-primary-600 text-white"
                : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={clsx(
          "rounded-lg border border-neutral-300 px-3 py-1 text-sm disabled:opacity-50",
          currentPage < totalPages && "hover:bg-neutral-100"
        )}
      >
        Next
      </button>
    </div>
  );
};


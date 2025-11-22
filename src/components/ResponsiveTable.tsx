"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface ResponsiveTableProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  mobileCardRenderer: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  className?: string;
}

export function ResponsiveTable<T extends { id: string }>({
  data,
  columns,
  mobileCardRenderer,
  onRowClick,
  emptyMessage = "No data found",
  emptyAction,
  className,
}: ResponsiveTableProps<T>) {
  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  // Empty state
  if (data.length === 0) {
    return (
      <Card className={cn("shadow-lg border-0", className)}>
        <CardContent className="p-16 text-center">
          <h3 className="text-lg font-semibold mb-2">No data found</h3>
          <p className="text-muted-foreground mb-6">{emptyMessage}</p>
          {emptyAction}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <Card className={cn("hidden lg:block shadow-lg border-0", className)}>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-6 py-4 text-left text-sm font-semibold",
                        column.className
                      )}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "transition-all group",
                      onRowClick &&
                        "cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                    )}
                    onClick={() => handleRowClick(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn("px-6 py-4", column.className)}
                      >
                        {column.render
                          ? column.render(item)
                          : (item as any)[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile card view */}
      <div className="lg:hidden space-y-3">
        {data.map((item) => (
          <div
            key={item.id}
            onClick={() => handleRowClick(item)}
            className={cn(onRowClick && "cursor-pointer")}
          >
            {mobileCardRenderer(item)}
          </div>
        ))}
      </div>
    </>
  );
}

"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Product, ProductType } from "@/types";
import Badge from "@/components/ui/badge/Badge";
import { formatCurrency } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { getImagePath } from "@/lib/utils/imagePath";

// Import BadgeColor type from Badge component
type BadgeColor = 
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple"
  | "red"
  | "gray";

const columnHelper = createColumnHelper<Product>();

interface ProductTableProps {
  data: Product[];
  isLoading?: boolean;
  onSelectionChange?: (selectedIds: number[]) => void;
  enableSelection?: boolean;
}

/**
 * Product Table Component with TanStack React Table
 * Features: Sorting, Pagination, Row Selection, Column Visibility
 */
export function ProductTable({
  data,
  isLoading = false,
  onSelectionChange,
  enableSelection = true,
}: ProductTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(rowSelection)
        .filter((key) => rowSelection[key])
        .map((key) => data[parseInt(key)]?.id)
        .filter(Boolean);
      onSelectionChange(selectedIds);
    }
  }, [rowSelection, data, onSelectionChange]);

  // Product type labels & colors
  const getTypeLabel = (type: ProductType) => {
    const labels: Record<ProductType, string> = {
      raw_material: "Nguyên liệu",
      packaging: "Bao bì",
      finished_product: "Thành phẩm",
      goods: "Hàng hóa",
    };
    return labels[type];
  };

  const getTypeBadgeColor = (type: ProductType): BadgeColor => {
    const colors: Record<ProductType, BadgeColor> = {
      raw_material: "blue",
      packaging: "yellow",
      finished_product: "green",
      goods: "purple",
    };
    return colors[type];
  };

  const getStatusBadgeColor = (status: string): BadgeColor => {
    const colors: Record<string, BadgeColor> = {
      active: "green",
      inactive: "gray",
      discontinued: "red",
    };
    return colors[status] || "gray";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Hoạt động",
      inactive: "Tạm ngưng",
      discontinued: "Ngừng kinh doanh",
    };
    return labels[status] || status;
  };

  // Define columns
  const columns = React.useMemo(
    () => [
      // Selection column
      ...(enableSelection
        ? [
            columnHelper.display({
              id: "select",
              header: ({ table }) => {
                const ref = useRef<HTMLInputElement>(null);

                useEffect(() => {
                    if(ref.current) {
                        ref.current.indeterminate = table.getIsSomeRowsSelected();
                    }
                }, [table.getIsSomeRowsSelected()]);

                return (
                    <input
                      ref={ref}
                      type="checkbox"
                      checked={table.getIsAllRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                )
              },
              cell: ({ row }) => (
                <input
                  type="checkbox"
                  checked={row.getIsSelected()}
                  disabled={!row.getCanSelect()}
                  onChange={row.getToggleSelectedHandler()}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              ),
              size: 40,
            }),
          ]
        : []),

      // Image column
      columnHelper.accessor("images", {
        id: "image",
        header: "Ảnh",
        cell: (info) => {
          const primaryImage = info.getValue()?.find((img) => img.isPrimary);
          const imageUrl = primaryImage?.imageUrl || info.getValue()?.[0]?.imageUrl;
          const imageFullPath = getImagePath(imageUrl || "");

          return imageFullPath ? (
            <img
              src={imageFullPath}
              alt={info.row.original.productName}
              className="h-12 w-12 rounded object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200 dark:bg-gray-700">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          );
        },
        enableSorting: false,
        size: 80,
      }),

      // SKU column
      columnHelper.accessor("sku", {
        header: "SKU",
        cell: (info) => (
          <Link
            href={`/products/${info.row.original.id}`}
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {info.getValue()}
          </Link>
        ),
        size: 120,
      }),

      // Name column
      columnHelper.accessor("productName", {
        header: "Tên sản phẩm",
        cell: (info) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {info.getValue()}
            </div>
            {info.row.original.barcode && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {info.row.original.barcode}
              </div>
            )}
          </div>
        ),
        size: 250,
      }),

      // Type column
      columnHelper.accessor("productType", {
        header: "Loại",
        cell: (info) => (
          <Badge color={getTypeBadgeColor(info.getValue())}>
            {getTypeLabel(info.getValue())}
          </Badge>
        ),
        size: 130,
      }),

      // Category column
      columnHelper.accessor("category.categoryName", {
        id: "category",
        header: "Danh mục",
        cell: (info) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {info.getValue() || "—"}
          </span>
        ),
        size: 150,
      }),

      // Unit column
      columnHelper.accessor("unit", {
        header: "Đơn vị",
        cell: (info) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {info.getValue()}
          </span>
        ),
        size: 80,
      }),

      // Price column
      columnHelper.accessor("sellingPriceRetail", {
        header: "Giá bán",
        cell: (info) => {
          const price = info.getValue();
          return price ? (
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(price)}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          );
        },
        size: 120,
      }),

      // Min Stock column
      columnHelper.accessor("minStockLevel", {
        header: "Tồn tối thiểu",
        cell: (info) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {info.getValue() || 0}
          </span>
        ),
        size: 100,
      }),

      // Status column
      columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: (info) => (
          <Badge color={getStatusBadgeColor(info.getValue())}>
            {getStatusLabel(info.getValue())}
          </Badge>
        ),
        size: 120,
      }),

      // Actions column
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/products/${row.original.id}`}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              title="Xem chi tiết"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </Link>
            <Link
              href={`/products/${row.original.id}/edit`}
              className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
              title="Chỉnh sửa"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Link>
          </div>
        ),
        size: 100,
      }),
    ],
    [enableSelection]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: enableSelection,
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Không tìm thấy sản phẩm nào
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex cursor-pointer select-none items-center gap-2"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
            </span>{" "}
            -{" "}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>{" "}
            sản phẩm
          </span>
          {enableSelection && Object.keys(rowSelection).length > 0 && (
            <span className="ml-4 text-sm font-medium text-blue-600 dark:text-blue-400">
              ({Object.keys(rowSelection).filter((key) => rowSelection[key]).length} đã chọn)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Đầu
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Trước
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Trang{" "}
            <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span>{" "}
            / <span className="font-medium">{table.getPageCount()}</span>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Sau
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cuối
          </button>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {[10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize} / trang
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

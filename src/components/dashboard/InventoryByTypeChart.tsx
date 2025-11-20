"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useInventoryByType } from "@/hooks/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const TYPE_COLORS = {
  raw_material: "#3b82f6", // blue
  semi_finished: "#f59e0b", // amber
  finished: "#10b981", // green
  accessory: "#8b5cf6", // purple
  packaging: "#ec4899", // pink
  other: "#6b7280", // gray
};

export function InventoryByTypeChart() {
  const { data: inventoryTypes, isLoading } = useInventoryByType();

  // Prepare chart data
  const chartData: ApexOptions = React.useMemo(() => {
    if (!inventoryTypes || inventoryTypes.length === 0) {
      return {
        series: [],
        chart: { type: "bar", height: 350 },
      };
    }

    // Map type names to Vietnamese
    const typeNames: Record<string, string> = {
      raw_material: "Nguyên liệu",
      semi_finished: "Bán thành phẩm",
      finished: "Thành phẩm",
      accessory: "Phụ kiện",
      packaging: "Bao bì",
      other: "Khác",
    };

    const categories = inventoryTypes.map(
      (item) => typeNames[item.product_type] || item.product_type
    );

    const colors = inventoryTypes.map(
      (item) =>
        TYPE_COLORS[item.product_type as keyof typeof TYPE_COLORS] || TYPE_COLORS.other
    );

    return {
      series: [
        {
          name: "Số lượng",
          data: inventoryTypes.map((item) => item.total_quantity),
        },
      ],
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          columnWidth: "60%",
          distributed: true,
          dataLabels: {
            position: "top",
          },
        },
      },
      colors,
      dataLabels: {
        enabled: true,
        formatter: (val: number) => formatNumber(val),
        offsetY: -25,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: ["#374151"],
        },
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: "#6b7280",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => formatNumber(value),
          style: {
            colors: "#6b7280",
          },
        },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 5,
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        y: {
          formatter: (value, { seriesIndex, dataPointIndex }) => {
            const item = inventoryTypes[dataPointIndex];
            return `
              <div style="padding: 4px 0;">
                <div><strong>${formatNumber(value)}</strong> sản phẩm</div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 2px;">
                  Giá trị: ${formatCurrency(item.total_value)}
                </div>
              </div>
            `;
          },
        },
        theme: "light",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300,
            },
            plotOptions: {
              bar: {
                columnWidth: "70%",
              },
            },
          },
        },
      ],
    };
  }, [inventoryTypes]);

  // Calculate total stats
  const totalStats = React.useMemo(() => {
    if (!inventoryTypes || inventoryTypes.length === 0) {
      return { totalQuantity: 0, totalValue: 0 };
    }
    return {
      totalQuantity: inventoryTypes.reduce((sum, item) => sum + item.total_quantity, 0),
      totalValue: inventoryTypes.reduce((sum, item) => sum + item.total_value, 0),
    };
  }, [inventoryTypes]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tồn kho theo loại sản phẩm
        </h3>
        {inventoryTypes && inventoryTypes.length > 0 && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Tổng: {formatNumber(totalStats.totalQuantity)} sản phẩm •{" "}
            {formatCurrency(totalStats.totalValue)}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="relative">
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : inventoryTypes && inventoryTypes.length > 0 ? (
          <ReactApexChart
            options={chartData}
            series={chartData.series}
            type="bar"
            height={350}
          />
        ) : (
          <div className="flex h-[350px] items-center justify-center text-gray-500 dark:text-gray-400">
            Không có dữ liệu
          </div>
        )}
      </div>
    </div>
  );
}

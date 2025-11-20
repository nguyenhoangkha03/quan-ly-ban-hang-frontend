"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useRevenueChart } from "@/hooks/api";
import { formatCurrency } from "@/lib/utils";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type PeriodType = "day" | "week" | "month" | "year";

export function RevenueChart() {
  const [period, setPeriod] = useState<PeriodType>("month");
  const { data, isLoading } = useRevenueChart(period);

  // Prepare chart data
  const chartData: ApexOptions = React.useMemo(() => {
    if (!data) {
      return {
        series: [],
        chart: { type: "area", height: 350 },
      };
    }

    return {
      series: [
        {
          name: "Doanh thu",
          data: data.data.map((item) => item.revenue),
        },
      ],
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      colors: ["#3b82f6"],
      xaxis: {
        categories: data.data.map((item) => {
          const date = new Date(item.date);
          if (period === "day") {
            return date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });
        }),
        labels: {
          style: {
            colors: "#6b7280",
          },
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => {
            if (value >= 1000000000) {
              return `${(value / 1000000000).toFixed(1)}B`;
            }
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(0)}K`;
            }
            return value.toFixed(0);
          },
          style: {
            colors: "#6b7280",
          },
        },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 5,
      },
      tooltip: {
        y: {
          formatter: (value) => formatCurrency(value),
        },
        theme: "light",
      },
    };
  }, [data, period]);

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Biểu đồ doanh thu
          </h3>
          {data && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Tổng: {formatCurrency(data.total_revenue)} • {data.total_orders} đơn hàng
            </p>
          )}
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(["day", "week", "month", "year"] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {p === "day" && "Ngày"}
              {p === "week" && "Tuần"}
              {p === "month" && "Tháng"}
              {p === "year" && "Năm"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        ) : data && data.data.length > 0 ? (
          <ReactApexChart
            options={chartData}
            series={chartData.series}
            type="area"
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

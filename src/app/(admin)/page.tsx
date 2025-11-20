"use client";

import type { Metadata } from "next";
import React from "react";
import { useDashboardMetrics } from "@/hooks/api";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { LowStockAlertTable } from "@/components/dashboard/LowStockAlertTable";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
import { SalesChannelChart } from "@/components/dashboard/SalesChannelChart";
import { InventoryByTypeChart } from "@/components/dashboard/InventoryByTypeChart";
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tổng quan
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Theo dõi tình hình kinh doanh và vận hành hệ thống
        </p>
      </div>

      {/* Metrics Grid - 4 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Doanh thu hôm nay"
          value={metrics?.revenue_today || 0}
          type="currency"
          trend={
            metrics?.revenue_today_trend
              ? {
                  value: metrics.revenue_today_trend,
                  label: "so với hôm qua",
                }
              : undefined
          }
          icon={<DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          loading={metricsLoading}
        />

        <MetricCard
          title="Đơn hàng hôm nay"
          value={metrics?.orders_today || 0}
          type="number"
          trend={
            metrics?.orders_today_trend
              ? {
                  value: metrics.orders_today_trend,
                  label: "so với hôm qua",
                }
              : undefined
          }
          icon={<ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
          loading={metricsLoading}
        />

        <MetricCard
          title="Tổng giá trị tồn kho"
          value={metrics?.total_inventory_value || 0}
          type="currency"
          icon={<Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          loading={metricsLoading}
        />

        <MetricCard
          title="Công nợ cần thu"
          value={metrics?.total_debt || 0}
          type="currency"
          icon={<AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          loading={metricsLoading}
        />
      </div>

      {/* Revenue Chart - Full width */}
      <div className="grid grid-cols-1">
        <RevenueChart />
      </div>

      {/* Charts Row - 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChannelChart />
        <InventoryByTypeChart />
      </div>

      {/* Tables Row - 2 columns */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentOrdersTable />
        <TopProductsTable />
      </div>

      {/* Low Stock Alert - Full width */}
      <div className="grid grid-cols-1">
        <LowStockAlertTable />
      </div>
    </div>
  );
}

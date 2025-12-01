"use client";

import React from "react";
import { Package, CheckCircle, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WarehouseStatsData {
  totalWarehouses: number;
  activeWarehouses: number;
  createdThisMonth: number;
  totalInventoryValue: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const bgColors: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
  };

  const textColors: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div className={`rounded-full p-3 ${bgColors[color]}`}>
          <div className={textColors[color]}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

interface WarehouseStatsProps {
  data?: WarehouseStatsData;
  isLoading?: boolean;
}

export default function WarehouseStats({
  data,
  isLoading = false,
}: WarehouseStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<Package className="h-6 w-6" />}
        label="Tổng số kho"
        value={data.totalWarehouses}
        color="blue"
      />
      <StatCard
        icon={<CheckCircle className="h-6 w-6" />}
        label="Đang hoạt động"
        value={data.activeWarehouses}
        color="green"
      />
      <StatCard
        icon={<Calendar className="h-6 w-6" />}
        label="Tháng này"
        value={data.createdThisMonth}
        color="yellow"
      />
      <StatCard
        icon={<TrendingUp className="h-6 w-6" />}
        label="Tổng tồn kho"
        value={formatCurrency(data.totalInventoryValue)}
        color="purple"
      />
    </div>
  );
}

import React from "react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  prefix?: string; // "$", "₫", etc.
  suffix?: string; // "%", "đơn", etc.
  type?: "currency" | "number" | "custom";
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  iconBg?: string;
  loading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  prefix,
  suffix,
  type = "number",
  trend,
  icon,
  iconBg = "bg-blue-100 dark:bg-blue-900/30",
  loading = false,
  className,
}: MetricCardProps) {
  // Format value
  const formattedValue = React.useMemo(() => {
    if (loading) return "---";
    if (type === "custom") return value;
    if (type === "currency" && typeof value === "number") {
      return formatCurrency(value);
    }
    if (type === "number" && typeof value === "number") {
      return formatNumber(value);
    }
    return value;
  }, [value, type, loading]);

  const trendColor =
    trend && trend.value > 0
      ? "text-green-600 dark:text-green-400"
      : trend && trend.value < 0
      ? "text-red-600 dark:text-red-400"
      : "text-gray-600 dark:text-gray-400";

  return (
    <div
      className={cn(
        "rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800",
        loading && "animate-pulse",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline">
            {prefix && (
              <span className="mr-1 text-lg text-gray-600 dark:text-gray-400">
                {prefix}
              </span>
            )}
            <h3
              className={cn(
                "text-3xl font-bold text-gray-900 dark:text-white",
                loading && "h-9 w-24 rounded bg-gray-200 dark:bg-gray-700"
              )}
            >
              {!loading && formattedValue}
            </h3>
            {suffix && (
              <span className="ml-1 text-lg text-gray-600 dark:text-gray-400">
                {suffix}
              </span>
            )}
          </div>

          {/* Trend */}
          {trend && !loading && (
            <div className="mt-2 flex items-center gap-1">
              {trend.value > 0 ? (
                <ArrowUpIcon className={cn("h-4 w-4", trendColor)} />
              ) : trend.value < 0 ? (
                <ArrowDownIcon className={cn("h-4 w-4", trendColor)} />
              ) : null}
              <span className={cn("text-sm font-medium", trendColor)}>
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-lg",
              iconBg,
              loading && "animate-pulse"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

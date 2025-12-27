import React from "react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
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

  const trendBgColor =
    trend && trend.value > 0
      ? "bg-green-100 dark:bg-green-900/30"
      : trend && trend.value < 0
      ? "bg-red-100 dark:bg-red-900/30"
      : "bg-gray-100 dark:bg-gray-700/30";

  // Determine color scheme from iconBg
  const getColorScheme = () => {
    if (iconBg?.includes("blue")) return { border: "blue-500", text: "text-blue-600 dark:text-blue-400", glow: "bg-blue-500", gradient: "to-blue-50 dark:to-blue-950" };
    if (iconBg?.includes("green")) return { border: "green-500", text: "text-green-600 dark:text-green-400", glow: "bg-green-500", gradient: "to-green-50 dark:to-green-950" };
    if (iconBg?.includes("orange")) return { border: "orange-500", text: "text-orange-600 dark:text-orange-400", glow: "bg-orange-500", gradient: "to-orange-50 dark:to-orange-950" };
    if (iconBg?.includes("purple")) return { border: "purple-500", text: "text-purple-600 dark:text-purple-400", glow: "bg-purple-500", gradient: "to-purple-50 dark:to-purple-950" };
    return { border: "blue-500", text: "text-blue-600 dark:text-blue-400", glow: "bg-blue-500", gradient: "to-blue-50 dark:to-blue-950" };
  };

  const colors = getColorScheme();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:border-gray-800 dark:bg-gray-900",
        loading && "animate-pulse",
        className
      )}
    >
      {/* Glow Background Effect */}
      <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-0 opacity-10 group-hover:opacity-20 transition-opacity", colors.glow)} />

      <div className="relative z-10 flex flex-col items-start justify-between min-h-full">
        <div className="flex-1 w-full min-w-0">
          {/* Title */}
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>

          {/* Value */}
          <div className="mt-3 flex items-baseline gap-1 flex-wrap">
            {prefix && (
              <span className="text-lg font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                {prefix}
              </span>
            )}
            <h3
              className={cn(
                "font-bold transition-all line-clamp-1 break-words",
                "text-gray-900 dark:text-white",
                "text-xl sm:text-2xl lg:text-3xl",
                "group-hover:scale-110",
                loading && "h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-700"
              )}
              title={typeof formattedValue === 'string' ? formattedValue : undefined}
            >
              {!loading && formattedValue}
            </h3>
            {suffix && (
              <span className="text-base sm:text-lg font-semibold text-gray-500 dark:text-gray-400 ml-1 flex-shrink-0">
                {suffix}
              </span>
            )}
          </div>

          {/* Trend Indicator */}
          {trend && !loading && (
            <div className={cn(
              "mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5",
              trendBgColor
            )}>
              {trend.value > 0 ? (
                <ArrowUpRight className={cn("h-4 w-4", trendColor)} />
              ) : trend.value < 0 ? (
                <ArrowDownRight className={cn("h-4 w-4", trendColor)} />
              ) : null}
              <span className={cn("text-sm font-bold", trendColor)}>
                {trend.value > 0 ? "+" : ""}{Math.abs(trend.value).toFixed(2)}%
              </span>
              {trend.label && (
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {trend.label}
                </span>
              )}
            </div>
          )}

          {/* Bottom border line */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Tính toán theo kỳ
            </p>
          </div>
        </div>

        {/* Icon Section */}
        {icon && (
          <div className="mt-4 flex-shrink-0 self-end">
            <div className="relative">
              <div className={cn("absolute inset-0 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity", colors.glow)} />
              <div
                className={cn(
                  "relative border-2 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
                  `border-${colors.border}`,
                  colors.text,
                  loading && "animate-pulse"
                )}
              >
                <div className="scale-125 transition-transform duration-300">
                  {icon}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
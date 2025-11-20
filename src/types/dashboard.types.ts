/**
 * Dashboard Types
 */

// Dashboard Metrics
export interface DashboardMetrics {
  // Revenue metrics
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  revenue_growth_percent: number;

  // Orders metrics
  orders_today: number;
  orders_week: number;
  orders_month: number;
  orders_pending: number;
  orders_growth_percent: number;

  // Inventory metrics
  total_inventory_value: number;
  low_stock_items_count: number;
  out_of_stock_items_count: number;

  // Debt metrics
  total_debt: number;
  overdue_debt: number;
  customers_with_debt: number;

  // Production metrics
  production_orders_in_progress: number;
  production_orders_completed_this_month: number;
}

// Revenue Chart Data Point
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

// Revenue Chart Data
export interface RevenueChartData {
  period: "day" | "week" | "month" | "year";
  data: RevenueDataPoint[];
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
}

// Top Product
export interface TopProduct {
  product_id: number;
  product_name: string;
  sku: string;
  total_quantity: number;
  total_revenue: number;
  orders_count: number;
}

// Sales Channel Distribution
export interface SalesChannelData {
  channel: "store" | "online" | "phone" | "social_media" | "distributor";
  channel_name: string;
  orders_count: number;
  revenue: number;
  percentage: number;
}

// Inventory by Type
export interface InventoryByType {
  type: "raw_material" | "packaging" | "finished_product" | "goods";
  type_name: string;
  total_quantity: number;
  total_value: number;
  items_count: number;
}

// Recent Order for Dashboard
export interface RecentOrder {
  id: number;
  order_code: string;
  customer_name: string;
  order_date: string;
  total_amount: number;
  payment_status: "unpaid" | "partial" | "paid";
  status: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
}

// Low Stock Item
export interface LowStockItem {
  product_id: number;
  product_name: string;
  sku: string;
  warehouse_id: number;
  warehouse_name: string;
  current_quantity: number;
  min_stock_level: number;
  shortage: number;
  status: "low" | "out";
}

// Overdue Debt
export interface OverdueDebt {
  customer_id: number;
  customer_name: string;
  customer_code: string;
  total_debt: number;
  overdue_amount: number;
  days_overdue: number;
  phone?: string;
}

// Dashboard Data (Combined)
export interface DashboardData {
  metrics: DashboardMetrics;
  revenue_chart: RevenueChartData;
  top_products: TopProduct[];
  sales_channels: SalesChannelData[];
  inventory_by_type: InventoryByType[];
  recent_orders: RecentOrder[];
  low_stock_items: LowStockItem[];
  overdue_debts: OverdueDebt[];
}

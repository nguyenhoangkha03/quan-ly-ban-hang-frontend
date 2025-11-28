//----------------------------------------------
// Report Types & DTOs
//----------------------------------------------

/**
 * Report Group By Options
 */
export type ReportGroupBy = "day" | "week" | "month" | "year";

/**
 * Sales Channel Types
 */
export type SalesChannel = "retail" | "wholesale" | "online" | "distributor";

/**
 * Product Type (for inventory)
 */
export type ProductType =
  | "raw_material"
  | "packaging"
  | "finished_product"
  | "goods";

//----------------------------------------------
// Revenue Report Types
//----------------------------------------------

export interface RevenueReportFilters {
  fromDate?: string;
  toDate?: string;
  groupBy?: ReportGroupBy;
  salesChannel?: SalesChannel;
  customerId?: number;
}

export interface RevenueDataPoint {
  date: string; // ISO date or period label
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface RevenueByChannel {
  channel: SalesChannel;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface RevenueByRegion {
  region: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface RevenueReport {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    growth: number; // percentage compared to previous period
  };
  chartData: RevenueDataPoint[];
  byChannel: RevenueByChannel[];
  byRegion?: RevenueByRegion[];
}

//----------------------------------------------
// Inventory Report Types
//----------------------------------------------

export interface InventoryReportFilters {
  warehouseId?: number;
  categoryId?: number;
  productType?: ProductType;
  lowStock?: boolean;
}

export interface InventoryItem {
  productId: number;
  productCode: string;
  productName: string;
  category: string;
  warehouse: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  status: "normal" | "low" | "out_of_stock";
  value: number; // quantity * unit cost
}

export interface InventoryByType {
  type: ProductType;
  quantity: number;
  value: number;
  percentage: number;
}

export interface InventoryByWarehouse {
  warehouseId: number;
  warehouseName: string;
  totalQuantity: number;
  totalValue: number;
  itemCount: number;
}

export interface InventoryTurnover {
  productId: number;
  productName: string;
  turnoverRate: number; // times per period
  avgInventory: number;
  soldQuantity: number;
}

export interface InventoryReport {
  summary: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
  items: InventoryItem[];
  byType: InventoryByType[];
  byWarehouse: InventoryByWarehouse[];
  turnover?: InventoryTurnover[];
  slowMoving?: InventoryItem[];
}

//----------------------------------------------
// Sales Report Types
//----------------------------------------------

export interface SalesReportFilters {
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export interface TopProduct {
  productId: number;
  productCode: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  orderCount: number;
}

export interface TopCustomer {
  customerId: number;
  customerName: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface SalesByEmployee {
  employeeId: number;
  employeeName: string;
  ordersHandled: number;
  revenue: number;
  commission: number;
}

export interface SalesReport {
  summary: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
  };
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  byEmployee?: SalesByEmployee[];
}

//----------------------------------------------
// Production Report Types
//----------------------------------------------

export interface ProductionReportFilters {
  fromDate?: string;
  toDate?: string;
}

export interface ProductionOutput {
  productId: number;
  productName: string;
  plannedQuantity: number;
  producedQuantity: number;
  completionRate: number; // percentage
  wastage: number;
}

export interface MaterialConsumption {
  materialId: number;
  materialName: string;
  plannedQuantity: number;
  actualQuantity: number;
  variance: number; // actual - planned
  variancePercentage: number;
}

export interface WastageData {
  productId: number;
  productName: string;
  totalProduced: number;
  totalWastage: number;
  wastagePercentage: number;
  wastageValue: number; // cost of wastage
}

export interface ProductionReport {
  summary: {
    totalOrders: number;
    completedOrders: number;
    inProgressOrders: number;
    totalOutput: number;
    totalWastage: number;
    avgCompletionRate: number;
  };
  output: ProductionOutput[];
  materialConsumption: MaterialConsumption[];
  wastage: WastageData[];
}

//----------------------------------------------
// Financial Report Types
//----------------------------------------------

export interface FinancialReportFilters {
  fromDate?: string;
  toDate?: string;
}

export interface PLStatement {
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  grossMargin: number; // percentage
  netMargin: number; // percentage
}

export interface CashFlow {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}

export interface DebtAging {
  current: number; // 0-30 days
  days30: number; // 31-60 days
  days60: number; // 61-90 days
  days90Plus: number; // >90 days
  total: number;
}

export interface FinancialReport {
  summary: {
    revenue: number;
    profit: number;
    profitMargin: number;
    cashBalance: number;
    totalDebt: number;
    overdueDebt: number;
  };
  profitLoss: PLStatement;
  cashFlow: CashFlow;
  debtAging: DebtAging;
}

//----------------------------------------------
// Dashboard Types
//----------------------------------------------

export interface DashboardMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  newOrders: number;
  totalInventoryValue: number;
  accountsReceivable: number;
}

export interface DashboardSalesChannel {
  channel: SalesChannel;
  revenue: number;
  percentage: number;
}

export interface DashboardInventoryByType {
  type: ProductType;
  quantity: number;
  value: number;
}

//----------------------------------------------
// Export Types
//----------------------------------------------

export type ExportFormat = "excel" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  data: any;
  title?: string;
  subtitle?: string;
}

//----------------------------------------------
// Helper Labels
//----------------------------------------------

export const SALES_CHANNEL_LABELS: Record<SalesChannel, string> = {
  retail: "Bán lẻ",
  wholesale: "Bán sỉ",
  online: "Online",
  distributor: "Nhà phân phối",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  raw_material: "Nguyên liệu",
  packaging: "Bao bì",
  finished_product: "Thành phẩm",
  goods: "Hàng hóa",
};

export const GROUP_BY_LABELS: Record<ReportGroupBy, string> = {
  day: "Theo ngày",
  week: "Theo tuần",
  month: "Theo tháng",
  year: "Theo năm",
};

//----------------------------------------------
// Helper Functions
//----------------------------------------------

/**
 * Format currency in VND
 */
export function formatCurrencyVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("vi-VN").format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get default date range (last 30 days)
 */
export function getDefaultDateRange(): { fromDate: string; toDate: string } {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);

  return {
    fromDate: fromDate.toISOString().split("T")[0],
    toDate: toDate.toISOString().split("T")[0],
  };
}

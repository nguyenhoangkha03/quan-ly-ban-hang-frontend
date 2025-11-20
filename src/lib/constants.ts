/**
 * Application Constants
 */

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5000";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Quản Lý Bán Hàng & Sản Xuất";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

// Date Formats
export const DATE_FORMAT = "dd/MM/yyyy";
export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";
export const TIME_FORMAT = "HH:mm";

// Product Types
export const PRODUCT_TYPES = {
  RAW_MATERIAL: "raw_material",
  PACKAGING: "packaging",
  FINISHED_PRODUCT: "finished_product",
  GOODS: "goods",
} as const;

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  raw_material: "Nguyên liệu",
  packaging: "Bao bì",
  finished_product: "Thành phẩm",
  goods: "Hàng hóa",
};

// Packaging Types
export const PACKAGING_TYPES = {
  BOTTLE: "bottle",
  BOX: "box",
  BAG: "bag",
  LABEL: "label",
  OTHER: "other",
} as const;

export const PACKAGING_TYPE_LABELS: Record<string, string> = {
  bottle: "Chai/Lọ",
  box: "Hộp",
  bag: "Túi",
  label: "Nhãn",
  other: "Khác",
};

// Warehouse Types
export const WAREHOUSE_TYPES = {
  RAW_MATERIAL: "raw_material",
  PACKAGING: "packaging",
  FINISHED_PRODUCT: "finished_product",
  GOODS: "goods",
} as const;

export const WAREHOUSE_TYPE_LABELS: Record<string, string> = {
  raw_material: "Kho nguyên liệu",
  packaging: "Kho bao bì",
  finished_product: "Kho thành phẩm",
  goods: "Kho hàng hóa",
};

// Transaction Types
export const TRANSACTION_TYPES = {
  IMPORT: "import",
  EXPORT: "export",
  TRANSFER: "transfer",
  DISPOSAL: "disposal",
  STOCKTAKE: "stocktake",
} as const;

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  import: "Nhập kho",
  export: "Xuất kho",
  transfer: "Chuyển kho",
  disposal: "Xuất hủy",
  stocktake: "Kiểm kê",
};

// Customer Types
export const CUSTOMER_TYPES = {
  INDIVIDUAL: "individual",
  COMPANY: "company",
} as const;

export const CUSTOMER_TYPE_LABELS: Record<string, string> = {
  individual: "Cá nhân",
  company: "Công ty",
};

// Customer Classifications
export const CUSTOMER_CLASSIFICATIONS = {
  RETAIL: "retail",
  WHOLESALE: "wholesale",
  VIP: "vip",
  DISTRIBUTOR: "distributor",
} as const;

export const CUSTOMER_CLASSIFICATION_LABELS: Record<string, string> = {
  retail: "Bán lẻ",
  wholesale: "Bán sỉ",
  vip: "VIP",
  distributor: "Đại lý",
};

// Order Statuses
export const ORDER_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  approved: "Đã duyệt",
  in_progress: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
  CREDIT: "credit",
  COD: "cod",
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  bank_transfer: "Chuyển khoản",
  credit: "Trả góp/Ghi nợ",
  cod: "COD",
};

// Payment Statuses
export const PAYMENT_STATUSES = {
  UNPAID: "unpaid",
  PARTIAL: "partial",
  PAID: "paid",
} as const;

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Chưa thanh toán",
  partial: "Thanh toán một phần",
  paid: "Đã thanh toán",
};

// Roles
export const ROLES = {
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  WAREHOUSE_MANAGER: "warehouse_manager",
  WAREHOUSE_STAFF: "warehouse_staff",
  PRODUCTION_MANAGER: "production_manager",
  SALES_STAFF: "sales_staff",
  DELIVERY_STAFF: "delivery_staff",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: "Quản trị viên",
  accountant: "Kế toán",
  warehouse_manager: "Quản lý kho",
  warehouse_staff: "Nhân viên kho",
  production_manager: "Quản lý sản xuất",
  sales_staff: "Nhân viên bán hàng",
  delivery_staff: "Nhân viên giao hàng",
};

// Status
export const STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  LOCKED: "locked",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
  locked: "Đã khóa",
};

// Promotion Types
export const PROMOTION_TYPES = {
  PERCENT_DISCOUNT: "percent_discount",
  FIXED_DISCOUNT: "fixed_discount",
  BUY_X_GET_Y: "buy_x_get_y",
  GIFT: "gift",
} as const;

export const PROMOTION_TYPE_LABELS: Record<string, string> = {
  percent_discount: "Giảm giá %",
  fixed_discount: "Giảm giá cố định",
  buy_x_get_y: "Mua X tặng Y",
  gift: "Tặng quà",
};

// Tax Rates
export const TAX_RATES = [0, 5, 8, 10];

// Notification Types
export const NOTIFICATION_TYPES = {
  LOW_STOCK: "low_stock",
  EXPIRING_PRODUCT: "expiring_product",
  DEBT_OVERDUE: "debt_overdue",
  NEW_ORDER: "new_order",
  APPROVAL_REQUIRED: "approval_required",
  MATERIAL_SHORTAGE: "material_shortage",
  PRODUCTION_COMPLETED: "production_completed",
  SYSTEM: "system",
} as const;

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  low_stock: "Tồn kho thấp",
  expiring_product: "Sản phẩm sắp hết hạn",
  debt_overdue: "Công nợ quá hạn",
  new_order: "Đơn hàng mới",
  approval_required: "Cần phê duyệt",
  material_shortage: "Thiếu nguyên liệu",
  production_completed: "Hoàn thành sản xuất",
  system: "Thông báo hệ thống",
};

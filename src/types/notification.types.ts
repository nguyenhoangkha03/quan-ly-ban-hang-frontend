//----------------------------------------------
// Notification Types & DTOs
//----------------------------------------------

import { User } from "./user.types";

/**
 * Notification Type Enum
 */
export type NotificationType =
  | "system"
  | "low_stock"
  | "expiry_warning"
  | "debt_overdue"
  | "order_new"
  | "approval_required"
  | "reminder"
  | "announcement";

/**
 * Notification Priority Enum
 */
export type NotificationPriority = "low" | "normal" | "high";

/**
 * Notification Channel Enum
 */
export type NotificationChannel = "web" | "email" | "sms" | "mobile_app" | "all";

/**
 * Main Notification Entity
 */
export interface Notification {
  id: string | number; // BigInt from backend
  user_id: number;
  sender_id: number | null;
  title: string;
  message: string;
  notification_type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  reference_type: string | null;
  reference_id: number | null;
  meta_data: any | null;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  deleted_at: string | null;
  created_at: string;

  // Relations (populated by backend)
  user?: User;
  sender?: User;
}

/**
 * DTO for creating notification
 */
export interface CreateNotificationDto {
  userId: number;
  title: string;
  message: string;
  notificationType?: NotificationType;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  referenceType?: string;
  referenceId?: number;
  metaData?: any;
  expiresAt?: string;
}

/**
 * DTO for broadcasting notification
 */
export interface BroadcastNotificationDto {
  userIds?: number[];
  roleId?: number;
  title: string;
  message: string;
  notificationType?: NotificationType;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  referenceType?: string;
  referenceId?: number;
  metaData?: any;
}

/**
 * Notification Filters
 */
export interface NotificationFilters {
  isRead?: boolean;
  notificationType?: NotificationType;
  priority?: NotificationPriority;
  page?: number;
  limit?: number;
}

/**
 * Unread Count Response
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Socket.IO Notification Event
 */
export interface NotificationEvent {
  notification: Notification;
}

//----------------------------------------------
// Helper Constants & Labels
//----------------------------------------------

/**
 * Notification Type Labels (Vietnamese)
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  system: "Hệ thống",
  low_stock: "Hàng sắp hết",
  expiry_warning: "Hàng sắp hết hạn",
  debt_overdue: "Công nợ quá hạn",
  order_new: "Đơn hàng mới",
  approval_required: "Cần phê duyệt",
  reminder: "Nhắc nhở",
  announcement: "Thông báo",
};

/**
 * Notification Priority Labels (Vietnamese)
 */
export const NOTIFICATION_PRIORITY_LABELS: Record<
  NotificationPriority,
  string
> = {
  low: "Thấp",
  normal: "Trung bình",
  high: "Cao",
};

/**
 * Notification Type Icons (Heroicons)
 */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  system: "InformationCircleIcon",
  low_stock: "ArchiveBoxIcon",
  expiry_warning: "ExclamationTriangleIcon",
  debt_overdue: "CurrencyDollarIcon",
  order_new: "ShoppingCartIcon",
  approval_required: "CheckCircleIcon",
  reminder: "BellAlertIcon",
  announcement: "MegaphoneIcon",
};

/**
 * Notification Type Colors (TailwindCSS classes)
 */
export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, {
  bg: string;
  text: string;
  border: string;
  icon: string;
}> = {
  system: {
    bg: "bg-gray-100 dark:bg-gray-900/30",
    text: "text-gray-800 dark:text-gray-300",
    border: "border-gray-300 dark:border-gray-700",
    icon: "text-gray-600 dark:text-gray-400",
  },
  low_stock: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-300",
    border: "border-yellow-300 dark:border-yellow-700",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  expiry_warning: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-300",
    border: "border-orange-300 dark:border-orange-700",
    icon: "text-orange-600 dark:text-orange-400",
  },
  debt_overdue: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-300 dark:border-red-700",
    icon: "text-red-600 dark:text-red-400",
  },
  order_new: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    border: "border-green-300 dark:border-green-700",
    icon: "text-green-600 dark:text-green-400",
  },
  approval_required: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-800 dark:text-purple-300",
    border: "border-purple-300 dark:border-purple-700",
    icon: "text-purple-600 dark:text-purple-400",
  },
  reminder: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-300 dark:border-blue-700",
    icon: "text-blue-600 dark:text-blue-400",
  },
  announcement: {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-800 dark:text-indigo-300",
    border: "border-indigo-300 dark:border-indigo-700",
    icon: "text-indigo-600 dark:text-indigo-400",
  },
};

/**
 * Priority Colors (TailwindCSS classes)
 */
export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: "text-gray-500 dark:text-gray-400",
  normal: "text-blue-600 dark:text-blue-400",
  high: "text-red-600 dark:text-red-400",
};

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  // Format as DD/MM/YYYY HH:MM
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get notification link based on reference type
 */
export function getNotificationLink(notification: Notification): string | null {
  if (!notification.reference_type || !notification.reference_id) {
    return null;
  }

  const linkMap: Record<string, string> = {
    order: `/sales/orders/${notification.reference_id}`,
    product: `/products/${notification.reference_id}`,
    inventory: `/inventory`,
    customer: `/customers/${notification.reference_id}`,
    supplier: `/suppliers/${notification.reference_id}`,
    production_order: `/production/orders/${notification.reference_id}`,
    salary: `/hr/salary/${notification.reference_id}`,
    attendance: `/hr/attendance`,
    user: `/users/${notification.reference_id}`,
  };

  return linkMap[notification.reference_type] || null;
}

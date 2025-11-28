/**
 * Attendance Types
 * Chấm công nhân viên
 */

import type { BaseEntity, User } from "./common.types";

// Attendance Status
export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "leave"
  | "work_from_home";

// Leave Type
export type LeaveType = "none" | "annual" | "sick" | "unpaid" | "other";

/**
 * Attendance Entity
 */
export interface Attendance extends BaseEntity {
  user_id: number;
  user?: User;
  date: string; // DATE
  check_in_time?: string; // TIME
  check_out_time?: string; // TIME
  work_hours?: number; // DECIMAL(5,2) - Generated field
  overtime_hours?: number;
  status: AttendanceStatus;
  leave_type: LeaveType;
  check_in_location?: string;
  check_out_location?: string;
  approved_by?: number;
  approver?: User;
  approved_at?: string;
  notes?: string;
}

/**
 * Check In DTO
 */
export interface CheckInDto {
  location?: string; // GPS location
  notes?: string;
}

/**
 * Check Out DTO
 */
export interface CheckOutDto {
  location?: string; // GPS location
  notes?: string;
}

/**
 * Request Leave DTO
 */
export interface RequestLeaveDto {
  date: string;
  leave_type: Exclude<LeaveType, "none">;
  notes?: string;
}

/**
 * Update Attendance DTO
 */
export interface UpdateAttendanceDto {
  check_in_time?: string;
  check_out_time?: string;
  overtime_hours?: number;
  status?: AttendanceStatus;
  leave_type?: LeaveType;
  notes?: string;
}

/**
 * Approve Leave DTO
 */
export interface ApproveLeaveDto {
  approved: boolean;
  notes?: string;
}

/**
 * Attendance Filters
 */
export interface AttendanceFilters {
  userId?: number;
  fromDate?: string;
  toDate?: string;
  status?: AttendanceStatus;
  leaveType?: LeaveType;
  month?: string; // YYYY-MM
  year?: number;
  page?: number;
  limit?: number;
}

/**
 * Attendance Statistics
 */
export interface AttendanceStatistics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  workFromHomeDays: number;
  totalWorkHours: number;
  averageWorkHours: number;
  overtimeHours: number;
}

/**
 * Monthly Report
 */
export interface MonthlyReport {
  userId: number;
  user: User;
  month: string; // YYYY-MM
  statistics: AttendanceStatistics;
  attendances: Attendance[];
}

/**
 * Today Attendance Status
 * For Check-in/out widget
 */
export interface TodayAttendanceStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: number;
  status: AttendanceStatus;
}

/**
 * Helper Constants
 */
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Có mặt",
  absent: "Vắng mặt",
  late: "Đi muộn",
  leave: "Nghỉ phép",
  work_from_home: "WFH",
};

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  none: "Không phải nghỉ",
  annual: "Nghỉ phép năm",
  sick: "Nghỉ ốm",
  unpaid: "Nghỉ không lương",
  other: "Khác",
};

/**
 * Work hours configuration
 */
export const WORK_CONFIG = {
  STANDARD_HOURS: 8,
  LATE_THRESHOLD_MINUTES: 15, // Late if check-in after 15 minutes
  STANDARD_CHECK_IN: "08:00:00",
  STANDARD_CHECK_OUT: "17:00:00",
};

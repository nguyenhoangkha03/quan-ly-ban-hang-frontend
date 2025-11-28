"use client";

/**
 * Attendance List Page
 * Calendar view and list view for attendance records
 */

import React, { useState, useMemo } from "react";
import { useMyAttendance, useAttendance, useAttendanceStatistics } from "@/hooks/api/useAttendance";
import { useUsers } from "@/hooks/api/useUsers";
import { Can } from "@/components/auth";
import AttendanceCalendar from "@/components/features/attendance/AttendanceCalendar";
import AttendanceStatusBadge, {
  TimeDisplay,
  WorkHoursDisplay,
  LeaveTypeDisplay,
} from "@/components/features/attendance/AttendanceStatus";
import type { Attendance } from "@/types";
import {
  Calendar,
  List,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Home,
} from "lucide-react";

export default function AttendancePage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedUserId, setSelectedUserId] = useState<number | "me">("me");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch data
  const isMyView = selectedUserId === "me";
  const { data: myAttendanceData } = useMyAttendance({
    month: selectedMonth,
  });
  const { data: allAttendanceData } = useAttendance({
    userId: selectedUserId !== "me" ? selectedUserId : undefined,
    month: selectedMonth,
  });
  const { data: statisticsData } = useAttendanceStatistics({ month: selectedMonth });
  const { data: usersData } = useUsers({ status: "active" });

  const attendances = isMyView
    ? myAttendanceData?.data || []
    : allAttendanceData?.data || [];
  const statistics = statisticsData?.data;
  const users = usersData?.data || [];

  // Filter attendances by selected date if in list view
  const filteredAttendances = useMemo(() => {
    if (!selectedDate || viewMode !== "list") return attendances;
    return attendances.filter((att) => att.date === selectedDate);
  }, [attendances, selectedDate, viewMode]);

  const handleDateClick = (date: string, attendance?: Attendance) => {
    setSelectedDate(date);
    setViewMode("list");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chấm công
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quản lý và theo dõi chấm công nhân viên
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
          <button
            onClick={() => setViewMode("calendar")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Lịch
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <List className="h-4 w-4" />
            Danh sách
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                  <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày có mặt
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.presentDays}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                  <UserX className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày vắng
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.absentDays}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tổng giờ công
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.totalWorkHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  TB giờ/ngày
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {statistics.averageWorkHours.toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Month Selector */}
        <div className="flex-1">
          <label htmlFor="month" className="sr-only">
            Tháng
          </label>
          <input
            type="month"
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* User Selector (Admin only) */}
        <Can permission="view_attendance">
          <div className="flex-1">
            <label htmlFor="user" className="sr-only">
              Nhân viên
            </label>
            <select
              id="user"
              value={selectedUserId}
              onChange={(e) =>
                setSelectedUserId(e.target.value === "me" ? "me" : Number(e.target.value))
              }
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="me">Của tôi</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.employee_code})
                </option>
              ))}
            </select>
          </div>
        </Can>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <AttendanceCalendar
          attendances={attendances}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          onDateClick={handleDateClick}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          {selectedDate && (
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hiển thị dữ liệu cho ngày:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(selectedDate).toLocaleDateString("vi-VN")}
                </span>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="ml-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Xem tất cả
                </button>
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Giờ vào
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Giờ ra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Giờ công
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Loại nghỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {filteredAttendances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      Không có dữ liệu chấm công
                    </td>
                  </tr>
                ) : (
                  filteredAttendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {new Date(attendance.date).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <TimeDisplay time={attendance.check_in_time} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <TimeDisplay time={attendance.check_out_time} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <WorkHoursDisplay hours={attendance.work_hours} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <AttendanceStatusBadge status={attendance.status} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <LeaveTypeDisplay leaveType={attendance.leave_type} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {attendance.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

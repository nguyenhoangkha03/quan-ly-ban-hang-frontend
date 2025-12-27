"use client";

import React, { useState, useMemo } from "react";
import { useMyAttendance, useAttendance, useAttendanceStatistics } from "@/hooks/api/useAttendance";
import { useUsers } from "@/hooks/api/useUsers";
import { Can } from "@/components/auth";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import AttendanceMonthlyMatrix from "@/components/attendance/AttendanceMonthlyMatrix";
import DailyStatsCard from "@/components/attendance/DailyStatsCard";
import AttendanceApprovalsTab from "@/components/attendance/AttendanceApprovalsTab";
import AttendanceToolbar from "@/components/attendance/AttendanceToolbar";
import AttendanceStatusBadge, {
  TimeDisplay,
  WorkHoursDisplay,
  LeaveTypeDisplay,
} from "@/components/attendance/AttendanceStatus";
import type { Attendance, AttendanceStatistics, User } from "@/types";
import {
  Calendar,
  List,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Grid3x3,
  CheckCircle2,
} from "lucide-react";

export default function AttendancePage() {
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "matrix">("matrix");
  const [activeTab, setActiveTab] = useState<"overview" | "approvals">("overview");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedUserId, setSelectedUserId] = useState<number | "me">("me");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Fetch data
  const isMyView = selectedUserId === "me";
  const monthFormatted = selectedMonth.replace("-", ""); // YYYY-MM -> YYYYMM
  const { data: myAttendanceData } = useMyAttendance({
    month: monthFormatted,
  });
  const { data: allAttendanceData } = useAttendance({
    userId: selectedUserId !== "me" ? selectedUserId : undefined,
    month: monthFormatted,
  });
  const { data: statisticsData } = useAttendanceStatistics({ month: monthFormatted });
  const { data: usersData } = useUsers({ status: "active" });

  const attendancesWrapper = isMyView
    ? myAttendanceData?.data || []
    : allAttendanceData?.data || [];
  const attendances = attendancesWrapper as unknown as Attendance[];
  const statistics = statisticsData?.data as unknown as AttendanceStatistics;
  const users = usersData?.data as unknown as User[] || [];

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
            onClick={() => setViewMode("matrix")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === "matrix"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
            Bảng công
          </button>
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
          {/* Card 1: Ngày có mặt */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-green-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-green-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -z-0" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ngày Có Mặt
                </p>
                <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400 transition-all duration-300 group-hover:scale-110">
                  {statistics?.presentDays || 0}
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative border-2 border-green-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <UserCheck className="h-7 w-7 text-green-600 dark:text-green-400" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-900">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Nhân viên đã chấm công
              </p>
            </div>
          </div>

          {/* Card 2: Ngày vắng */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-red-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-red-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-0" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ngày Vắng
                </p>
                <p className="mt-3 text-3xl font-bold text-red-600 dark:text-red-400 transition-all duration-300 group-hover:scale-110">
                  {statistics?.absentDays || 0}
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative border-2 border-red-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <UserX className="h-7 w-7 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-900">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Nhân viên vắng mặt
              </p>
            </div>
          </div>

          {/* Card 3: Tổng giờ công */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-blue-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-0" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tổng Giờ Công
                </p>
                <p className="mt-3 text-3xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110">
                  {(statistics?.totalWorkHours || 0).toFixed(1)}h
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative border-2 border-blue-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <Clock className="h-7 w-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-900">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Tính trong kỳ
              </p>
            </div>
          </div>

          {/* Card 4: TB giờ/ngày */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-purple-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-purple-950">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-0" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  TB Giờ/Ngày
                </p>
                <p className="mt-3 text-3xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110">
                  {(statistics?.averageWorkHours || 0).toFixed(1)}h
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative border-2 border-purple-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                  <TrendingUp className="h-7 w-7 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-900">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Bình quân mỗi ngày
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Stats Card */}
      <DailyStatsCard 
        attendances={attendances} 
        users={users} 
        selectedDate={selectedDate || undefined} 
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "overview"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tổng quan
            </div>
          </button>
          <Can permission="approve_leave">
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "approvals"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Cần duyệt
              </div>
            </button>
          </Can>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
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
                      {user.fullName} ({user.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
            </Can>
          </div>

          {/* Toolbar */}
          <Can permission="view_attendance">
            <AttendanceToolbar 
              attendances={attendances}
              users={users}
              month={selectedMonth}
              onImport={(file) => {
                // TODO: Implement import functionality
                console.log("Import file:", file);
              }}
            />
          </Can>

          {/* Matrix View */}
          {viewMode === "matrix" && (
            <AttendanceMonthlyMatrix
              attendances={attendances}
              users={isMyView ? [{ id: 0, fullName: "Của tôi" } as User] : users}
              month={selectedMonth}
              onCellClick={(userId, date) => {
                setSelectedDate(date);
                setViewMode("list");
              }}
            />
          )}

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
                            <TimeDisplay time={attendance.checkInTime} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <TimeDisplay time={attendance.checkOutTime} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <WorkHoursDisplay hours={attendance.workHours} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <AttendanceStatusBadge status={attendance.status} />
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm">
                            <LeaveTypeDisplay leaveType={attendance.leaveType} />
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
      )}

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <AttendanceApprovalsTab attendances={attendances} users={users} />
      )}
    </div>
  );
}
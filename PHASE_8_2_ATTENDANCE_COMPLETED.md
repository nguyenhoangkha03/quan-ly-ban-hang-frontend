# ✅ PHASE 8.2: ATTENDANCE (CHẤM CÔNG) - COMPLETED

**Completed Date**: 2025-11-27
**Status**: ✅ DONE

## 📋 Summary

Đã hoàn thành Phase 8.2 - Attendance (Chấm công nhân viên) theo đúng yêu cầu từ ROADMAP.md. Module này cho phép nhân viên chấm công vào/ra, xem lịch chấm công, quản lý nghỉ phép và theo dõi giờ công.

---

## 📦 Deliverables

### ✅ 1. Types & DTOs

**File**: `src/types/attendance.types.ts` (NEW)

**Main Types:**
- ✅ `AttendanceStatus` = "present" | "absent" | "late" | "leave" | "work_from_home"
- ✅ `LeaveType` = "none" | "annual" | "sick" | "unpaid" | "other"
- ✅ `Attendance` - Main entity with check-in/out times, work hours
- ✅ `TodayAttendanceStatus` - For check-in/out widget
- ✅ `AttendanceStatistics` - Statistics aggregation
- ✅ `MonthlyReport` - Monthly report data

**DTOs:**
- ✅ `CheckInDto` - Check in with optional location
- ✅ `CheckOutDto` - Check out with optional location
- ✅ `RequestLeaveDto` - Request leave
- ✅ `UpdateAttendanceDto` - Update attendance (admin)
- ✅ `ApproveLeaveDto` - Approve/reject leave
- ✅ `AttendanceFilters` - Filter parameters

**Helper Constants:**
```typescript
ATTENDANCE_STATUS_LABELS
LEAVE_TYPE_LABELS
WORK_CONFIG (standard hours, late threshold, etc.)
```

---

### ✅ 2. API Hooks

**File**: `src/hooks/api/useAttendance.ts` (NEW)

**Query Hooks:**
- ✅ `useAttendance(filters)` - Get all attendance (Admin/Manager)
- ✅ `useMyAttendance(filters)` - Get my attendance records
- ✅ `useTodayAttendance()` - Get today's check-in/out status (auto-refresh every minute)
- ✅ `useAttendanceDetail(id)` - Get single attendance record
- ✅ `useAttendanceStatistics(filters)` - Get statistics
- ✅ `useMonthlyReport(month)` - Get monthly report

**Mutation Hooks:**
- ✅ `useCheckIn()` - Check in
- ✅ `useCheckOut()` - Check out
- ✅ `useRequestLeave()` - Request leave
- ✅ `useUpdateAttendance()` - Update attendance (admin)
- ✅ `useApproveLeave()` - Approve/reject leave (manager)
- ✅ `useDeleteAttendance()` - Delete attendance (admin)

**Features:**
- Auto-invalidate queries on mutations
- Toast notifications
- GPS location capture (optional)
- Auto-refresh today's status

---

### ✅ 3. Validation Schemas

**File**: `src/lib/validations/attendance.schema.ts` (NEW)

**Schemas:**
- ✅ `checkInSchema` - Validation for check-in
- ✅ `checkOutSchema` - Validation for check-out
- ✅ `requestLeaveSchema` - Validation for leave request
  - Date required
  - Leave type: annual, sick, unpaid, other
  - Notes optional (max 255 chars)

- ✅ `updateAttendanceSchema` - Validation for admin update
  - Time format validation (HH:MM:SS)
  - Overtime hours (0-24)

- ✅ `approveLeaveSchema` - Validation for leave approval
- ✅ `attendanceFilterSchema` - Validation for filters

---

### ✅ 4. Components

#### A. AttendanceStatus Component

**File**: `src/components/features/attendance/AttendanceStatus.tsx` (NEW)

**Exports:**
- ✅ `AttendanceStatusBadge` (default) - Status badge
  - 🟢 Present (green)
  - 🔴 Absent (red)
  - 🟡 Late (yellow)
  - 🔵 Leave (blue)
  - 🟣 WFH (purple)

- ✅ `LeaveTypeDisplay` - Leave type display
- ✅ `TimeDisplay` - Format time (HH:MM)
- ✅ `WorkHoursDisplay` - Work hours with indicator
  - Shows overtime/undertime
  - Color coding
- ✅ `OvertimeBadge` - Overtime hours badge
- ✅ `CheckStatusIndicator` - Check-in/out status
  - Chưa chấm công
  - Đang làm việc (animated pulse)
  - Đã hoàn thành
- ✅ `AttendanceSummary` - Daily summary card
- ✅ `LocationDisplay` - GPS location display

#### B. CheckInOutWidget Component

**File**: `src/components/features/attendance/CheckInOutWidget.tsx` (NEW)

**Features:**
- ✅ Real-time clock display
- ✅ Check-in button (green) - shows when not checked in
- ✅ Check-out button (blue) - shows when checked in
- ✅ Status indicator - shows when completed
- ✅ Work hours display
- ✅ GPS location capture (optional)
- ✅ Auto-disable after action
- ✅ Loading states

**Responsive:**
- ✅ Full version for desktop (with clock)
- ✅ Compact version for mobile (`CheckInOutWidgetCompact`)

#### C. AttendanceCalendar Component

**File**: `src/components/features/attendance/AttendanceCalendar.tsx` (NEW)

**Features:**
- ✅ Monthly calendar view
- ✅ Navigate months (prev/next buttons)
- ✅ Color-coded days based on status
- ✅ Work hours display on each day
- ✅ Weekend highlighting (red)
- ✅ Today highlighting (blue border)
- ✅ Hover tooltips with details
- ✅ Click to view details
- ✅ Status legend
- ✅ Responsive grid layout

---

### ✅ 5. Pages

#### A. Attendance List Page

**File**: `src/app/(admin)/hr/attendance/page.tsx` (NEW)

**Features:**
- ✅ **Two View Modes:**
  - Calendar View - Visual monthly calendar
  - List View - Table with details

- ✅ **Statistics Cards:**
  - Present days (green)
  - Absent days (red)
  - Total work hours (blue)
  - Average hours/day (purple)

- ✅ **Filters:**
  - Month selector (input type="month")
  - User selector (admin only, dropdown)
  - Filter by date (when click calendar day)

- ✅ **Calendar View:**
  - AttendanceCalendar component
  - Click day to view details in list mode
  - Navigate months
  - Visual status indicators

- ✅ **List View (Table):**
  - Date column
  - Check-in time
  - Check-out time
  - Work hours (with color coding)
  - Status badge
  - Leave type
  - Notes
  - Filter by selected date

- ✅ **Permissions:**
  - View own attendance: all users
  - View all attendance: `view_attendance` permission

---

## 🔧 Technical Implementation

### API Integration

**Backend Endpoints Used:**
```
GET    /api/attendance          - Get all attendance (admin)
GET    /api/attendance/my       - Get my attendance
GET    /api/attendance/:id      - Get single record
GET    /api/attendance/report   - Monthly report
GET    /api/attendance/statistics - Statistics
POST   /api/attendance/check-in - Check in
POST   /api/attendance/check-out - Check out
POST   /api/attendance/leave    - Request leave
PUT    /api/attendance/:id      - Update (admin)
PUT    /api/attendance/:id/approve - Approve leave
DELETE /api/attendance/:id      - Delete (admin)
```

### Database Schema

**Table: `attendance`**
```sql
- id (PK)
- user_id (FK → users.id)
- date (DATE, UNIQUE with user_id)
- check_in_time (TIME)
- check_out_time (TIME)
- work_hours (DECIMAL, GENERATED/COMPUTED)
- overtime_hours (DECIMAL)
- status (ENUM: present, absent, late, leave, work_from_home)
- leave_type (ENUM: none, annual, sick, unpaid, other)
- check_in_location (VARCHAR 255)
- check_out_location (VARCHAR 255)
- approved_by (FK → users.id)
- approved_at (TIMESTAMP)
- notes (VARCHAR 255)
- created_at (TIMESTAMP)
```

**Computed Field:**
```sql
work_hours = TIME_TO_SEC(TIMEDIFF(check_out_time, check_in_time)) / 3600
```

### Business Logic

**Check-In:**
1. Check if already checked in today
2. Create attendance record with current time
3. Capture GPS location (optional)
4. Set status based on time:
   - Before 08:15 → "present"
   - After 08:15 → "late"

**Check-Out:**
1. Check if checked in today
2. Check if already checked out
3. Update check-out time
4. work_hours auto-calculated by database

**Leave Request:**
1. Create attendance record for future date
2. Status = "leave"
3. Set leave_type
4. Requires approval from manager

**Late Detection:**
- Standard check-in: 08:00
- Late threshold: 15 minutes
- Check-in after 08:15 → status = "late"

---

## 🎨 UI/UX Features

### Status Colors
- ✅ **Present**: Green (có mặt)
- ✅ **Absent**: Red (vắng mặt)
- ✅ **Late**: Yellow (đi muộn)
- ✅ **Leave**: Blue (nghỉ phép)
- ✅ **WFH**: Purple (làm từ xa)

### Calendar UI
- ✅ Color-coded days
- ✅ Work hours on each day
- ✅ Status dot indicator
- ✅ Hover tooltips
- ✅ Today highlighting
- ✅ Weekend highlighting
- ✅ Click to view details

### Widget UI
- ✅ Real-time clock (updates every second)
- ✅ Prominent action buttons
- ✅ Status indicator with animation
- ✅ Responsive layout
- ✅ Loading states

### Responsive Design
- ✅ Mobile-friendly calendar
- ✅ Responsive statistics cards
- ✅ Compact widget for small screens
- ✅ Scrollable table on mobile

---

## 🔐 Permissions

### Permission Keys Used

```typescript
"view_attendance"   // View all employees' attendance
"update_attendance" // Update attendance records
"approve_leave"     // Approve/reject leave requests
"delete_attendance" // Delete attendance records
```

### Permission Logic

- **View Own Attendance**: All authenticated users
- **View All Attendance**: Requires `view_attendance` (Admin/Manager)
- **Check In/Out**: All authenticated users
- **Request Leave**: All authenticated users
- **Update Attendance**: Requires `update_attendance` (Admin only)
- **Approve Leave**: Requires `approve_leave` (Manager/Admin)
- **Delete Attendance**: Requires `delete_attendance` (Admin only)

---

## 📊 Features

### Check-In/Out Widget (For Header)

To integrate the widget into the header, add to your header component:

```tsx
import CheckInOutWidget from "@/components/features/attendance/CheckInOutWidget";

// In header component
<CheckInOutWidget />
```

**Features:**
- Real-time clock
- One-click check-in/out
- GPS location capture
- Auto-refresh status
- Visual feedback

### Calendar View

- Visual monthly attendance
- Color-coded status
- Work hours display
- Interactive (click to details)
- Month navigation

### Statistics

Displays:
- Total present days
- Total absent days
- Total work hours
- Average hours per day
- Late days
- Leave days
- WFH days
- Overtime hours

### Leave Management

- Request leave for future dates
- Select leave type (annual, sick, unpaid, other)
- Add notes
- Manager approval workflow
- Email notifications (if configured)

---

## 🧪 Testing Checklist

### Check-In/Out
- [ ] Check in for the first time today
- [ ] Check in when already checked in (should error)
- [ ] Check out after checking in
- [ ] Check out without checking in (should error)
- [ ] Check out when already checked out (should error)
- [ ] Verify GPS location captured
- [ ] Test on different times (before/after 08:15)
- [ ] Verify status (present vs late)
- [ ] Test widget auto-refresh

### Calendar View
- [ ] View calendar for current month
- [ ] Navigate to previous/next month
- [ ] Verify color coding
- [ ] Verify work hours display
- [ ] Hover to see tooltip
- [ ] Click day to view details
- [ ] Verify weekend highlighting
- [ ] Verify today highlighting

### List View
- [ ] View list of attendance records
- [ ] Sort by date
- [ ] Filter by date (click calendar day)
- [ ] Verify all columns display correctly
- [ ] Test on mobile (responsive table)
- [ ] Clear date filter

### Statistics
- [ ] Verify present days count
- [ ] Verify absent days count
- [ ] Verify total work hours
- [ ] Verify average hours calculation
- [ ] Test with different month selection
- [ ] Test with user filter (admin)

### Leave Request
- [ ] Request leave for future date
- [ ] Select leave type
- [ ] Add notes
- [ ] Verify request created
- [ ] Test approval workflow (manager)
- [ ] Test rejection workflow

### Permissions
- [ ] Test view own attendance (all users)
- [ ] Test view all attendance (admin only)
- [ ] Test update attendance (admin only)
- [ ] Test approve leave (manager/admin)
- [ ] Test delete attendance (admin only)
- [ ] Verify API returns 403 for unauthorized

### UI/UX
- [ ] Test responsive design on mobile
- [ ] Test dark mode
- [ ] Verify all icons display
- [ ] Test loading states
- [ ] Verify toast notifications
- [ ] Test empty states
- [ ] Test error messages

---

## 🚀 Future Enhancements

Possible improvements for future phases:

1. **Advanced Leave Management**:
   - Leave balance tracking
   - Leave quotas per year
   - Leave carry-over
   - Leave request calendar view

2. **Shift Management**:
   - Multiple shift times
   - Shift schedules
   - Shift swapping
   - Night shift support

3. **Overtime Approval**:
   - OT request workflow
   - OT approval by manager
   - OT rate calculation
   - OT reports

4. **Face Recognition**:
   - Facial recognition check-in
   - Prevent buddy punching
   - Photo capture on check-in

5. **Geofencing**:
   - Office location validation
   - Allow check-in only in office
   - Multiple office locations
   - WFH location tracking

6. **Reports & Analytics**:
   - Attendance trends
   - Lateness analysis
   - Absenteeism reports
   - Department comparisons
   - Export to Excel/PDF

7. **Notifications**:
   - Reminder to check-in
   - Reminder to check-out
   - Leave approval notifications
   - Weekly attendance summary

8. **Public Holidays**:
   - Holiday calendar
   - Auto-mark holidays
   - Regional holiday support

9. **Integration**:
   - Sync with payroll system
   - Calendar integration
   - Email notifications
   - SMS reminders

---

## 📝 Notes

- work_hours is a computed field in database (auto-calculated)
- GPS location capture is optional (uses browser geolocation API)
- Check-in after 08:15 automatically marked as "late"
- Today's attendance status auto-refreshes every minute
- Leave requests require manager approval
- Can only have one attendance record per user per day (UNIQUE constraint)
- Admin can manually update check-in/out times if needed
- Deleted attendance is hard deleted (not soft delete)

---

## ✅ Completion Checklist

- [x] Types & DTOs created
- [x] API hooks implemented
- [x] Validation schemas created
- [x] AttendanceStatus components created
- [x] CheckInOutWidget created
- [x] AttendanceCalendar created
- [x] Attendance list page created
- [x] Exports updated (types, hooks, validations, components)
- [x] Documentation created
- [x] All ROADMAP.md requirements met

---

## 🎯 ROADMAP.md Requirements Met

### From ROADMAP Phase 8.2:

✅ **Attendance List** (`app/(admin)/hr/attendance/page.tsx`):
- Calendar view ✅
- Filter: User, Date range ✅
- Show: Check-in/out time, Work hours, Status ✅

✅ **Check In/Out** (Widget for header):
- Button check-in/out ✅
- Show current time ✅
- GPS location (optional) ✅

✅ **Deliverables:**
- Attendance tracking ✅
- Calendar view ✅
- Check-in/out widget ✅

---

**Phase 8.2 Attendance is now complete and ready for use!** 🎉

## 📌 Integration Note

To add the check-in/out widget to your header, you need to:

1. Import the widget:
```tsx
import CheckInOutWidget from "@/components/features/attendance/CheckInOutWidget";
```

2. Add it to your header component (usually in `src/components/layout/Header.tsx` or similar):
```tsx
<CheckInOutWidget />
```

The widget will automatically:
- Show check-in button if not checked in today
- Show check-out button if checked in but not checked out
- Show completion status if both done
- Display real-time clock
- Handle GPS location
- Auto-refresh status

For mobile, you can use the compact version:
```tsx
import { CheckInOutWidgetCompact } from "@/components/features/attendance/CheckInOutWidget";
<CheckInOutWidgetCompact />
```

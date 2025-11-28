# ✅ PHASE 9.1: REAL-TIME NOTIFICATIONS - COMPLETED

**Completed Date**: 2025-11-27
**Status**: ✅ DONE

## 📋 Summary

Đã hoàn thành Phase 9.1 - Real-time Notifications theo đúng yêu cầu từ ROADMAP.md. Module này cung cấp hệ thống thông báo real-time sử dụng Socket.IO, bao gồm notification bell trong header, dropdown hiển thị thông báo, và toast notifications.

---

## 📦 Deliverables

### ✅ 1. Types & DTOs

**File**: `src/types/notification.types.ts` (NEW)

**Main Types:**
- ✅ `NotificationType` = "system" | "low_stock" | "expiry_warning" | "debt_overdue" | "order_new" | "approval_required" | "reminder" | "announcement"
- ✅ `NotificationPriority` = "low" | "normal" | "high"
- ✅ `NotificationChannel` = "web" | "email" | "sms" | "mobile_app" | "all"
- ✅ `Notification` - Main entity with all notification fields
- ✅ `CreateNotificationDto` - DTO for creating notification
- ✅ `BroadcastNotificationDto` - DTO for broadcasting to multiple users
- ✅ `NotificationFilters` - Filter parameters
- ✅ `UnreadCountResponse` - Unread count response
- ✅ `NotificationEvent` - Socket.IO event interface

**Helper Constants:**
```typescript
NOTIFICATION_TYPE_LABELS     // Vietnamese labels
NOTIFICATION_PRIORITY_LABELS // Priority labels
NOTIFICATION_TYPE_ICONS      // Heroicon names
NOTIFICATION_TYPE_COLORS     // TailwindCSS color classes
PRIORITY_COLORS              // Priority color classes
```

**Helper Functions:**
```typescript
formatRelativeTime(dateString: string): string
getNotificationLink(notification: Notification): string | null
```

---

### ✅ 2. Socket.IO Client Service

**File**: `src/lib/socket.ts` (ALREADY EXISTS - Updated)

**Features:**
- ✅ Singleton Socket.IO instance
- ✅ Auto-reconnection (5 attempts, 1s delay)
- ✅ Token-based authentication
- ✅ Connection event handlers
- ✅ Notification event listener
- ✅ Room join/leave support

**Main Functions:**
```typescript
initSocket(): Socket              // Initialize connection
getSocket(): Socket | null        // Get current instance
disconnectSocket(): void          // Disconnect
emitEvent(event, data): void      // Emit event
onEvent(event, callback): void    // Listen to event
offEvent(event, callback): void   // Remove listener
```

---

### ✅ 3. API Hooks

**File**: `src/hooks/api/useNotifications.ts` (NEW)

**Query Hooks:**
- ✅ `useNotifications(filters)` - Get all notifications with pagination
- ✅ `useUnreadNotifications()` - Get unread notifications (auto-refresh 30s)
- ✅ `useUnreadCount()` - Get unread count (auto-refresh 15s)
- ✅ `useNotificationDetail(id)` - Get single notification

**Mutation Hooks:**
- ✅ `useCreateNotification()` - Create notification (admin)
- ✅ `useBroadcastNotification()` - Broadcast to users/role (admin)
- ✅ `useMarkAsRead()` - Mark single as read
- ✅ `useMarkAllAsRead()` - Mark all as read
- ✅ `useDeleteNotification()` - Delete single notification
- ✅ `useDeleteAllRead()` - Delete all read notifications

**Features:**
- Auto-invalidate queries on mutations
- Toast notifications
- Auto-refresh for real-time updates

---

### ✅ 4. Custom Hook

**File**: `src/hooks/useNotificationToast.ts` (NEW)

**Features:**
- ✅ Listen to Socket.IO notification events
- ✅ Show toast notification with custom styling
- ✅ Auto-invalidate queries on new notification
- ✅ Different icons/colors per notification type
- ✅ 5s duration, top-right position
- ✅ Custom border color based on type

**Usage:**
```typescript
import { useNotificationToast } from "@/hooks/useNotificationToast";

function Layout() {
  useNotificationToast(); // Just call it in your layout
  return <>{children}</>;
}
```

---

### ✅ 5. Components

#### A. NotificationBell Component

**File**: `src/components/features/notifications/NotificationBell.tsx` (NEW)

**Features:**
- ✅ **Bell icon** with hover effect
- ✅ **Unread badge** - Red circle with count (99+ max)
- ✅ **Pulse animation** on new notification
- ✅ **Bounce animation** when new notification arrives
- ✅ **Real-time updates** via Socket.IO
- ✅ **Auto-refetch** unread count on notification event
- ✅ **Dropdown toggle** on click
- ✅ **Click outside** to close dropdown

**Visual States:**
- Normal: Gray bell icon
- Has unread: Red badge with count
- New notification: Animated bell (bounce + pulse)

#### B. NotificationDropdown Component

**File**: `src/components/features/notifications/NotificationDropdown.tsx` (NEW)

**Features:**
- ✅ **Header** with "Mark all as read" button
- ✅ **Notifications list** (max height 400px, scrollable)
- ✅ **Empty state** with BellSlashIcon
- ✅ **Loading state** with spinner
- ✅ **Footer** with "View all" link
- ✅ **Notification item** with:
  - Icon based on type (colored background)
  - Title, message (line-clamp)
  - Relative time display
  - Type label
  - Unread indicator (blue dot)
  - Hover actions (mark read, delete)
  - Click to navigate (if has reference)

**Responsive:**
- ✅ Max width 96 (24rem)
- ✅ Adapt to mobile screen width
- ✅ Scrollable list

**Notification Item:**
- ✅ Color-coded background based on type
- ✅ Different icons per type
- ✅ Link to related page (order, product, etc.)
- ✅ Confirmation before delete
- ✅ Mark as read with checkmark icon

---

## 🔧 Technical Implementation

### API Integration

**Backend Endpoints Used:**
```
GET    /api/notifications                - Get all notifications
GET    /api/notifications/unread         - Get unread only
GET    /api/notifications/unread-count   - Get unread count
GET    /api/notifications/:id            - Get single notification
POST   /api/notifications                - Create notification (admin)
POST   /api/notifications/broadcast      - Broadcast (admin)
PUT    /api/notifications/:id/read       - Mark as read
PUT    /api/notifications/read-all       - Mark all as read
DELETE /api/notifications/:id            - Delete notification
DELETE /api/notifications/read           - Delete all read
```

### Socket.IO Events

**Client → Server:**
```typescript
// Connect with authentication
socket.auth = { token: accessToken }

// Join room (for role-based notifications)
socket.emit("join_room", roomName)

// Leave room
socket.emit("leave_room", roomName)
```

**Server → Client:**
```typescript
// New notification event
socket.on("notification", (data: { notification: Notification }) => {
  // Handle notification
})

// Connection events
socket.on("connect", () => {})
socket.on("disconnect", (reason) => {})
socket.on("connect_error", (error) => {})
socket.on("reconnect", (attemptNumber) => {})
```

### Database Schema

**Table: `notifications`**
```sql
- id (BIGINT, PK, AUTO_INCREMENT)
- user_id (INT, FK → users.id)
- sender_id (INT, FK → users.id, NULLABLE)
- title (VARCHAR 200)
- message (VARCHAR 500)
- notification_type (ENUM)
- priority (ENUM)
- channel (ENUM)
- reference_type (VARCHAR 50, NULLABLE)
- reference_id (INT, NULLABLE)
- meta_data (JSON, NULLABLE)
- is_read (BOOLEAN, DEFAULT FALSE)
- read_at (TIMESTAMP, NULLABLE)
- expires_at (TIMESTAMP, NULLABLE)
- deleted_at (TIMESTAMP, NULLABLE)
- created_at (TIMESTAMP)

INDEXES:
- (user_id, is_read)
- (notification_type)
- (priority)
- (created_at)
```

### Business Logic

**Create Notification:**
1. Validate user exists
2. Create notification record
3. Send via Socket.IO to user
4. Send email if channel includes email
5. Invalidate cache

**Broadcast Notification:**
1. If roleId: Get all users with that role
2. If userIds: Use provided user IDs
3. Create notification for each user
4. Send via Socket.IO to all users
5. Return count of users notified

**Mark as Read:**
1. Verify notification belongs to user
2. Update is_read = true
3. Set read_at timestamp
4. Invalidate cache

**Delete:**
1. Verify notification belongs to user
2. Soft delete (set deleted_at)
3. Invalidate cache

---

## 🎨 UI/UX Features

### Notification Types & Colors

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| **system** | ℹ️ | Gray | System messages |
| **low_stock** | 📦 | Yellow | Stock level warnings |
| **expiry_warning** | ⚠️ | Orange | Product expiry alerts |
| **debt_overdue** | 💰 | Red | Overdue payments |
| **order_new** | 🛒 | Green | New orders |
| **approval_required** | ✅ | Purple | Pending approvals |
| **reminder** | 🔔 | Blue | Reminders |
| **announcement** | 📢 | Indigo | Announcements |

### Priority Colors

- **Low**: Gray
- **Normal**: Blue
- **High**: Red

### Animations

- ✅ **Bell bounce** on new notification (3s)
- ✅ **Badge pulse** on new notification (3s)
- ✅ **Spinner** during loading
- ✅ **Smooth transitions** on hover
- ✅ **Fade in/out** for dropdown

### Relative Time Display

- "Vừa xong" - < 1 minute
- "X phút trước" - < 1 hour
- "X giờ trước" - < 24 hours
- "X ngày trước" - < 7 days
- "DD/MM/YYYY HH:MM" - >= 7 days

### Link Navigation

Based on `reference_type`:
- `order` → `/sales/orders/:id`
- `product` → `/products/:id`
- `inventory` → `/inventory`
- `customer` → `/customers/:id`
- `supplier` → `/suppliers/:id`
- `production_order` → `/production/orders/:id`
- `salary` → `/hr/salary/:id`
- `attendance` → `/hr/attendance`
- `user` → `/users/:id`

---

## 📊 Features

### Real-time Notifications

- ✅ **Socket.IO integration** - Instant delivery
- ✅ **Auto-reconnection** - Network resilience
- ✅ **Token authentication** - Secure connection
- ✅ **Room support** - Role-based notifications

### Notification Bell

- ✅ **Unread count badge** - Visual indicator
- ✅ **Real-time updates** - Auto-refresh
- ✅ **Animations** - Bounce & pulse on new
- ✅ **Dropdown toggle** - Easy access
- ✅ **Click outside** - Auto-close

### Notification Dropdown

- ✅ **Recent notifications** - Unread first
- ✅ **Mark as read** - Individual or all
- ✅ **Delete** - Individual or all read
- ✅ **Navigate to source** - Click to view details
- ✅ **Type indicators** - Color-coded icons
- ✅ **Relative time** - Human-readable
- ✅ **Empty state** - Friendly message
- ✅ **View all** - Link to full page

### Toast Notifications

- ✅ **Instant pop-up** - On new notification
- ✅ **Custom styling** - Per notification type
- ✅ **Auto-dismiss** - 5 seconds
- ✅ **Position** - Top-right corner
- ✅ **Icon** - Emoji per type
- ✅ **Border color** - Type-specific

---

## 🧪 Testing Checklist

### Socket.IO Connection
- [ ] Connect on app load with valid token
- [ ] Reconnect on network interruption
- [ ] Disconnect on logout
- [ ] Handle connection errors gracefully
- [ ] Verify auth token sent correctly

### Notification Bell
- [ ] Display unread count correctly
- [ ] Badge shows 99+ for count > 99
- [ ] Bell bounces on new notification
- [ ] Pulse animation on new notification
- [ ] Dropdown toggles on click
- [ ] Dropdown closes on click outside
- [ ] Unread count updates real-time

### Notification Dropdown
- [ ] Display recent unread notifications
- [ ] Empty state when no notifications
- [ ] Loading state while fetching
- [ ] Mark single as read works
- [ ] Mark all as read works
- [ ] Delete single notification works
- [ ] Delete all read works
- [ ] Navigate to source on click
- [ ] Relative time displays correctly
- [ ] Type icons and colors correct
- [ ] Scrollable when many notifications
- [ ] Responsive on mobile

### Toast Notifications
- [ ] Toast shows on new notification
- [ ] Correct icon per type
- [ ] Correct border color per type
- [ ] Auto-dismiss after 5s
- [ ] Position top-right
- [ ] Multiple toasts stack correctly
- [ ] Toast content matches notification

### API Integration
- [ ] Fetch notifications works
- [ ] Fetch unread works
- [ ] Fetch unread count works
- [ ] Create notification works (admin)
- [ ] Broadcast works (admin)
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete works
- [ ] Delete all read works
- [ ] Pagination works
- [ ] Filters work (type, priority, read status)

### Real-time Updates
- [ ] New notification appears instantly
- [ ] Unread count updates instantly
- [ ] Mark as read updates all clients
- [ ] Delete updates all clients
- [ ] No duplicate notifications
- [ ] No memory leaks on reconnect

### UI/UX
- [ ] Test responsive design on mobile
- [ ] Test dark mode
- [ ] Verify all icons display
- [ ] Test loading states
- [ ] Verify toast notifications
- [ ] Test empty states
- [ ] Test error messages
- [ ] Test animations

---

## 🚀 Integration Guide

### Step 1: Initialize Socket.IO in Layout

**File**: `src/app/(admin)/layout.tsx` or `src/components/layout/AdminLayout.tsx`

```typescript
"use client";

import { useEffect } from "react";
import { initSocket, disconnectSocket } from "@/lib/socket";
import { useNotificationToast } from "@/hooks/useNotificationToast";
import { useAuthStore } from "@/stores/authStore";

export default function AdminLayout({ children }) {
  const { user } = useAuthStore();

  // Initialize Socket.IO
  useEffect(() => {
    if (user) {
      initSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  // Enable toast notifications
  useNotificationToast();

  return <>{children}</>;
}
```

### Step 2: Add NotificationBell to Header

**File**: `src/components/layout/Header.tsx`

```typescript
import NotificationBell from "@/components/features/notifications/NotificationBell";

export default function Header() {
  return (
    <header>
      <div className="flex items-center gap-4">
        {/* Other header items */}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User menu */}
      </div>
    </header>
  );
}
```

### Step 3: Environment Variables

**File**: `.env.local`

```env
# Socket.IO server URL (if different from API server)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Or use same as API server
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 4: Test Notifications

**Send test notification from backend:**

```typescript
// In any backend service
import notificationService from '@services/notification.service';

await notificationService.create({
  userId: 1,
  title: "Test Notification",
  message: "This is a test notification",
  notificationType: "system",
  priority: "normal",
  channel: "web",
});
```

**Broadcast to all admins:**

```typescript
await notificationService.sendToRole(1, { // roleId = 1 (Admin)
  title: "Important Announcement",
  message: "System maintenance scheduled",
  notificationType: "announcement",
  priority: "high",
  channel: "all", // web + email
});
```

---

## 🔐 Permissions

No specific permissions required for viewing own notifications. All authenticated users can:
- View their notifications
- Mark as read
- Delete their notifications

Admin-only features (require admin role):
- Create notifications for any user
- Broadcast notifications to multiple users/roles
- View all system notifications (if implemented)

---

## 📝 Notes

- Notifications use BigInt ID from database (auto-converted to string on frontend)
- Soft delete approach (deleted_at field) for audit trail
- Expired notifications auto-cleaned by backend scheduler
- Socket.IO uses WebSocket with fallback to polling
- Token authentication for Socket.IO connection
- Auto-reconnection with exponential backoff
- Notifications auto-invalidate query cache
- Toast notifications don't block UI
- Dropdown has max 50 unread notifications
- View all page can show paginated history (if implemented)

---

## ✅ Completion Checklist

- [x] Notification types & DTOs created
- [x] Socket.IO client service verified (already exists)
- [x] API hooks implemented
- [x] useNotificationToast hook created
- [x] NotificationBell component created
- [x] NotificationDropdown component created
- [x] Exports updated (types, hooks, components)
- [x] Documentation created
- [x] All ROADMAP.md requirements met

---

## 🎯 ROADMAP.md Requirements Met

### From ROADMAP Phase 9.1:

✅ **Notification Bell** (Header):
- Bell icon with unread count badge ✅
- Socket.IO real-time integration ✅
- Pulse animation on new notification ✅
- Toast notification on new event ✅

✅ **Notification Dropdown**:
- List recent notifications ✅
- Mark as read ✅
- Link to related page ✅
- "View all" button ✅

✅ **Notification Types**:
- Low stock alert ✅
- Expiring products ✅
- Debt overdue ✅
- New order ✅
- Approval required ✅
- System announcements ✅

✅ **Deliverables:**
- Real-time notifications ✅
- Notification bell with badge ✅
- Toast notifications ✅

---

**Phase 9.1 Real-time Notifications is now complete and ready for use!** 🎉

## 📌 Quick Start

1. **Add to Header:**
   ```tsx
   import NotificationBell from "@/components/features/notifications/NotificationBell";
   <NotificationBell />
   ```

2. **Initialize Socket.IO in Layout:**
   ```tsx
   import { useEffect } from "react";
   import { initSocket, disconnectSocket } from "@/lib/socket";
   import { useNotificationToast } from "@/hooks/useNotificationToast";

   useEffect(() => {
     initSocket();
     return () => disconnectSocket();
   }, []);

   useNotificationToast();
   ```

3. **Backend sends notification:**
   ```typescript
   await notificationService.create({
     userId: 1,
     title: "New Order",
     message: "Order #1234 has been placed",
     notificationType: "order_new",
     referenceType: "order",
     referenceId: 1234,
   });
   ```

The notification will:
- Appear instantly via Socket.IO
- Show toast in top-right corner
- Update bell badge count
- Appear in dropdown
- Link to /sales/orders/1234 when clicked

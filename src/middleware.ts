import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Middleware - Route Protection
 * Chạy trước mỗi request để kiểm tra authentication
 */

// Routes không cần authentication
const publicRoutes = ["/login", "/signup", "/forgot-password", "/reset-password", "/error-404"];

// Routes chỉ dành cho guest (đã login thì không vào được)
const guestOnlyRoutes = ["/login", "/signup"];

// Routes cần authentication
const protectedRoutes = [
  "/",
  "/dashboard",
  "/products",
  "/inventory",
  "/warehouses",
  "/production",
  "/sales",
  "/customers",
  "/finance",
  "/users",
  "/reports",
  "/settings",
  "/profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy auth token từ cookie hoặc localStorage (qua header)
  // Note: localStorage không accessible trong middleware, nên dùng cookie
  const token = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!token;

  // Check nếu là public route
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isGuestOnlyRoute = guestOnlyRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Nếu đã login mà vào guest-only route (login, signup) -> redirect về dashboard
  if (isAuthenticated && isGuestOnlyRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Nếu chưa login mà vào protected route -> redirect về login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    // Lưu redirect URL để sau khi login thì quay lại
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cho phép request tiếp tục
  return NextResponse.next();
}

/**
 * Config matcher - Chỉ chạy middleware cho những routes này
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
};

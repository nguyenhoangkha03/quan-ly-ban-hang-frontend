import { ProductionOrder, User, UserStatus, Attendance, Product } from "@/types";
import { format } from "date-fns";
import { PRODUCTION_STATUS_LABELS } from "./constants";
import * as XLSX from "xlsx";

const getGenderLabel = (gender?: "male" | "female" | "other") => {
  if (!gender) return "—";
  const labels = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };
  return labels[gender];
};

const getStatusLabel = (status: UserStatus) => {
  const labels: Record<UserStatus, string> = {
    active: "Hoạt động",
    inactive: "Ngưng hoạt động",
    locked: "Bị khóa",
  };
  return labels[status];
};

export const handleExportExcel = (productionOrders: ProductionOrder[]) => {
  if (productionOrders && productionOrders.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  const exportData = productionOrders.map((order) => ({
    "Mã lệnh": order.orderCode,
    "Sản phẩm": order.finishedProduct?.productName || "",
    "SKU": order.finishedProduct?.sku || "",
    "BOM": order.bom?.bomCode || "",
    "Phiên bản BOM": order.bom?.version || "1.0",
    "SL Kế hoạch": order.plannedQuantity,
    "SL Thực tế": order.actualQuantity || 0,
    "Đơn vị": order.finishedProduct?.unit || "",
    "Ngày bắt đầu": format(new Date(order.startDate), "dd/MM/yyyy"),
    "Ngày kết thúc": order.endDate ? format(new Date(order.endDate), "dd/MM/yyyy") : "",
    "Trạng thái": PRODUCTION_STATUS_LABELS[order.status] || order.status,
    "Kho đích": order.warehouse?.warehouseName || "",
    "Ghi chú": order.notes || "",
  })) || [];

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  const columnWidths = [
    { wch: 15 }, // Mã lệnh
    { wch: 25 }, // Sản phẩm
    { wch: 12 }, // SKU
    { wch: 12 }, // BOM
    { wch: 12 }, // Phiên bản BOM
    { wch: 12 }, // SL Kế hoạch
    { wch: 12 }, // SL Thực tế
    { wch: 10 }, // Đơn vị
    { wch: 15 }, // Ngày bắt đầu
    { wch: 15 }, // Ngày kết thúc
    { wch: 15 }, // Trạng thái
    { wch: 15 }, // Kho đích
    { wch: 20 }, // Ghi chú
  ];
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Lệnh sản xuất");

  const fileName = `Lenh_san_xuat_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};


export const handleExportExcelUsers = (users: User[]) => {
  if (!users || users.length === 0) {
    alert("Không có dữ liệu để xuất");
    return;
  }

  // Prepare data for export
  const exportData = users.map(user => ({
    "Mã NV": user.employeeCode,
    "Họ Tên": user.fullName,
    "Email": user.email,
    "Số Điện Thoại": user.phone || "",
    "Giới Tính": getGenderLabel(user.gender),
    "Vai Trò": user.role?.roleName || "",
    "Kho": user.warehouse?.warehouseName || "",
    "Địa Chỉ": user.address || "",
    "Trạng Thái": getStatusLabel(user.status),
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Mã NV
    { wch: 20 }, // Họ Tên
    { wch: 25 }, // Email
    { wch: 15 }, // Số Điện Thoại
    { wch: 10 }, // Giới Tính
    { wch: 20 }, // Vai Trò
    { wch: 20 }, // Kho
    { wch: 30 }, // Địa Chỉ
    { wch: 15 }, // Trạng Thái
  ];
  worksheet["!cols"] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nhân viên");

  // Export file
  const fileName = `Danh_sach_nhan_vien_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  XLSX.writeFile(workbook, fileName);
};


const getAttendanceStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    present: "Đủ công",
    absent: "Vắng mặt",
    late: "Đi muộn",
    leave: "Nghỉ phép",
    work_from_home: "WFH",
  };
  return labels[status] || status;
};

const getLeaveTypeLabel = (leaveType?: string) => {
  const labels: Record<string, string> = {
    none: "Không phải nghỉ",
    annual: "Nghỉ phép năm",
    sick: "Nghỉ ốm",
    unpaid: "Nghỉ không lương",
    other: "Khác",
  };
  return labels[leaveType || "none"] || leaveType || "";
};

export const handleExportAttendance = (
  attendances: Attendance[],
  users: User[],
  month: string
) => {
  if (!attendances || attendances.length === 0) {
    alert("Không có dữ liệu chấm công để xuất!");
    return;
  }

  // Create user map for quick lookup
  const userMap = new Map<number, User>();
  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  const exportData = attendances.map((att) => {
    const user = userMap.get(att.userId);
    return {
      "Mã NV": user?.employeeCode || "",
      "Họ Tên": user?.fullName || "",
      "Ngày": format(new Date(att.date), "dd/MM/yyyy"),
      "Giờ vào": att.checkInTime
        ? att.checkInTime.toString().substring(0, 5)
        : "—",
      "Giờ ra": att.checkOutTime
        ? att.checkOutTime.toString().substring(0, 5)
        : "—",
      "Giờ công": att.workHours ? att.workHours.toFixed(2) : "—",
      "Tăng ca": att.overtimeHours ? att.overtimeHours.toFixed(2) : "—",
      "Trạng thái": getAttendanceStatusLabel(att.status),
      "Loại nghỉ": getLeaveTypeLabel(att.leaveType),
      "Ghi chú": att.notes || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  const columnWidths = [
    { wch: 12 }, // Mã NV
    { wch: 20 }, // Họ Tên
    { wch: 12 }, // Ngày
    { wch: 10 }, // Giờ vào
    { wch: 10 }, // Giờ ra
    { wch: 10 }, // Giờ công
    { wch: 10 }, // Tăng ca
    { wch: 15 }, // Trạng thái
    { wch: 15 }, // Loại nghỉ
    { wch: 30 }, // Ghi chú
  ];
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Chấm công");

  const fileName = `Bang_cong_${month}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const handleExportExcelMaterial = (products: Product[]) => {
    if (products.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // Prepare data for export
    const exportData = products.map((product) => ({
      SKU: product.sku,
      "Tên sản phẩm": product.productName,
      "Loại sản phẩm": "Nguyên liệu",
      "Danh mục": product.category?.categoryName || "",
      "Nhà cung cấp": product.supplier?.supplierName || "",
      "Đơn vị": product.unit,
      Barcode: product.barcode || "",
      "Giá nhập": product.purchasePrice || 0,
      "Giá bán lẻ": product.sellingPriceRetail || 0,
      "Giá bán sỉ": product.sellingPriceWholesale || 0,
      "Giá VIP": product.sellingPriceVip || 0,
      "Tồn tối thiểu": product.minStockLevel || 0,
      "Trạng thái":
        product.status === "active"
          ? "Hoạt động"
          : product.status === "inactive"
          ? "Tạm ngưng"
          : "Ngừng kinh doanh",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // SKU
      { wch: 30 }, // Tên sản phẩm
      { wch: 15 }, // Loại sản phẩm
      { wch: 20 }, // Danh mục
      { wch: 20 }, // Nhà cung cấp
      { wch: 10 }, // Đơn vị
      { wch: 15 }, // Barcode
      { wch: 12 }, // Giá nhập
      { wch: 12 }, // Giá bán lẻ
      { wch: 12 }, // Giá bán sỉ
      { wch: 12 }, // Giá VIP
      { wch: 12 }, // Tồn tối thiểu
      { wch: 15 }, // Trạng thái
    ];
    worksheet["!cols"] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

    // Export file
    const fileName = `Danh_sach_san_pham_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };
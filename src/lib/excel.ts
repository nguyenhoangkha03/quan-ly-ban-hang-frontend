import { ProductionOrder } from "@/types";
import { format } from "date-fns";
import { PRODUCTION_STATUS_LABELS } from "./constants";
import * as XLSX from "xlsx";

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

"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";

interface ExportButtonProps {
  data: any[];
  filename: string;
  title?: string;
  subtitle?: string;
  columns?: Array<{ header: string; key: string; format?: (value: any) => string }>;
  format?: "excel" | "pdf" | "both";
  className?: string;
}

export default function ExportButton({
  data,
  filename,
  title,
  subtitle,
  columns,
  format = "both",
  className = "",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Export to Excel
  const exportToExcel = () => {
    try {
      setIsExporting(true);

      // Transform data if columns provided
      let exportData = data;
      if (columns && columns.length > 0) {
        exportData = data.map((item) => {
          const row: Record<string, any> = {};
          columns.forEach((col) => {
            const value = item[col.key];
            row[col.header] = col.format ? col.format(value) : value;
          });
          return row;
        });
      }

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();

      // Add title if provided
      if (title) {
        XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
        XLSX.utils.sheet_add_json(ws, exportData, { origin: "A3", skipHeader: false });
      }

      XLSX.utils.book_append_sheet(wb, ws, "Report");

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const fullFilename = `${filename}_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fullFilename);

      toast.success("Xuất Excel thành công!");
    } catch (error) {
      console.error("Export to Excel error:", error);
      toast.error("Xuất Excel thất bại!");
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      setIsExporting(true);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add title
      if (title) {
        doc.setFontSize(16);
        doc.text(title, 14, 15);
      }

      // Add subtitle
      if (subtitle) {
        doc.setFontSize(10);
        doc.text(subtitle, 14, 22);
      }

      // Prepare table data
      const tableColumns = columns
        ? columns.map((col) => col.header)
        : Object.keys(data[0] || {});

      const tableRows = data.map((item) => {
        if (columns) {
          return columns.map((col) => {
            const value = item[col.key];
            return col.format ? col.format(value) : value;
          });
        }
        return Object.values(item);
      });

      // Add table
      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: title || subtitle ? 28 : 15,
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250],
        },
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const fullFilename = `${filename}_${timestamp}.pdf`;

      // Save file
      doc.save(fullFilename);

      toast.success("Xuất PDF thành công!");
    } catch (error) {
      console.error("Export to PDF error:", error);
      toast.error("Xuất PDF thất bại!");
    } finally {
      setIsExporting(false);
    }
  };

  if (data.length === 0) {
    return (
      <Button variant="outline" disabled className={className}>
        <FileDown className="mr-2 h-4 w-4" />
        Không có dữ liệu
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {(format === "excel" || format === "both") && (
        <Button
          variant="outline"
          onClick={exportToExcel}
          disabled={isExporting}
          isLoading={isExporting}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Xuất Excel
        </Button>
      )}

      {(format === "pdf" || format === "both") && (
        <Button
          variant="outline"
          onClick={exportToPDF}
          disabled={isExporting}
          isLoading={isExporting}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Xuất PDF
        </Button>
      )}
    </div>
  );
}

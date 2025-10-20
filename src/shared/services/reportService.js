import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

class ReportService {
  constructor() {
    this.clinicName = "Tonsuya Super Health Center";
    this.primaryColor = [40, 116, 166]; // Blue color
    this.lightColor = [245, 245, 245]; // Light gray
  }

  // Generate PDF Report
  async generatePDF({
    title = "Report",
    data = [],
    columns = [],
    filters = {},
    summary = {},
    fileName = null,
    orientation = "portrait",
  }) {
    const doc = new jsPDF(orientation);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header (now async)
    await this.addHeader(doc, title, pageWidth);

    // Report metadata
    let yPosition = 80;
    yPosition = this.addFilters(doc, filters, yPosition);
    yPosition = this.addSummary(doc, summary, yPosition);

    // Table
    this.addTable(doc, data, columns, yPosition, pageWidth, pageHeight);

    // Save with auto-generated filename if not provided
    const finalFileName =
      fileName ||
      `${title.toLowerCase().replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
    doc.save(finalFileName);
  }

  // Private methods
  async addHeader(doc, title, pageWidth) {
    // White header background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 60, "F");

    // Add border around header
    doc.setDrawColor(...this.primaryColor);
    doc.setLineWidth(1);
    doc.rect(0, 0, pageWidth, 60);

    try {
      // Load and add logo
      const logoData = await this.loadLogo();
      if (logoData) {
        // Add logo on the left side
        const logoSize = 40;
        doc.addImage(logoData, "PNG", 15, 10, logoSize, logoSize);

        // Clinic name and title positioned to the right of logo
        const textStartX = 70;

        // Clinic name
        doc.setFontSize(20);
        doc.setTextColor(...this.primaryColor);
        doc.setFont("helvetica", "bold");
        doc.text(this.clinicName, textStartX, 25);

        // Report title
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        doc.text(title, textStartX, 40);
      } else {
        // Fallback if logo doesn't load - centered text
        this.addHeaderWithoutLogo(doc, title, pageWidth);
      }
    } catch (error) {
      console.warn("Could not load logo, using text-only header:", error);
      this.addHeaderWithoutLogo(doc, title, pageWidth);
    }

    // Generated date with better positioning
    const reportDate = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${reportDate}`, pageWidth - 14, 70, {
      align: "right",
    });
  }

  addHeaderWithoutLogo(doc, title, pageWidth) {
    // Clinic name (centered)
    doc.setFontSize(22);
    doc.setTextColor(...this.primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(this.clinicName, pageWidth / 2, 25, { align: "center" });

    // Report title (centered)
    doc.setFontSize(18);
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.text(title, pageWidth / 2, 45, { align: "center" });
  }

  async loadLogo() {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = this.width;
        canvas.height = this.height;
        ctx.drawImage(this, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = "/Tonsuya.png";
    });
  }

  addFilters(doc, filters, yPosition) {
    const filterEntries = Object.entries(filters).filter(
      ([key, value]) => value
    );

    if (filterEntries.length > 0) {
      // Section title with background
      doc.setFillColor(250, 250, 250);
      doc.rect(14, yPosition - 5, doc.internal.pageSize.width - 28, 15, "F");

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Filters Applied", 20, yPosition + 3);
      yPosition += 18;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      filterEntries.forEach(([key, value]) => {
        doc.text(`• ${key}: ${value}`, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 15;
    }

    return yPosition;
  }

  addSummary(doc, summary, yPosition) {
    const summaryEntries = Object.entries(summary);

    if (summaryEntries.length > 0) {
      // Section title with background
      doc.setFillColor(245, 250, 255);
      doc.rect(14, yPosition - 5, doc.internal.pageSize.width - 28, 15, "F");

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Summary Statistics", 20, yPosition + 3);
      yPosition += 18;

      // Create a grid layout for summary items
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);

      const itemsPerRow = 2;
      const columnWidth = (doc.internal.pageSize.width - 50) / itemsPerRow;

      summaryEntries.forEach(([key, value], index) => {
        const row = Math.floor(index / itemsPerRow);
        const col = index % itemsPerRow;
        const x = 25 + col * columnWidth;
        const y = yPosition + row * 10;

        doc.text(`• ${key}: `, x, y);
        doc.setFont("helvetica", "bold");
        doc.text(`${value}`, x + 50, y);
        doc.setFont("helvetica", "normal");
      });

      yPosition += Math.ceil(summaryEntries.length / itemsPerRow) * 10 + 15;
    }

    return yPosition;
  }

  addTable(doc, data, columns, yPosition, pageWidth, pageHeight) {
    if (data.length === 0) {
      // No data message
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "No data available for the selected criteria.",
        pageWidth / 2,
        yPosition + 20,
        { align: "center" }
      );
      return;
    }

    // Table title separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition - 5, pageWidth - 20, yPosition - 5);

    // Calculate column widths based on content and available space
    const availableWidth = pageWidth - 40; // 20px margin on each side
    const columnWidths = this.calculateColumnWidths(columns, availableWidth);

    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      body: data.map((row) =>
        columns.map((col) => this.formatCellValue(row[col.key], col.type))
      ),
      startY: yPosition + 5,
      styles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: this.primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: columnWidths,
      margin: { left: 20, right: 20 },
      theme: "striped",
      didDrawPage: (data) => {
        // Footer with improved styling
        const footerY = pageHeight - 15;

        // Footer line
        doc.setDrawColor(...this.primaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${data.pageNumber}`, 20, footerY, { align: "left" });
        doc.text(
          `${this.clinicName} - Confidential Document`,
          pageWidth - 20,
          footerY,
          { align: "right" }
        );
      },
    });
  }

  calculateColumnWidths(columns, availableWidth) {
    const totalWeight = columns.reduce((sum, col) => sum + (col.width || 1), 0);
    const columnStyles = {};

    columns.forEach((col, index) => {
      const weight = col.width || 1;
      columnStyles[index] = {
        cellWidth: (availableWidth * weight) / totalWeight,
      };
    });

    return columnStyles;
  }

  formatCellValue(value, type) {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case "date":
        return new Date(value).toLocaleDateString();
      case "datetime":
        return new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      case "currency":
        return `₱${Number(value).toLocaleString()}`;
      case "number":
        return Number(value).toLocaleString();
      default:
        return String(value);
    }
  }
}

export default new ReportService();

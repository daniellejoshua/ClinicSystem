import Reactimport React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, Shield, FileText, Download } from "lucide-react";
import dataService from "../../shared/services/dataService";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, Shield, FileText, Download } from "lucide-react";
import dataService from "../../shared/services/dataService";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, Shield, FileText, Download } from "lucide-react";
import dataService from "../../shared/services/dataService";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const logs = await dataService.getAllData("audit_logs");
        setAuditLogs(logs);
        setFilteredLogs(logs);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  // Helper function to categorize an action
  const categorizeAction = (action) => {
    if (!action) return "Other";

    const actionLower = action.toLowerCase();

    // Staff actions
    if (actionLower.includes("staff logout")) return "Staff Logout";
    if (actionLower.includes("staff login")) return "Staff Login";

    // Patient registration/check-in
    if (actionLower.includes("walk-in patient registered"))
      return "Patient Registration";
    if (actionLower.includes("checked in online appointment"))
      return "Patient Check-in";

    // Appointment actions
    if (actionLower.includes("rescheduled appointment"))
      return "Appointment Rescheduled";
    if (actionLower.includes("appointment")) return "Appointment Management";

    // Queue management
    if (actionLower.includes("queue")) return "Queue Management";

    // General categories for other actions
    if (actionLower.includes("created") || actionLower.includes("added"))
      return "Created";
    if (actionLower.includes("updated") || actionLower.includes("modified"))
      return "Updated";
    if (actionLower.includes("deleted") || actionLower.includes("removed"))
      return "Deleted";

    return "Other";
  };

  useEffect(() => {
    let filtered = [...auditLogs];

    // Filter by search term (only staff full name)
    if (searchTerm) {
      filtered = filtered.filter((log) =>
        log.staff_full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by action category
    if (actionFilter) {
      filtered = filtered.filter((log) => {
        const category = categorizeAction(log.action);
        return category === actionFilter;
      });
    }

    // Filter by date
    if (dateFilter) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp).toISOString().split("T")[0];
        return logDate === dateFilter;
      });
    }

    // Sort by timestamp
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredLogs(filtered);
  }, [auditLogs, searchTerm, actionFilter, dateFilter, sortOrder]);

  const getActionCategories = () => {
    // Get unique categories from actual audit logs
    const uniqueActions = [
      ...new Set(
        auditLogs.map((log) => categorizeAction(log.action)).filter(Boolean)
      ),
    ];

    return uniqueActions.sort();
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();

    // Set up the document
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 116, 166);
    doc.text("Tonsuya Super Health Center", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Audit Log Report", pageWidth / 2, 35, { align: "center" });

    // Report metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const reportDate = new Date().toLocaleString();
    doc.text(`Generated on: ${reportDate}`, pageWidth / 2, 45, {
      align: "center",
    });

    // Filters applied section
    let yPosition = 60;
    if (searchTerm || actionFilter || dateFilter) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Filters Applied:", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      if (searchTerm) {
        doc.text(`• Staff Name: ${searchTerm}`, 25, yPosition);
        yPosition += 8;
      }
      if (actionFilter) {
        doc.text(`• Action Type: ${actionFilter}`, 25, yPosition);
        yPosition += 8;
      }
      if (dateFilter) {
        doc.text(
          `• Date: ${new Date(dateFilter).toLocaleDateString()}`,
          25,
          yPosition
        );
        yPosition += 8;
      }
      yPosition += 10;
    }

    // Summary statistics
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary Statistics:", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`• Total Records: ${filteredLogs.length}`, 25, yPosition);
    yPosition += 8;
    doc.text(
      `• Date Range: ${
        filteredLogs.length > 0
          ? `${new Date(
              Math.min(...filteredLogs.map((log) => new Date(log.timestamp)))
            ).toLocaleDateString()} - ${new Date(
              Math.max(...filteredLogs.map((log) => new Date(log.timestamp)))
            ).toLocaleDateString()}`
          : "No data"
      }`,
      25,
      yPosition
    );
    yPosition += 8;

    // Count by action type
    const actionCounts = {};
    filteredLogs.forEach((log) => {
      const category = categorizeAction(log.action);
      actionCounts[category] = (actionCounts[category] || 0) + 1;
    });

    Object.entries(actionCounts).forEach(([action, count]) => {
      doc.text(`• ${action}: ${count} records`, 25, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Prepare table data
    const tableData = filteredLogs.map((log) => [
      log.staff_full_name || "Unknown User",
      categorizeAction(log.action),
      log.action,
      new Date(log.timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);

    // Create table
    doc.autoTable({
      head: [["Staff Name", "Category", "Action", "Date & Time"]],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [40, 116, 166],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Staff Name
        1: { cellWidth: 35 }, // Category
        2: { cellWidth: 80 }, // Action
        3: { cellWidth: 35 }, // Date & Time
      },
      margin: { left: 20, right: 20 },
      didDrawPage: function (data) {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          `Page ${data.pageNumber} | Tonsuya Super Health Center - Confidential`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      },
    });

    // Save the PDF
    const fileName = `audit-log-report-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  };

  // Print Report
  const printReport = () => {
    const printWindow = window.open("", "_blank");
    const reportDate = new Date().toLocaleString();

    // Generate HTML content for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Audit Log Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #2874a6;
            padding-bottom: 20px;
          }
          .clinic-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2874a6; 
            margin-bottom: 10px;
          }
          .report-title { 
            font-size: 18px; 
            margin-bottom: 10px;
          }
          .meta-info { 
            font-size: 12px; 
            color: #666; 
          }
          .summary { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px;
          }
          .filters { 
            background-color: #e3f2fd; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
            font-size: 12px;
          }
          th { 
            background-color: #2874a6; 
            color: white; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 10px; 
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">Tonsuya Super Health Center</div>
          <div class="report-title">Audit Log Report</div>
          <div class="meta-info">Generated on: ${reportDate}</div>
        </div>
        
        ${
          searchTerm || actionFilter || dateFilter
            ? `
        <div class="filters">
          <h3>Applied Filters:</h3>
          ${
            searchTerm
              ? `<p><strong>Staff Name:</strong> ${searchTerm}</p>`
              : ""
          }
          ${
            actionFilter
              ? `<p><strong>Action Type:</strong> ${actionFilter}</p>`
              : ""
          }
          ${
            dateFilter
              ? `<p><strong>Date:</strong> ${new Date(
                  dateFilter
                ).toLocaleDateString()}</p>`
              : ""
          }
        </div>
        `
            : ""
        }
        
        <div class="summary">
          <h3>Summary Statistics:</h3>
          <p><strong>Total Records:</strong> ${filteredLogs.length}</p>
          <p><strong>Date Range:</strong> ${
            filteredLogs.length > 0
              ? `${new Date(
                  Math.min(
                    ...filteredLogs.map((log) => new Date(log.timestamp))
                  )
                ).toLocaleDateString()} - ${new Date(
                  Math.max(
                    ...filteredLogs.map((log) => new Date(log.timestamp))
                  )
                ).toLocaleDateString()}`
              : "No data"
          }</p>
          
          <h4>Records by Action Type:</h4>
          ${Object.entries(
            filteredLogs.reduce((acc, log) => {
              const category = categorizeAction(log.action);
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {})
          )
            .map(([action, count]) => `<p>• ${action}: ${count} records</p>`)
            .join("")}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Category</th>
              <th>Action</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLogs
              .map(
                (log) => `
              <tr>
                <td>${log.staff_full_name || "Unknown User"}</td>
                <td>${categorizeAction(log.action)}</td>
                <td>${log.action}</td>
                <td>${new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Tonsuya Super Health Center - Confidential Document</p>
          <p>This report contains sensitive information and should be handled according to privacy policies.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 w-full max-w-screen-2xl mx-auto bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 relative">
        {/* Admin Only Badge */}
        <div className="absolute top-0 right-0">
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Admin Only
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Audit Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track system activities and user actions
            </p>
          </div>

          {/* Report Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={printReport}
              variant="outline"
              className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <FileText className="h-4 w-4" />
              Print Report
            </Button>
            <Button
              onClick={generatePDFReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search by Staff Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Staff full name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Action Type
              </label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                {getActionCategories().map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort By
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || actionFilter || dateFilter) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setActionFilter("");
                  setDateFilter("");
                }}
                className="text-sm"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredLogs.length} of {auditLogs.length} logs
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-900">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading audit logs...
              </p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[58vh]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredLogs.map((log, index) => (
                      <tr
                        key={log.id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                          index % 2 === 0 ? "" : "bg-gray-25 dark:bg-gray-850"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                                {(log.staff_full_name || "Unknown")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {log.staff_full_name || "Unknown User"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {log.action}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No audit logs found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || actionFilter || dateFilter
                  ? "Try adjusting your filters to see more results."
                  : "No audit logs are available yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;

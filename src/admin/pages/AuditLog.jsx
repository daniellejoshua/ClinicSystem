import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, Filter, Shield } from "lucide-react";
import dataService from "../../shared/services/dataService";

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

  return (
    <div className="p-6 w-full max-w-screen-2xl mx-auto bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 relative">
        {/* Admin Only Badge */}
        <div className="absolute top-0 right-0">
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
            <Shield className="h-4 w-4" />
            Admin Only
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Audit Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track system activities and user actions
        </p>
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
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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

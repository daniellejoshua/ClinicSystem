import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaGlobe,
  FaWalking,
  FaUserMd,
  FaCalendarAlt,
} from "react-icons/fa";
import { Card } from "@/components/ui/card";
import dataService from "@/shared/services/dataService";

const AppointmentPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError("");
      try {
        const data = await dataService.getAllData("appointments");
        setAppointments(data || []);
      } catch (err) {
        setError("Failed to fetch appointments: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appt) => {
    const term = searchTerm.toLowerCase();
    return (
      appt.patient_full_name?.toLowerCase().includes(term) ||
      appt.email_address?.toLowerCase().includes(term) ||
      appt.contact_number?.toLowerCase().includes(term) ||
      appt.appointment_type?.toLowerCase().includes(term) ||
      appt.status?.toLowerCase().includes(term) ||
      appt.service_ref?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="p-6">
        <h1 className="text-3xl font-yeseva text-primary mb-6">
          All Appointments
        </h1>
        {loading && (
          <div className="mb-4 text-blue-500">Loading appointments...</div>
        )}
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <Card className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments by patient, service, staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </Card>
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service Ref
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Checked In
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No appointments found matching your search."
                          : "No appointments found."}
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {appt.patient_full_name || "Unknown"}
                        </td>
                        <td className="px-6 py-4">
                          {appt.email_address || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {appt.contact_number || "-"}
                        </td>
                        <td className="px-6 py-4">
                          {appt.appointment_type || "-"}
                        </td>
                        <td className="px-6 py-4">{appt.service_ref || "-"}</td>
                        <td className="px-6 py-4">
                          {appt.appointment_date
                            ? new Date(appt.appointment_date).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4">{appt.status || "-"}</td>
                        <td className="px-6 py-4">
                          {appt.checked_in ? "Yes" : "No"}
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
    </>
  );
};

export default AppointmentPage;

import React, { useState } from "react";
import dataService from "../../shared/services/dataService";

const AddStaff = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const { confirmPassword, ...staffData } = form;
      const result = await dataService.addDataWithAutoId("staff", staffData);
      setMessage(`✅ Staff added! ID: ${result.id}`);
      setForm({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
      });
    } catch (error) {
      setError("❌ Error adding staff: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border border-blue-200">
      <h2 className="text-3xl font-bold mb-6 text-blue-800 text-center">
        Add New Admin
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-2 text-blue-700">
            Full Name
          </label>
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
            placeholder="Enter full name"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-blue-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
            placeholder="Enter email"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-blue-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
            placeholder="Enter password"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-blue-700">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
            placeholder="Confirm password"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2 text-blue-700">Role</label>
          <input
            type="text"
            name="role"
            value={form.role}
            disabled
            className="w-full border border-blue-300 rounded-lg px-4 py-3 bg-blue-100 text-blue-700 font-bold text-lg cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-lg shadow-md transition"
        >
          {isLoading ? "Adding..." : "Add Admin"}
        </button>
        {error && (
          <div className="mt-4 text-center text-red-600 font-semibold">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AddStaff;

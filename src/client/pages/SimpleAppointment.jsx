import React from "react";

const SimpleAppointment = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>✅ Simple Appointment Page Works!</h1>
      <p>This is a basic appointment page to test routing.</p>
      <div
        style={{
          background: "#f0f9ff",
          border: "1px solid #0ea5e9",
          borderRadius: "8px",
          padding: "16px",
          margin: "20px 0",
        }}
      >
        <h2>Quick Test Form</h2>
        <input
          type="text"
          placeholder="Your name"
          style={{
            padding: "8px",
            margin: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <br />
        <input
          type="email"
          placeholder="Your email"
          style={{
            padding: "8px",
            margin: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <br />
        <button
          style={{
            padding: "10px 20px",
            background: "#0ea5e9",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Test Submit
        </button>
      </div>
      <p>If you see this page, routing is working correctly!</p>
    </div>
  );
};

export default SimpleAppointment;

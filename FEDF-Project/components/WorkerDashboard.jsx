import React, { useEffect, useState } from "react";
import { getBookings, getUsers } from "../utils/db";

export default function WorkerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setBookings(getBookings());
    setUsers(getUsers());
  }, []);

  return (
    <section className="dashboard worker-dashboard">
      <h3>Worker dashboard</h3>
      <p>All bookings — workers can view details and assist customers.</p>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <article key={b.id} className="booking-item">
              <div>
                <strong>{b.airportCode} - {b.airportName}</strong>
                <div>{b.dropoff} → {b.return}</div>
                <div>Vehicle: {b.vehicle}</div>
                <div>Price: Rs. {b.price.toLocaleString("en-IN")}</div>
                <div>User: {b.userName || b.userEmail}</div>
                <div>Terminal: {b.terminal || "N/A"}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

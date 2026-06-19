import React, { useEffect, useState } from "react";
import { getUserBookings, removeBooking } from "../utils/db";

export default function UserDashboard({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user?.email) setBookings(getUserBookings(user.email));
  }, [user]);

  function handleCancel(id) {
    removeBooking(id);
    setBookings((b) => b.filter((x) => x.id !== id));
  }

  if (!user) return null;

  return (
    <section className="dashboard user-dashboard">
      <h3>Hello, {user.name || user.email}</h3>
      <h4>Your bookings</h4>
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
                <div>Days: {b.days || 1} • Per day: Rs. {((b.perDay||b.price)||0).toLocaleString("en-IN")}</div>
                <div>Price: Rs. {b.price.toLocaleString("en-IN")}</div>
                <div>Terminal: {b.terminal || "N/A"}</div>
              </div>
              <div>
                <button onClick={() => handleCancel(b.id)} className="text-button">Cancel</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

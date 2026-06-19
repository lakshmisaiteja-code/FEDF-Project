import React, { useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  CarFront,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TimerReset,
  User,
  UserPlus,
  WalletCards,
  X,
} from "lucide-react";
import heroImage from "./assets/parknfly-hero.png";
import Auth from "./components/Auth";
import UserDashboard from "./components/UserDashboard";
import WorkerDashboard from "./components/WorkerDashboard";
import { saveBooking, getSessionUser, clearSession } from "./utils/db";
import { useEffect } from "react";

const airports = [
  { code: "HYD", name: "Rajiv Gandhi International" },
  { code: "DEL", name: "Indira Gandhi International" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj" },
  { code: "BLR", name: "Kempegowda International" },
];

const terminalsByAirport = {
  HYD: ["T1", "T2"],
  DEL: ["T1", "T2", "T3"],
  BOM: ["T1", "T2"],
  BLR: ["T1"],
};

const plans = [
  {
    name: "Express Covered",
    label: "Fastest",
    base: 560,
    rating: "4.9",
    distance: "3 min shuttle",
    protection: "Covered bay",
    icon: ShieldCheck,
  },
  {
    name: "Value Self Park",
    label: "Popular",
    base: 390,
    rating: "4.7",
    distance: "6 min shuttle",
    protection: "24/7 patrol",
    icon: CarFront,
  },
  {
    name: "Valet Gate Drop",
    label: "Premium",
    base: 780,
    rating: "5.0",
    distance: "Terminal handoff",
    protection: "Insured valet",
    icon: Sparkles,
  },
];

const steps = [
  {
    title: "Reserve your space",
    text: "Choose the airport, travel window, and parking style that fits your trip.",
    icon: CalendarDays,
  },
  {
    title: "Arrive stress-free",
    text: "Your QR pass, directions, and shuttle details stay ready on your phone.",
    icon: MapPin,
  },
  {
    title: "Fly and return",
    text: "Extend, pay, or retrieve your vehicle without waiting at the counter.",
    icon: CreditCard,
  },
];

const perks = [
  { value: "42K+", label: "monthly reservations" },
  { value: "98%", label: "on-time shuttle pickup" },
  { value: "24/7", label: "secure access and support" },
];

function getTodayOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    airport: airports[0].code,
    arrivalDate: getTodayOffset(3),
    arrivalTime: "09:00",
    returnDate: getTodayOffset(6),
    returnTime: "18:30",
    vehicle: "Sedan",
    terminal: terminalsByAirport[airports[0].code][0],
  });

  const selectedAirport = airports.find((airport) => airport.code === form.airport);

  const tripDays = useMemo(() => {
    const start = new Date(`${form.arrivalDate}T${form.arrivalTime}`);
    const end = new Date(`${form.returnDate}T${form.returnTime}`);
    const diff = end.getTime() - start.getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    return Math.max(1, Math.ceil(diff / dayMs));
  }, [form.arrivalDate, form.arrivalTime, form.returnDate, form.returnTime]);

  const quotePlans = useMemo(() => {
    const vehicleMultipliers = {
      Sedan: 1.0,
      SUV: 1.4,
      EV: 1.15,
      "Two-wheeler": 0.55,
    };

    const multiplier = vehicleMultipliers[form.vehicle] || 1;

    return plans.map((plan, index) => {
      const perDay = Math.round(plan.base * multiplier);
      const planFee = index * 95;
      const total = perDay * tripDays + planFee;
      return { ...plan, perDay, planFee, total };
    });
  }, [tripDays, form.vehicle]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      // when airport changes, default terminal to first available
      if (name === "airport") {
        const first = terminalsByAirport[value]?.[0] || current.terminal;
        next.terminal = first;
      }
      return next;
    });
  }

  function showAuth(mode) {
    setAuthMode(mode);
    setMenuOpen(false);
    requestAnimationFrame(() => {
      document.getElementById("auth")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const terminalMap = {
    HYD: "T1",
    DEL: "T3",
    BOM: "T2",
    BLR: "T1",
  };

  function handleReserve(plan) {
    if (!currentUser) {
      setMessage("Please login to reserve parking — redirecting to auth.");
      setTimeout(() => {
        showAuth("login");
      }, 250);
      return;
    }
    // use computed plan pricing (per-day and total)
    const price = plan.total || Math.round(plan.base * tripDays);

    const booking = {
      airportCode: form.airport,
      airportName: selectedAirport?.name || "",
      dropoff: `${form.arrivalDate} ${form.arrivalTime}`,
      return: `${form.returnDate} ${form.returnTime}`,
      vehicle: form.vehicle,
      price,
      perDay: plan.perDay || Math.round(plan.base),
      days: tripDays,
      planName: plan.name,
      terminal: form.terminal || (terminalsByAirport[form.airport]?.[0] ?? "T1"),
      userEmail: currentUser?.email || "guest@example.com",
      userName: currentUser?.name || null,
    };

    const saved = saveBooking(booking);
    setMessage(`Booking confirmed — id ${saved.id}`);
    // scroll to top where message can be seen
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const s = getSessionUser();
    if (s) setCurrentUser(s);
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#booking" aria-label="ParkNFly home">
          <span className="brand-mark">
            <Plane size={20} strokeWidth={2.4} />
          </span>
          <span>
            ParkNFly
            <small>Smart airport parking</small>
          </span>
        </a>

        <nav className={menuOpen ? "nav-links nav-links-open" : "nav-links"} aria-label="Primary">
          <a href="#booking" onClick={() => setMenuOpen(false)}>
            Book
          </a>
          <a href="#options" onClick={() => setMenuOpen(false)}>
            Parking
          </a>
          <a href="#process" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#support" onClick={() => setMenuOpen(false)}>
            Support
          </a>
          <button className="nav-auth-link" type="button" onClick={() => showAuth("login")}>
            <LogIn size={16} />
            Login
          </button>
          <button className="nav-auth-link nav-auth-primary" type="button" onClick={() => showAuth("signup")}>
            <UserPlus size={16} />
            Sign up
          </button>
        </nav>

        <button
          className="icon-button menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <img className="hero-image" src={heroImage} alt="Traveler using smart airport parking near a terminal" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="hero-copy">
              <span className="eyebrow">
                <TimerReset size={16} />
                Airport parking in minutes
              </span>
              <h1 id="hero-title">ParkNFly</h1>
              <p>
                Smart airport parking made easy with instant reservations, reliable shuttle timing,
                secure lots, and transparent trip pricing.
              </p>
              <div className="hero-actions">
                <a className="primary-link" href="#booking">
                  Find parking <ChevronRight size={18} />
                </a>
                <a className="secondary-link" href="#options">
                  Compare options
                </a>
              </div>
            </div>

            <div className="status-panel" aria-label="Trip snapshot">
              <div>
                <small>Nearest shuttle</small>
                <strong>03 min</strong>
              </div>
              <div>
                <small>Open spaces</small>
                <strong>186</strong>
              </div>
              <div>
                <small>Pass type</small>
                <strong>QR scan</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="booking-band" id="booking" aria-labelledby="booking-title">
          <div className="section-heading compact-heading">
            <span className="eyebrow dark">
              <Search size={16} />
              Live quote
            </span>
            <h2 id="booking-title">Reserve airport parking</h2>
          </div>

          <form className="booking-form">
            <label>
              <span>Airport</span>
              <select name="airport" value={form.airport} onChange={updateField}>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Drop-off date</span>
              <input name="arrivalDate" type="date" value={form.arrivalDate} onChange={updateField} />
            </label>

            <label>
              <span>Drop-off time</span>
              <input name="arrivalTime" type="time" value={form.arrivalTime} onChange={updateField} />
            </label>

            <label>
              <span>Return date</span>
              <input name="returnDate" type="date" value={form.returnDate} onChange={updateField} />
            </label>

            <label>
              <span>Return time</span>
              <input name="returnTime" type="time" value={form.returnTime} onChange={updateField} />
            </label>

            <label>
              <span>Vehicle</span>
              <select name="vehicle" value={form.vehicle} onChange={updateField}>
                <option>Sedan</option>
                <option>SUV</option>
                <option>EV</option>
                <option>Two-wheeler</option>
              </select>
            </label>

            <label>
              <span>Terminal</span>
              <select name="terminal" value={form.terminal} onChange={updateField}>
                {(terminalsByAirport[form.airport] || []).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </form>

          <div className="quote-strip">
            <div>
              <span>{selectedAirport.code}</span>
              <strong>{selectedAirport.name}</strong>
            </div>
            <div>
              <span>Trip length</span>
              <strong>
                {tripDays} {tripDays === 1 ? "day" : "days"}
              </strong>
            </div>
            <div>
              <span>Vehicle</span>
              <strong>{form.vehicle}</strong>
            </div>
          </div>
        </section>

        <section className="auth-section" id="auth" aria-labelledby="auth-title">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="eyebrow dark">
                <ShieldCheck size={16} />
                Account & bookings
              </span>
              <h2 id="auth-title">Manage bookings and access dashboards</h2>
            </div>
            <div>
              {currentUser ? (
                <div>
                  <strong>{currentUser.name || currentUser.email}</strong> ({currentUser.role})
                  <button className="text-button" style={{ marginLeft: 8 }} onClick={() => setCurrentUser(null)}>
                    Logout
                  </button>
                </div>
              ) : (
                <div>
                  <small>Not signed in</small>
                </div>
              )}
            </div>
          </div>

          <div className="auth-card">
            <Auth onAuth={(user) => setCurrentUser(user)} />
            {message && <p className="auth-message">{message}</p>}

            {currentUser && currentUser.role === "worker" && <WorkerDashboard />}
            {currentUser && currentUser.role === "user" && <UserDashboard user={currentUser} />}
          </div>
        </section>

        <section className="options-section" id="options" aria-labelledby="options-title">
          <div className="section-heading">
            <span className="eyebrow dark">
              <WalletCards size={16} />
              Choose your fit
            </span>
            <h2 id="options-title">Parking options for your trip</h2>
            <p>Prices update from the dates selected above, so every card reflects the same travel window.</p>
          </div>

          <div className="plan-grid">
            {quotePlans.map((plan) => {
              const Icon = plan.icon;
              return (
                <article className="plan-card" key={plan.name}>
                  <div className="plan-topline">
                    <span className="plan-badge">{plan.label}</span>
                    <span className="rating">
                      <Star size={15} fill="currentColor" />
                      {plan.rating}
                    </span>
                  </div>
                  <div className="plan-icon">
                    <Icon size={24} />
                  </div>
                  <h3>{plan.name}</h3>
                  <p>{plan.protection}</p>
                  <div className="plan-meta">
                    <span>
                      <Clock3 size={16} />
                      {plan.distance}
                    </span>
                    <span>
                      <BadgeCheck size={16} />
                      Free cancellation
                    </span>
                  </div>
                  <div className="price-row">
                    <strong>Rs. {plan.perDay.toLocaleString("en-IN")}</strong>
                    <small>/day</small>
                  </div>
                  <div className="price-row" style={{ marginTop: 6 }}>
                    <strong>Rs. {plan.total.toLocaleString("en-IN")}</strong>
                    <small>total</small>
                  </div>
                  <button className="reserve-button" type="button" onClick={() => handleReserve(plan)}>
                    Reserve <ChevronRight size={17} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="process-section" id="process" aria-labelledby="process-title">
          <div className="section-heading">
            <span className="eyebrow dark">
              <Sparkles size={16} />
              Simple flow
            </span>
            <h2 id="process-title">From driveway to departure gate</h2>
          </div>

          <div className="step-list">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-item" key={step.title}>
                  <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="step-icon">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="trust-section" id="support" aria-label="ParkNFly support and performance">
          <div className="trust-copy">
            <span className="eyebrow dark">
              <ShieldCheck size={16} />
              Travel-ready parking
            </span>
            <h2>Built for early flights, late returns, and quick changes.</h2>
            <p>
              ParkNFly keeps your pass, payment, shuttle details, and support channel together so
              airport parking feels predictable from the first tap to the final exit.
            </p>
          </div>
          <div className="perk-grid">
            {perks.map((perk) => (
              <div className="perk" key={perk.label}>
                <strong>{perk.value}</strong>
                <span>{perk.label}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>ParkNFly</span>
        <span>Smart airport parking made easy.</span>
      </footer>
    </div>
  );
}

export default App;

const USERS_KEY = "parknfly_users";
const BOOKINGS_KEY = "parknfly_bookings";

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers() {
  return read(USERS_KEY);
}

export function signupUser({ name, email, password, role = "user" }) {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error("User already exists");
  }
  const user = { id: Date.now(), name, email, password, role };
  users.push(user);
  write(USERS_KEY, users);
  return user;
}

export function loginUser(email, password) {
  const users = getUsers();
  const u = users.find((x) => x.email === email && x.password === password);
  if (!u) throw new Error("Invalid credentials");
  return u;
}

export function getBookings() {
  return read(BOOKINGS_KEY);
}

export function saveBooking(booking) {
  const bookings = getBookings();
  const b = { id: Date.now(), createdAt: new Date().toISOString(), ...booking };
  bookings.push(b);
  write(BOOKINGS_KEY, bookings);
  return b;
}

export function getUserBookings(email) {
  return getBookings().filter((b) => b.userEmail === email);
}

export function clearAll() {
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem(BOOKINGS_KEY);
}

export function removeBooking(id) {
  const bookings = getBookings().filter((b) => b.id !== id);
  write(BOOKINGS_KEY, bookings);
}

const SESSION_KEY = "parknfly_session_user";

export function setSessionUser(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    // noop
  }
}

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default { getUsers, signupUser, loginUser, getBookings, saveBooking, getUserBookings, removeBooking, clearAll, setSessionUser, getSessionUser, clearSession };

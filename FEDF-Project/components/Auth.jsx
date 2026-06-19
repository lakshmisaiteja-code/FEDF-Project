import React, { useState } from "react";
import db, { signupUser, loginUser, setSessionUser, getSessionUser } from "../utils/db";
import { useEffect } from "react";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  function handleSignup() {
    try {
      const user = signupUser({ name, email, password, role });
      setMessage("Account created — logged in");
      setSessionUser(user);
      onAuth(user);
    } catch (e) {
      setMessage(e.message);
    }
  }

  function handleLogin() {
    try {
      const user = loginUser(email, password);
      setMessage("Logged in");
      setSessionUser(user);
      onAuth(user);
    } catch (e) {
      setMessage(e.message);
    }
  }

  useEffect(() => {
    const s = getSessionUser();
    if (s) onAuth(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-mini">
      <div style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "active" : ""}>
          Login
        </button>
        <button type="button" onClick={() => setMode("signup")} className={mode === "signup" ? "active" : ""}>
          Sign up
        </button>
      </div>

      {mode === "signup" ? (
        <div>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="worker">Worker</option>
            </select>
          </label>
          <div>
            <button type="button" onClick={handleSignup} className="auth-submit">
              Create account
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label>
            Login as
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="worker">Worker</option>
            </select>
          </label>
          <div>
            <button type="button" onClick={() => handleLogin()} className="auth-submit">
              Login
            </button>
          </div>
        </div>
      )}

      {message && <p className="auth-message">{message}</p>}
    </div>
  );
}

import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("remember_me") === "true";
  });
  const [email, setEmail] = useState(() => {
    const savedEmail = localStorage.getItem("remembered_email");
    const isRemembered = localStorage.getItem("remember_me") === "true";
    return isRemembered && savedEmail ? savedEmail : "";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 🔥 Custom Friendly Error Handling
        if (response.status === 401) {
          setError("Incorrect password. Please enter the correct password.");
        } else if (response.status === 404) {
          setError("User not found. Please sign up first.");
        } else {
          setError("Login failed. Please try again.");
        }

        setLoading(false);
        return;
      }

      // ✅ Store backend values
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username || "");
      localStorage.setItem("userId", data.user_id || "");
      localStorage.setItem("userEmail", data.email || "");

      // ✅ Process Remember Me
      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.setItem("remember_me", "false");
        localStorage.removeItem("remembered_email");
      }

      navigate("/feed");

    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <header className="main-header">
        <div className="logo" onClick={() => navigate("/")}>
          Neuroblog
        </div>
      </header>

      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="login-left">
          <h1>Welcome Back 👋</h1>
          <p>
            Log in to continue exploring blogs,
            connect with creators, and share your ideas.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <h2>Login</h2>

          <form onSubmit={handleLogin}>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="login-options">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />{" "}
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* 🔴 Error Message */}
            {error && (
              <div className="login-error">
                <p>{error}</p>
                <span onClick={() => navigate("/signup")}>
                  Don’t have an account? Sign up
                </span>
              </div>
            )}

            <p className="signup-link">
              Don't have an account?{" "}
              <span onClick={() => navigate("/signup")}>
                Sign Up
              </span>
            </p>

          </form>
        </div>

      </div>
    </div>
  );
}
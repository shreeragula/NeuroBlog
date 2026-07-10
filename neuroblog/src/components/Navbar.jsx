import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ showSearch = false, searchTerm = "", onSearchChange = null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [openMenu, setOpenMenu] = useState(null);
  const [profilePic, setProfilePic] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [dropdownPosts, setDropdownPosts] = useState([]);
  const [readPostIds, setReadPostIds] = useState(() => {
    try {
      const saved = localStorage.getItem("read_notification_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  /* ================= LOAD PROFILE PIC ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.profile_picture) {
          setProfilePic(data.profile_picture);
        }
      })
      .catch(err => console.error("Error loading user profile picture:", err));
  }, []);

  /* ================= FETCH NOTIFICATIONS ================= */
  const fetchNotifications = () => {
    fetch("http://localhost:8000/notifications/recent-posts")
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ================= CLOSE DROPDOWNS ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  const timeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)} hr ago`;
  };

  const activeNotifications = notifications.filter(post => !readPostIds.includes(post.id));

  return (
    <header className="global-navbar">
      <div className="navbar-logo">
        Neuroblog
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className="navbar-search-container">
          <input
            type="text"
            placeholder="Search blogs..."
            className="navbar-search-bar"
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
          <button className="navbar-search-btn" title="Search">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "16px", height: "16px" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation Buttons / Options */}
      <div className="navbar-icons" ref={menuRef}>
        <nav className="navbar-nav-links">
          <button 
            className={`nav-link-btn ${location.pathname === "/feed" ? "active" : ""}`}
            onClick={() => navigate("/feed")}
          >
            Feed
          </button>
          <button 
            className={`nav-link-btn ${location.pathname === "/create" ? "active" : ""}`}
            onClick={() => navigate("/create")}
          >
            + Create
          </button>
          <button 
            className={`nav-link-btn ${location.pathname === "/my_blogs" ? "active" : ""}`}
            onClick={() => navigate("/my_blogs")}
          >
            My Blogs
          </button>
        </nav>

        {/* Theme Toggle Button */}
        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Light/Dark Mode">
          {theme === "dark" ? (
            /* Sun SVG for switching to light mode */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            /* Moon SVG for switching to dark mode */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: "20px", height: "20px" }}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {/* Notification Bell */}
        <div className="navbar-notification-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="navbar-icon-svg"
            onClick={(e) => {
              e.stopPropagation();
              const nextState = openMenu === "notifications" ? null : "notifications";
              setOpenMenu(nextState);
              if (nextState === "notifications") {
                setDropdownPosts(activeNotifications);
                if (activeNotifications.length > 0) {
                  const activeIds = activeNotifications.map(post => post.id);
                  const updatedReadIds = Array.from(new Set([...readPostIds, ...activeIds]));
                  setReadPostIds(updatedReadIds);
                  localStorage.setItem("read_notification_ids", JSON.stringify(updatedReadIds));
                }
              }
            }}
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {activeNotifications.length > 0 && (
            <span className="navbar-notification-badge">{activeNotifications.length}</span>
          )}

          {openMenu === "notifications" && (
            <div className="navbar-notification-dropdown">
              <h4><b>Recent Posts</b></h4>
              {dropdownPosts.map((post) => (
                <div
                  key={post.id}
                  className="navbar-notification-item"
                  onClick={() => {
                    navigate(`/blog/${post.id}`);
                    setOpenMenu(null);
                  }}
                >
                  <p><strong>{post.title}</strong></p>
                  <small>by {post.username} • {timeAgo(post.timestamp)}</small>
                </div>
              ))}
              {dropdownPosts.length === 0 && (
                <p className="navbar-no-notifications">No recent posts</p>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="navbar-profile-wrapper">
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              className="navbar-profile-pic"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "profile" ? null : "profile");
              }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="navbar-icon-svg"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "profile" ? null : "profile");
              }}
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a8.38 8.38 0 0113 0" />
            </svg>
          )}

          {openMenu === "profile" && (
            <div className="navbar-profile-dropdown">
              <button onClick={() => { navigate("/profile"); setOpenMenu(null); }}>My Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

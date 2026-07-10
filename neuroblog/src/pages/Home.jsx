import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Zai from "../components/Zai";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  /* ================= SEARCH STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noMatches, setNoMatches] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ALL BLOGS ON MOUNT ================= */
  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/posts")
      .then(res => res.json())
      .then(data => {
        setAllBlogs(data);
        setBlogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  /* ================= DEBOUNCE LOGIC ================= */
  useEffect(() => {
    if (searchTerm !== debouncedSearch) {
      setIsSearching(true);
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  /* ================= SEARCH FILTER & SORT LOGIC ================= */
  useEffect(() => {
    if (!debouncedSearch) {
      setBlogs(allBlogs.map(b => ({ ...b, highlight: null })));
      setNoMatches(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    fetch(`http://127.0.0.1:8000/posts?search=${debouncedSearch}`)
      .then(res => res.json())
      .then(searchResults => {
        if (searchResults.length > 0) {
          setNoMatches(false);
          const matchedIds = new Set(searchResults.map(r => r.id));
          
          const matchingList = searchResults.map(s => {
            const original = allBlogs.find(b => b.id === s.id) || s;
            return { ...original, highlight: s.highlight };
          });

          const nonMatchingList = allBlogs
            .filter(b => !matchedIds.has(b.id))
            .map(b => ({ ...b, highlight: null }));

          setBlogs([...matchingList, ...nonMatchingList]);
        } else {
          // No matches: Keep all current blogs on screen and toggle warning notice
          setNoMatches(true);
          setBlogs(allBlogs.map(b => ({ ...b, highlight: null })));
        }
        setIsSearching(false);
      })
      .catch(err => {
        console.error(err);
        setIsSearching(false);
      });
  }, [debouncedSearch, allBlogs]);

  /* ================= 🔔 FETCH NOTIFICATIONS ================= */
  const fetchNotifications = () => {
    fetch("http://127.0.0.1:8000/notifications/recent-posts")
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ================= 3D CARD TILT PARALLAX EFFECT ================= */
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  };

  /* ================= JSX ================= */
  return (
    <div className="home-bg">
      <Navbar showSearch={true} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      {/* ================= MAIN CONTENT ================= */}
      <div className="main-content">
        <h1>Welcome to NeuroBlog</h1>
        <p>Discover ideas, craft stories, and inspire the world—one blog at a time.</p>

        <div className="content-wrapper">
          <div className="popular-blogs">
            <div className="blogs-header-wrapper">
              <div className="zai-mask-container">
                <Zai />
              </div>
              <h2>🔥 Blogs</h2>
            </div>

            {noMatches && (
              <p className="search-no-matches-text">
                No matching blogs found.
              </p>
            )}

            {loading ? (
              <p className="search-loading-text">
                Loading blogs...
              </p>
            ) : isSearching ? (
              <p className="search-loading-text">
                🔍 Searching...
              </p>
            ) : blogs.length === 0 ? (
              <p style={{ textAlign: "center", marginTop: "20px" }}>
                No blogs found.
              </p>
            ) : (
              blogs.map((blog, index) => {
                const imgMatch = blog.content.match(/<img[^>]+src="([^">]+)"/);
                const firstImage = imgMatch ? imgMatch[1] : null;
                const textOnly = blog.content.replace(/<img[^>]*>/g, "");

                return (
                  <div
                    key={blog.id}
                    className="home-blog-card"
                    onClick={() => navigate(`/blog/${blog.id}`)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ 
                      cursor: "pointer",
                      animationDelay: `${index * 50}ms`,
                      opacity: debouncedSearch && !blog.highlight ? 0.45 : 1,
                      transition: "opacity 0.4s ease"
                    }}
                  >
                    {firstImage && (
                      <div className="home-thumbnail">
                        <img src={firstImage} alt="thumbnail" style={{ filter: debouncedSearch && !blog.highlight ? "grayscale(40%)" : "none" }} />
                      </div>
                    )}

                    <div className="home-blog-content">
                      <h3>{blog.title}</h3>

                      <div
                        dangerouslySetInnerHTML={{
                          __html: blog.highlight || (textOnly.slice(0, 120) + "...")
                        }}
                      />

                      <small>
                        {blog.username} •{" "}
                        {new Date(blog.timestamp).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
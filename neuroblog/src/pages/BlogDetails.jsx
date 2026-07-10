import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./BlogDetails.css";

const EMOJIS = ["😊", "😂", "❤️", "😍", "👍", "🙌", "🔥", "👏", "🎉", "😮", "😢", "✨"];

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [allIds, setAllIds] = useState([]);

  /* ================= REACTION STATES ================= */
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  /* ================= COMMENT STATES ================= */
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  /* ✅ COMMENT COUNT STATE (NEW) */
  const [commentCount, setCommentCount] = useState(0);

  /* ✅ EDIT MODE STATE */
  const [editingId, setEditingId] = useState(null);

  /* ✅ CURRENT USER STATE & PIC */
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserPic, setCurrentUserPic] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    setCurrentUser(username);

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.profile_picture) {
          setCurrentUserPic(data.profile_picture);
        }
      })
      .catch(err => console.error("Error loading user profile picture:", err));
  }, []);

  // ================= FETCH BLOG =================
  useEffect(() => {
    fetch(`http://localhost:8000/posts/${id}`)
      .then(res => res.json())
      .then(data => setBlog(data))
      .catch(err => console.error(err));
  }, [id]);

  // ================= FETCH IDS =================
  useEffect(() => {
    fetch("http://localhost:8000/posts/ids")
      .then(res => res.json())
      .then(data => setAllIds(data))
      .catch(err => console.error(err));
  }, []);

  // ================= FETCH REACTIONS =================
  const fetchReactions = () => {
    fetch(`http://localhost:8000/posts/${id}/reactions`)
      .then(res => res.json())
      .then(data => {
        setLikes(data.likes);
        setDislikes(data.dislikes);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReactions();
  }, [id]);

  // ================= FETCH COMMENTS =================
  const fetchComments = () => {
    fetch(`http://localhost:8000/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // ✅ ================= FETCH COMMENT COUNT (NEW) =================
  const fetchCommentCount = () => {
    fetch(`http://localhost:8000/posts/${id}/comments/count`)
      .then(res => res.json())
      .then(data => setCommentCount(data.count))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCommentCount();
  }, [id]);

  // ================= LIKE =================
  const handleLike = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/posts/${id}/react?is_like=true`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchReactions();
  };

  // ================= DISLIKE =================
  const handleDislike = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/posts/${id}/react?is_like=false`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchReactions();
  };

  // ================= ADD COMMENT =================
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/posts/${id}/comments?content=${encodeURIComponent(newComment)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setNewComment("");
    fetchComments();
    fetchCommentCount(); // ✅ update count after adding
  };

  const handleAddEmoji = (emoji) => {
    setNewComment(prev => prev + emoji);
  };

  // ================= DELETE COMMENT =================
  const handleDelete = async (commentId) => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/comments/${commentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchComments();
    fetchCommentCount(); // ✅ update count after delete
  };

  // ================= UPDATE COMMENT =================
  const handleUpdate = async (commentId) => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/comments/${commentId}?content=${encodeURIComponent(newComment)}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setEditingId(null);
    setNewComment("");
    fetchComments();
  };

  // ================= NAVIGATION =================
  const currentIndex = allIds.indexOf(parseInt(id));
  const isFirstBlog = currentIndex === 0; // oldest blog
  const isLastBlog = currentIndex === allIds.length - 1; // newest blog

  const goLeft = () => {
    // Left arrow goes to new blog: currentIndex + 1
    if (!isLastBlog) {
      navigate(`/blog/${allIds[currentIndex + 1]}`);
    }
  };

  const goRight = () => {
    // Right arrow goes to old blog: currentIndex - 1
    if (!isFirstBlog) {
      navigate(`/blog/${allIds[currentIndex - 1]}`);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goLeft();
      if (e.key === "ArrowRight") goRight();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, allIds]);

  if (!blog) return <div>Loading...</div>;

  return (
    <div style={{ background: "linear-gradient(to bottom, #2c3e50, #34495e)", minHeight: "100vh" }}>
      <Navbar />
      <div className="blog-details-container" style={{ minHeight: "calc(100vh - 70px)", padding: "20px" }}>
        <button 
          className={`arrow left-arrow ${isLastBlog ? "disabled" : ""}`} 
          onClick={goLeft}
          disabled={isLastBlog}
        >
          ←
        </button>

        <button
          className={`arrow right-arrow ${isFirstBlog ? "disabled" : ""}`}
          onClick={goRight}
          disabled={isFirstBlog}
        >
          →
        </button>

        <div className="blog-details-card" style={{ position: "relative" }}>
          <button 
            className="blog-details-close-btn" 
            onClick={() => navigate("/feed")}
            title="Exit blog details"
          >
            ✖
          </button>
          <h1>{blog.title}</h1>

        <div className="blog-meta">
          {blog.username} • {new Date(blog.timestamp).toLocaleDateString()}
        </div>

        <hr />

        <div
          className="blog-full-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* LIKE / DISLIKE */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleLike}>👍 {likes}</button>
          <button onClick={handleDislike} style={{ marginLeft: "10px" }}>
            👎 {dislikes}
          </button>
        </div>

        {/* COMMENTS CONTAINER */}
        <div className="comments-section-container">
          <h3 className="comments-section-title">
            💬 Comments ({commentCount})
          </h3>

          {/* ADD COMMENT ROW */}
          <div className="add-comment-wrapper">
            <img
              src={currentUserPic || "https://via.placeholder.com/40"}
              alt="Current user avatar"
              className="user-comment-avatar"
            />
            <div className="add-comment-fields">
              <div className="add-comment-input-row">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder="Add a public comment..."
                  className="add-comment-input"
                />
                <button
                  onClick={handleAddComment}
                  className="add-comment-post-btn"
                >
                  Comment
                </button>
              </div>

              {/* EMOJI BAR */}
              <div className="emoji-picker-row">
                {EMOJIS.map((emoji) => (
                  <span
                    key={emoji}
                    className="emoji-item"
                    onClick={() => handleAddEmoji(emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* COMMENTS LIST */}
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img
                  src={comment.profile_picture || "https://via.placeholder.com/40"}
                  alt={`${comment.username}'s avatar`}
                  className="commenter-avatar"
                />
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">{comment.username}</span>
                    <span className="comment-time">
                      {comment.created_at
                        ? new Date(comment.created_at).toLocaleDateString()
                        : "Just now"}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <div className="edit-comment-wrapper">
                      <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleUpdate(comment.id);
                          }
                        }}
                        className="edit-comment-input"
                      />
                      <div className="edit-comment-actions">
                        <button
                          onClick={() => handleUpdate(comment.id)}
                          className="save-edit-btn"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setNewComment("");
                          }}
                          className="cancel-edit-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="comment-text">{comment.content}</p>
                      
                      <div className="comment-actions">
                        {comment.username === currentUser && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(comment.id);
                                setNewComment(comment.content);
                              }}
                              className="comment-action-btn edit"
                            >
                              Edit
                            </button>
                            <span className="bullet-sep">•</span>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="comment-action-btn delete"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="no-comments-msg">No comments yet. Start the conversation!</p>
            )}
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
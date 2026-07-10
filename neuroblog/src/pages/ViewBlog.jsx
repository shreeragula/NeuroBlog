import React, { useEffect, useState, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import Navbar from "../components/Navbar";
import "quill/dist/quill.snow.css";
import "./ViewBlog.css";

// ================= QUILL TOOLBAR =================
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["clean"]
  ],
  imageResize: {
    parchment: Quill.import("parchment"),
    modules: ["Resize", "DisplaySize", "Toolbar"]
  }
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "align",
  "list",
  "indent",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video"
];

// ================= ADD TOOLTIP TOOLBAR UTILITY =================
const addToolbarTooltips = (container) => {
  if (!container) return;
  const toolbar = container.querySelector(".ql-toolbar");
  if (!toolbar) return;

  const tooltipMap = {
    ".ql-bold": "Bold",
    ".ql-italic": "Italic",
    ".ql-underline": "Underline",
    ".ql-strike": "Strikethrough",
    ".ql-blockquote": "Blockquote",
    ".ql-code-block": "Code Block",
    ".ql-link": "Insert Link",
    ".ql-image": "Insert Image",
    ".ql-video": "Insert Video",
    ".ql-clean": "Clear Formatting",
    '.ql-list[value="ordered"]': "Ordered List",
    '.ql-list[value="bullet"]': "Bullet List",
    '.ql-indent[value="-1"]': "Decrease Indent",
    '.ql-indent[value="+1"]': "Increase Indent",
    '.ql-script[value="sub"]': "Subscript",
    '.ql-script[value="super"]': "Superscript",
    ".ql-picker.ql-header": "Heading Styles",
    ".ql-picker.ql-font": "Font Family",
    ".ql-picker.ql-size": "Font Size",
    ".ql-picker.ql-color": "Text Color",
    ".ql-picker.ql-background": "Background Color",
    ".ql-picker.ql-align": "Text Alignment"
  };

  Object.entries(tooltipMap).forEach(([selector, text]) => {
    const els = toolbar.querySelectorAll(selector);
    els.forEach(el => {
      if (el && !el.hasAttribute("title")) {
        el.setAttribute("title", text);
      }
    });
  });
};

export default function ViewBlog() {

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [selectedImgEl, setSelectedImgEl] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 15, y: 15, w: 70, h: 70 });
  const quillRef = useRef(null);

  // CUSTOM DIALOG STATE
  const [customDialog, setCustomDialog] = useState({
    isOpen: false,
    type: "alert",
    message: "",
    onConfirm: null,
    onCancel: null
  });

  // COMMENTS & LOGGED-IN USER DETAILS STATES
  const [currentUser, setCurrentUser] = useState(null);
  const [modalComments, setModalComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  
  // REPLIES AND THREADING STATES
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});

  // Load current user details on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://127.0.0.1:8000/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCurrentUser(data))
        .catch(err => console.error(err));
    }
  }, []);

  // Sync comments whenever a selectedPost is opened in Modal
  const fetchModalComments = (postId) => {
    fetch(`http://127.0.0.1:8000/posts/${postId}/comments`)
      .then(res => res.json())
      .then(data => setModalComments(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (selectedPost) {
      fetchModalComments(selectedPost.id);
    } else {
      setModalComments([]);
    }
  }, [selectedPost]);

  const showCustomAlert = (msg) => {
    setCustomDialog({
      isOpen: true,
      type: "alert",
      message: msg,
      onConfirm: () => setCustomDialog(prev => ({ ...prev, isOpen: false }))
    });
  };

  const showCustomConfirm = (msg, onConfirmAction) => {
    setCustomDialog({
      isOpen: true,
      type: "confirm",
      message: msg,
      onConfirm: () => {
        onConfirmAction();
        setCustomDialog(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setCustomDialog(prev => ({ ...prev, isOpen: false }))
    });
  };

  // ================= CROP WORKSPACE MOUSE DRAGGING =================
  const handleCropDragStart = (e, action) => {
    e.preventDefault();
    const workspace = document.querySelector(".crop-image-container");
    if (!workspace) return;

    const rect = workspace.getBoundingClientRect();
    const containerW = rect.width;
    const containerH = rect.height;

    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = { ...cropRect };

    const handleMouseMove = (moveEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / containerW) * 100;
      const deltaY = ((moveEvent.clientY - startY) / containerH) * 100;

      if (action === "move") {
        setCropRect({
          ...startRect,
          x: Math.max(0, Math.min(100 - startRect.w, startRect.x + deltaX)),
          y: Math.max(0, Math.min(100 - startRect.h, startRect.y + deltaY))
        });
      } else if (action === "resize") {
        setCropRect({
          ...startRect,
          w: Math.max(10, Math.min(100 - startRect.x, startRect.w + deltaX)),
          h: Math.max(10, Math.min(100 - startRect.y, startRect.h + deltaY))
        });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // ================= APPLY CROP AND SYNC WITH QUILL =================
  const handleApplyCrop = () => {
    if (!selectedImgEl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedImgEl.src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const sx = (cropRect.x / 100) * img.naturalWidth;
      const sy = (cropRect.y / 100) * img.naturalHeight;
      const sw = (cropRect.w / 100) * img.naturalWidth;
      const sh = (cropRect.h / 100) * img.naturalHeight;

      canvas.width = sw;
      canvas.height = sh;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      try {
        const croppedDataUrl = canvas.toDataURL("image/png");
        selectedImgEl.src = croppedDataUrl;

        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.update();
          setEditContent(editor.root.innerHTML);
        }
      } catch (err) {
        console.error("Failed to crop image (canvas tainted?):", err);
        showCustomAlert("Sorry, unable to crop this image due to cross-origin security restrictions.");
      }

      setShowCropModal(false);
      setSelectedImgEl(null);
    };

    img.onerror = () => {
      showCustomAlert("Failed to load image for cropping.");
      setShowCropModal(false);
    };
  };

  // ================= IMAGE SELECTION & CLICK DETECTOR =================
  useEffect(() => {
    const handleEditorClick = (e) => {
      if (e.target.tagName === "IMG" && e.target.closest(".ql-editor")) {
        setSelectedImgEl(e.target);
      } else {
        if (!e.target.closest(".crop-action-bar")) {
          setSelectedImgEl(null);
        }
      }
    };

    document.addEventListener("click", handleEditorClick);
    return () => document.removeEventListener("click", handleEditorClick);
  }, []);

  // ================= RENDER TOOLBAR HOVER TOOLTIPS =================
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        const editorEl = document.querySelector(".blog-editor");
        addToolbarTooltips(editorEl);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  // ================= FETCH POSTS =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:8000/my-posts", {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(post => ({
          id: post.id,
          title: post.title || "Untitled",
          author: post.username,
          date: post.timestamp
            ? new Date(post.timestamp).toLocaleDateString()
            : "No date",
          content: post.content,
          likesCount: post.likes_count || 0,
          dislikesCount: post.dislikes_count || 0,
          commentsCount: post.comments_count || 0
        }));

        setPosts(formatted);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

  }, []);

  // ================= UPDATE BLOG =================
  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/posts/${editingPost.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({
            title: editTitle,
            content: editContent
          })
        }
      );

      const updatedPost = await response.json();

      const updatedFormatted = {
        id: updatedPost.id,
        title: updatedPost.title,
        author: updatedPost.username,
        date: updatedPost.timestamp
          ? new Date(updatedPost.timestamp).toLocaleDateString()
          : "No date",
        content: updatedPost.content
      };

      setPosts(posts.map(p =>
        p.id === updatedFormatted.id ? updatedFormatted : p
      ));

      setIsEditing(false);
      setEditingPost(null);
      setSelectedPost(updatedFormatted);

    } catch (error) {
      console.error(error);
    }
  };

  const handleUndo = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.history.undo();
    }
  };

  const handleRedo = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.history.redo();
    }
  };

  // ================= DELETE BLOG =================
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    showCustomConfirm("Delete this blog?", async () => {
      try {
        await fetch(`http://127.0.0.1:8000/posts/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": "Bearer " + token
          }
        });

        setPosts(posts.filter(post => post.id !== id));
        setSelectedPost(null);

      } catch (error) {
        console.error(error);
      }
    });
  };

  // ================= ADD COMMENT (MODAL) =================
  const handleModalAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    const token = localStorage.getItem("token");

    await fetch(
      `http://127.0.0.1:8000/posts/${selectedPost.id}/comments?content=${encodeURIComponent(newComment)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setNewComment("");
    fetchModalComments(selectedPost.id);
    
    // Proactively refresh comments count in the cards list
    setPosts(prev => prev.map(p => 
      p.id === selectedPost.id ? { ...p, commentsCount: p.commentsCount + 1 } : p
    ));
  };

  const handleModalAddEmoji = (emoji) => {
    setNewComment(prev => prev + emoji);
  };

  // ================= DELETE COMMENT (MODAL) =================
  const handleModalDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");

    showCustomConfirm("Delete this comment?", async () => {
      const deletedComment = modalComments.find(c => c.id === commentId);
      const isTopLevel = deletedComment && !deletedComment.parent_id;

      await fetch(
        `http://127.0.0.1:8000/comments/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchModalComments(selectedPost.id);
      
      // Only decrement posts' commentsCount if the deleted comment is top-level
      if (isTopLevel) {
        setPosts(prev => prev.map(p => 
          p.id === selectedPost.id ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p
        ));
      }
    });
  };

  // ================= UPDATE COMMENT (MODAL) =================
  const handleModalUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    const token = localStorage.getItem("token");

    await fetch(
      `http://127.0.0.1:8000/comments/${commentId}?content=${encodeURIComponent(editCommentText)}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setEditingCommentId(null);
    setEditCommentText("");
    fetchModalComments(selectedPost.id);
  };

  // ================= ADD REPLY TO COMMENT (MODAL) =================
  const handleModalAddReply = async (parentId) => {
    if (!replyText.trim() || !selectedPost) return;
    const token = localStorage.getItem("token");

    await fetch(
      `http://127.0.0.1:8000/posts/${selectedPost.id}/comments?content=${encodeURIComponent(replyText)}&parent_id=${parentId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setReplyText("");
    setReplyingToId(null);
    fetchModalComments(selectedPost.id);
    setExpandedReplies(prev => ({ ...prev, [parentId]: true }));
  };

  const handleModalAddReplyEmoji = (emoji) => {
    setReplyText(prev => prev + emoji);
  };

  return (
    <div className="vb-bg">
      <Navbar />
      <div className="vb-content">
        <h1>My Blogs</h1>
        <p>You have {posts.length} blog(s)</p>

      {/* ================= VIEW TOGGLE ================= */}
      <div className="view-toggle">
        <button
          className={viewType === "grid" ? "active" : ""}
          onClick={() => setViewType("grid")}
        >
          ⬛ Box View
        </button>

        <button
          className={viewType === "list" ? "active" : ""}
          onClick={() => setViewType("list")}
        >
          📄 Line View
        </button>
      </div>

      {/* ================= BLOG LIST ================= */}
      {loading ? (
        <p className="status">Loading blogs...</p>
      ) : posts.length === 0 ? (
        <p className="status">No blogs created yet.</p>
      ) : (
        <div className={`blogs ${viewType}`}>
          {posts.map((blog) => {

            const imgMatch = blog.content.match(/<img[^>]+src="([^">]+)"/);
            const firstImage = imgMatch ? imgMatch[1] : null;
            const textOnly = blog.content.replace(/<img[^>]*>/g, "");

            return (
              <div
                key={blog.id}
                className="blog-card-box"
                onClick={() => {
                  setSelectedPost(blog);
                  setIsEditing(false);
                }}
              >
                {firstImage && (
                  <div className="box-image">
                    <img src={firstImage} alt="thumbnail" />
                  </div>
                )}

                <div className="box-content">
                  <h3>{blog.title}</h3>

                  <div
                    className="box-preview blog-content"
                    dangerouslySetInnerHTML={{
                      __html: textOnly.slice(0, 120) + "..."
                    }}
                  />

                  <div className="blog-meta">
                    {blog.author} • {blog.date}
                  </div>

                  <div className="blog-card-stats">
                    <span>👍 {blog.likesCount}</span>
                    <span>👎 {blog.dislikesCount}</span>
                    <span>💬 {blog.commentsCount} comments</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {selectedPost && (
        <div className="modal">
          <div className="modal-content">

            <button
              className="close-btn"
              onClick={() => {
                setSelectedPost(null);
                setIsEditing(false);
              }}
            >
              ✖
            </button>

            {isEditing ? (
              <div className="edit-form">
                <label>Title</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />

                <div className="editor-panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", marginTop: "12px" }}>
                  <label style={{ margin: 0, fontWeight: "bold" }}>Content</label>
                  <div className="editor-controls" style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={handleUndo} className="control-btn" title="Undo (last change)" style={{ padding: "4px 12px", fontSize: "1rem", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                      ↩
                    </button>
                    <button type="button" onClick={handleRedo} className="control-btn" title="Redo (last change)" style={{ padding: "4px 12px", fontSize: "1rem", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                      ↪
                    </button>
                  </div>
                </div>

                {/* Floating Action Bar when image is selected */}
                {selectedImgEl && (
                  <div className="crop-action-bar" style={{ margin: "10px 0" }}>
                    <span>Selected Image: 📷 </span>
                    <button onClick={() => {
                      setCropRect({ x: 15, y: 15, w: 70, h: 70 });
                      setShowCropModal(true);
                    }}>Crop Image</button>
                    <button 
                      onClick={() => {
                        showCustomConfirm("Remove this image from your post?", () => {
                          selectedImgEl.remove();
                          if (quillRef.current) {
                            const editor = quillRef.current.getEditor();
                            editor.update();
                            setEditContent(editor.root.innerHTML);
                          }
                          setSelectedImgEl(null);
                        });
                      }}
                      className="delete-img-btn"
                      style={{ backgroundColor: "#ff4d6d", color: "#fff", marginLeft: "8px" }}
                    >
                      Delete Image
                    </button>
                  </div>
                )}

                {/* 🔥 REPLACED TEXTAREA WITH REACTQUILL */}
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editContent}
                  onChange={setEditContent}
                  modules={modules}
                  formats={formats}
                  className="blog-editor"
                />

                <div className="actions">
                  <button onClick={handleUpdate}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2>{selectedPost.title}</h2>

                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedPost.content
                  }}
                />

                <div className="blog-meta">
                  {selectedPost.author} • {selectedPost.date}
                </div>

                <div className="actions">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingPost(selectedPost);
                      setEditTitle(selectedPost.title);
                      setEditContent(selectedPost.content);
                    }}
                  >
                    Edit
                  </button>

                  <button onClick={() => handleDelete(selectedPost.id)}>
                    Delete
                  </button>
                </div>

                {/* YouTube Style Comments Section */}
                <div className="comments-section-container" style={{ marginTop: "2.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "2rem" }}>
                  <h3 className="comments-section-title" style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1.5rem", color: "#ff758c" }}>
                    💬 Comments ({modalComments.length})
                  </h3>

                  {/* Add comment */}
                  <div className="add-comment-wrapper" style={{ display: "flex", gap: "12px", marginBottom: "2rem" }}>
                    <img
                      src={currentUser?.profile_picture || "https://via.placeholder.com/40"}
                      alt="User profile"
                      className="user-comment-avatar"
                      style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div className="add-comment-fields" style={{ flex: 1 }}>
                      <div className="add-comment-input-row" style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleModalAddComment();
                            }
                          }}
                          placeholder="Add a public comment..."
                          className="add-comment-input"
                          rows="1"
                          style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", resize: "none", outline: "none", fontSize: "0.95rem", padding: "6px 0", transition: "border-bottom 0.3s" }}
                          onFocus={(e) => e.target.style.borderBottom = "2px solid #ff758c"}
                          onBlur={(e) => e.target.style.borderBottom = "1px solid rgba(255,255,255,0.2)"}
                        />
                        <button
                          onClick={handleModalAddComment}
                          className="add-comment-post-btn"
                          style={{ background: "linear-gradient(135deg, #ff758c, #ff7eb3)", border: "none", padding: "8px 16px", borderRadius: "20px", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
                        >
                          Comment
                        </button>
                      </div>

                      {/* Emoji Quick Selection Bar */}
                      <div className="emoji-bar" style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        {["😀", "😍", "🔥", "👏", "💡", "❤️", "🚀", "😂"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleModalAddEmoji(emoji)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "2px" }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comments list */}
                  <div className="comments-list" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {modalComments.filter(c => !c.parent_id).map((comment) => {
                      const repliesForComment = modalComments.filter(c => c.parent_id === comment.id);

                      return (
                        <div key={comment.id} className="comment-item" style={{ display: "flex", gap: "12px", width: "100%", flexDirection: "column" }}>
                          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                            <img
                              src={comment.profile_picture || "https://via.placeholder.com/40"}
                              alt={`${comment.username}'s avatar`}
                              className="commenter-avatar"
                              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                            />
                            <div className="comment-body" style={{ flex: 1 }}>
                              <div className="comment-header" style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px", fontSize: "0.85rem" }}>
                                <span className="comment-author" style={{ fontWeight: "700", color: "#fff" }}>{comment.username}</span>
                                <span className="comment-time" style={{ color: "#aaa" }}>
                                  {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : ""}
                                </span>
                              </div>

                              {editingCommentId === comment.id ? (
                                <div className="edit-comment-wrapper" style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                                  <textarea
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className="edit-comment-input"
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", padding: "8px", fontSize: "0.9rem", outline: "none", resize: "none" }}
                                  />
                                  <div className="edit-comment-actions" style={{ display: "flex", gap: "8px" }}>
                                    <button
                                      onClick={() => handleModalUpdateComment(comment.id)}
                                      style={{ background: "#ff758c", border: "none", padding: "5px 12px", borderRadius: "12px", color: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600" }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "5px 12px", borderRadius: "12px", color: "#fff", cursor: "pointer", fontSize: "0.8rem" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="comment-text" style={{ fontSize: "0.95rem", color: "#ddd", margin: "4px 0", lineHeight: "1.4", wordBreak: "break-word" }}>{comment.content}</p>
                                  
                                  <div className="comment-actions" style={{ display: "flex", gap: "12px", marginTop: "6px", alignItems: "center" }}>
                                    <button
                                      onClick={() => {
                                        setReplyingToId(replyingToId === comment.id ? null : comment.id);
                                        setReplyText("");
                                      }}
                                      className="comment-action-btn reply"
                                      style={{ background: "transparent", border: "none", color: "#ff758c", cursor: "pointer", fontSize: "0.8rem", padding: 0, fontWeight: "600" }}
                                    >
                                      Reply
                                    </button>

                                    {comment.username === currentUser?.username && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(comment.id);
                                            setEditCommentText(comment.content);
                                          }}
                                          className="comment-action-btn edit"
                                          style={{ background: "transparent", border: "none", color: "#ff758c", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleModalDeleteComment(comment.id)}
                                          className="comment-action-btn delete"
                                          style={{ background: "transparent", border: "none", color: "#ff4d6d", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
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

                          {/* Reply Box Inline Input */}
                          {replyingToId === comment.id && (
                            <div className="add-reply-wrapper" style={{ display: "flex", gap: "10px", marginTop: "6px", marginLeft: "48px", paddingLeft: "10px", borderLeft: "2px solid rgba(255, 117, 140, 0.3)" }}>
                              <img
                                src={currentUser?.profile_picture || "https://via.placeholder.com/40"}
                                alt="User profile"
                                style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleModalAddReply(comment.id);
                                      }
                                    }}
                                    placeholder="Reply to this comment..."
                                    rows="1"
                                    style={{ flex: 1, background: "transparent", border: "none", borderBottom: "1px solid rgba(255, 255, 255, 0.2)", color: "#fff", resize: "none", outline: "none", fontSize: "0.9rem", padding: "4px 0" }}
                                  />
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button
                                      onClick={() => handleModalAddReply(comment.id)}
                                      style={{ background: "linear-gradient(135deg, #ff758c, #ff7eb3)", border: "none", padding: "6px 12px", borderRadius: "15px", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "0.75rem" }}
                                    >
                                      Reply
                                    </button>
                                    <button
                                      onClick={() => setReplyingToId(null)}
                                      style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "6px 12px", borderRadius: "15px", color: "#fff", cursor: "pointer", fontSize: "0.75rem" }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                                {/* Emoji Quick Selection Bar for reply */}
                                <div className="emoji-bar" style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                                  {["😀", "😍", "🔥", "👏", "💡", "❤️", "🚀", "😂"].map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => handleModalAddReplyEmoji(emoji)}
                                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", padding: "2px" }}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Collapsible Replies List */}
                          {repliesForComment.length > 0 && (
                            <div style={{ marginLeft: "48px", marginTop: "4px" }}>
                              <button
                                onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                style={{ background: "transparent", border: "none", color: "#ff758c", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}
                              >
                                {expandedReplies[comment.id] ? "▼ Hide" : `▶ View ${repliesForComment.length} ${repliesForComment.length === 1 ? "reply" : "replies"}`}
                              </button>
                              
                              {expandedReplies[comment.id] && (
                                <div className="replies-list" style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "12px", paddingLeft: "15px", borderLeft: "2px solid rgba(255, 117, 140, 0.2)" }}>
                                  {repliesForComment.map(reply => (
                                    <div key={reply.id} style={{ display: "flex", gap: "10px" }}>
                                      <img
                                        src={reply.profile_picture || "https://via.placeholder.com/40"}
                                        alt={`${reply.username}'s avatar`}
                                        style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                                      />
                                      <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "2px", fontSize: "0.8rem" }}>
                                          <span style={{ fontWeight: "700", color: "#fff" }}>{reply.username}</span>
                                          <span style={{ color: "#aaa" }}>
                                            {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : ""}
                                          </span>
                                        </div>
                                        
                                        {editingCommentId === reply.id ? (
                                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                                            <textarea
                                              value={editCommentText}
                                              onChange={(e) => setEditCommentText(e.target.value)}
                                              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", padding: "8px", fontSize: "0.85rem", outline: "none", resize: "none" }}
                                            />
                                            <div style={{ display: "flex", gap: "8px" }}>
                                              <button
                                                onClick={() => handleModalUpdateComment(reply.id)}
                                                style={{ background: "#ff758c", border: "none", padding: "4px 10px", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "0.75rem", fontWeight: "600" }}
                                              >
                                                Save
                                              </button>
                                              <button
                                                onClick={() => setEditingCommentId(null)}
                                                style={{ background: "rgba(255,255,255,0.1)", border: "none", padding: "4px 10px", borderRadius: "10px", color: "#fff", cursor: "pointer", fontSize: "0.75rem" }}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <p style={{ fontSize: "0.9rem", color: "#ddd", margin: "2px 0", lineHeight: "1.35", wordBreak: "break-word" }}>{reply.content}</p>
                                            <div className="comment-actions" style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                                              {reply.username === currentUser?.username && (
                                                <>
                                                  <button
                                                    onClick={() => {
                                                      setEditingCommentId(reply.id);
                                                      setEditCommentText(reply.content);
                                                    }}
                                                    style={{ background: "transparent", border: "none", color: "#ff758c", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}
                                                  >
                                                    Edit
                                                  </button>
                                                  <button
                                                    onClick={() => handleModalDeleteComment(reply.id)}
                                                    style={{ background: "transparent", border: "none", color: "#ff4d6d", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}
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
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {modalComments.length === 0 && (
                      <p className="no-comments-msg" style={{ textAlign: "center", color: "#888", fontSize: "0.9rem", marginTop: "1rem" }}>
                        No comments yet on this blog.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* Crop Workspace Modal */}
      {showCropModal && selectedImgEl && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <h3>📷 Crop Image Workspace</h3>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#ccc" }}>
              Drag the dashed box to position, and drag the corner handle at the bottom-right to resize.
            </p>
            <div className="crop-workspace">
              <div className="crop-image-container">
                <img
                  src={selectedImgEl.src}
                  className="crop-image"
                  alt="Crop preview"
                />
                <div
                  className="crop-box"
                  style={{
                    left: `${cropRect.x}%`,
                    top: `${cropRect.y}%`,
                    width: `${cropRect.w}%`,
                    height: `${cropRect.h}%`,
                  }}
                  onMouseDown={(e) => handleCropDragStart(e, "move")}
                >
                  <div
                    className="crop-handle"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleCropDragStart(e, "resize");
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="crop-modal-actions">
              <button
                className="crop-modal-btn cancel"
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedImgEl(null);
                }}
              >
                Cancel
              </button>
              <button className="crop-modal-btn apply" onClick={handleApplyCrop}>
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Dialog Alert / Confirm Modals */}
      {customDialog.isOpen && (
        <div className="custom-dialog-overlay">
          <div className="custom-dialog">
            <h3>{customDialog.type === "confirm" ? "❓ Confirmation" : "ℹ️ Notification"}</h3>
            <p className="custom-dialog-msg">{customDialog.message}</p>
            <div className="custom-dialog-actions">
              {customDialog.type === "confirm" && (
                <button className="custom-dialog-btn cancel" onClick={customDialog.onCancel}>
                  Cancel
                </button>
              )}
              <button className="custom-dialog-btn confirm" onClick={customDialog.onConfirm}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
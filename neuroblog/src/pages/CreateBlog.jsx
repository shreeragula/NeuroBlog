import React, { useState, useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import Navbar from "../components/Navbar";
import "quill/dist/quill.snow.css";
import "./CreateBlog.css";

// ================= ADVANCED TOOLBAR =================
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

// ================= LLM FUNCTION =================
async function sendPromptToLLM(prompt) {
  const response = await fetch("http://127.0.0.1:8000/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate blog");
  }

  const data = await response.json();
  return data.generated_text || "No response from LLM";
}

export default function CreateBlog() {

  const quillRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [publishMsg, setPublishMsg] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // DRAFT / FULLSCREEN STATES
  const [draftTime, setDraftTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // IMAGE CROP STATES
  const [selectedImgEl, setSelectedImgEl] = useState(null);
  const [draggedImgEl, setDraggedImgEl] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropRect, setCropRect] = useState({ x: 15, y: 15, w: 70, h: 70 }); // in percentages

  // CUSTOM DIALOG STATE
  const [customDialog, setCustomDialog] = useState({
    isOpen: false,
    type: "alert",
    message: "",
    onConfirm: null,
    onCancel: null
  });

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

  // AI STATES
  const [prompt, setPrompt] = useState("");
  const [generatedBlog, setGeneratedBlog] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // ================= FETCH USER POSTS =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:8000/my-posts", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        const latestOne = data.slice(0, 1);

        const formatted = latestOne.map(post => ({
          id: post.id,
          title: post.title || "Untitled",
          author: post.username,
          date: post.timestamp
            ? new Date(post.timestamp).toLocaleDateString()
            : "No date",
          content: post.content
        }));

        setBlogs(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  // ================= CORE METRICS BAR CALCULATIONS =================
  useEffect(() => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || "";

    const chars = text.length;
    setCharCount(chars);

    const words = text.trim().length === 0
      ? 0
      : text.trim().split(/\s+/).length;
    setWordCount(words);

    const time = Math.ceil(words / 200);
    setReadingTime(words === 0 ? 0 : time);
  }, [content]);

  // ================= DRAFT AUTOSAVE LOGIC =================
  useEffect(() => {
    // Autosave local storage timer
    if (!title.trim() && (!content.trim() || content === "<p><br></p>")) {
      return;
    }
    const timer = setTimeout(() => {
      const now = new Date();
      const draft = {
        draftTitle: title,
        draftContent: content,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      localStorage.setItem("neuroblog_draft", JSON.stringify(draft));
      setDraftTime(draft.timestamp);
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content]);

  const handleClearDraft = () => {
    showCustomConfirm("Are you sure you want to clear current draft and editor?", () => {
      setTitle("");
      setContent("");
      localStorage.removeItem("neuroblog_draft");
      setDraftTime("");
    });
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



  // ================= IMAGE SELECTION & CLICK DETECTOR =================
  useEffect(() => {
    const handleEditorClick = (e) => {
      // Check if clicking an image inside the editor container
      if (e.target.tagName === "IMG" && e.target.closest(".ql-editor")) {
        setSelectedImgEl(e.target);
      } else {
        // Clear selection if clicking outside the image or crop buttons
        if (!e.target.closest(".crop-action-bar") && !e.target.closest(".crop-modal")) {
          setSelectedImgEl(null);
        }
      }
    };

    document.addEventListener("click", handleEditorClick);
    return () => document.removeEventListener("click", handleEditorClick);
  }, []);

  // ================= RENDER TOOLBAR HOVER TOOLTIPS =================
  useEffect(() => {
    const timer = setTimeout(() => {
      const editorEl = document.querySelector(".blog-editor");
      addToolbarTooltips(editorEl);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // ================= COORDINATE TRANSLATION TO QUILL INDEX =================
  const getQuillIndexFromPoint = (editor, clientX, clientY) => {
    let range;
    let textNode;
    let offset;

    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(clientX, clientY);
      if (!range) return null;
      textNode = range.startContainer;
      offset = range.startOffset;
    } else if (document.caretPositionFromPoint) {
      range = document.caretPositionFromPoint(clientX, clientY);
      if (!range) return null;
      textNode = range.offsetNode;
      offset = range.offset;
    } else {
      return null;
    }

    let blot = Quill.find(textNode);
    if (!blot) {
      blot = Quill.find(textNode.parentElement);
    }

    if (blot) {
      return blot.offset(editor.scroll) + offset;
    }
    return null;
  };

  // ================= DRAG AND DROP REPOSITIONING =================
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const editorEl = editor.root; // the contenteditable .ql-editor element
    let lastDragIndex = null;

    const handleDragStart = (e) => {
      if (e.target.tagName === "IMG") {
        setDraggedImgEl(e.target);
        e.dataTransfer.setData("text/plain", e.target.src);
        e.dataTransfer.effectAllowed = "move";
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      // Move typing cursor to drag coordinates to show visual drop target
      const dropIndex = getQuillIndexFromPoint(editor, e.clientX, e.clientY);
      if (dropIndex !== null && dropIndex !== lastDragIndex) {
        lastDragIndex = dropIndex;
        editor.setSelection(dropIndex, 0);
      }
    };

    const handleDrop = (e) => {
      if (!draggedImgEl) return;
      e.preventDefault();

      let dropIndex = getQuillIndexFromPoint(editor, e.clientX, e.clientY);
      if (dropIndex === null) {
        // Fallback: insert at the very end of editor if dropped in empty spacing
        dropIndex = editor.getLength() - 1;
      }

      const imgBlot = Quill.find(draggedImgEl);
      if (imgBlot) {
        const oldIndex = imgBlot.offset(editor.scroll);
        // Delete image from its old index
        editor.deleteText(oldIndex, 1);
        
        // Adjust drop index if the old location was before the drop location
        const adjustedDropIndex = dropIndex > oldIndex ? dropIndex - 1 : dropIndex;

        // Insert the image blot at the new cursor index
        editor.insertEmbed(adjustedDropIndex, "image", draggedImgEl.src);
        editor.setSelection(adjustedDropIndex + 1);
        setContent(editor.root.innerHTML);
      }
      setDraggedImgEl(null);
      setSelectedImgEl(null);
      lastDragIndex = null;
    };

    editorEl.addEventListener("dragstart", handleDragStart);
    editorEl.addEventListener("dragover", handleDragOver);
    editorEl.addEventListener("drop", handleDrop);

    return () => {
      editorEl.removeEventListener("dragstart", handleDragStart);
      editorEl.removeEventListener("dragover", handleDragOver);
      editorEl.removeEventListener("drop", handleDrop);
    };
  }, [draggedImgEl]);

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
    img.crossOrigin = "anonymous"; // prevent tainted canvas for remote URLs
    img.src = selectedImgEl.src;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Calculate pixel coordinates on natural image size
      const sx = (cropRect.x / 100) * img.naturalWidth;
      const sy = (cropRect.y / 100) * img.naturalHeight;
      const sw = (cropRect.w / 100) * img.naturalWidth;
      const sh = (cropRect.h / 100) * img.naturalHeight;

      canvas.width = sw;
      canvas.height = sh;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      try {
        const croppedDataUrl = canvas.toDataURL("image/png");
        // Update DOM element directly
        selectedImgEl.src = croppedDataUrl;

        // Force Quill editor state synchronization
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.update();
          // Trigger ReactQuill's onChange with updated content
          setContent(editor.root.innerHTML);
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

  // ================= DISTRACTION-FREE FULLSCREEN =================
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ================= AI GENERATE =================
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoadingAI(true);
    setGeneratedBlog("");

    try {
      const generatedText = await sendPromptToLLM(prompt);
      setGeneratedBlog(generatedText);
    } catch (error) {
      console.error("Generation failed", error);
      setGeneratedBlog("❌ Failed to generate blog");
    }

    setLoadingAI(false);
  };

  // ================= PUBLISH =================
  async function handlePublish() {
    if (!title.trim()) {
      setPublishMsg("❌ Please enter a title");
      return;
    }

    if (!content.trim() || content === "<p><br></p>") {
      setPublishMsg("❌ Please write your blog before publishing!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPublishMsg("❌ You must login first.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const savedPost = await response.json();

      const newBlog = {
        id: savedPost.id,
        title: savedPost.title || "Untitled",
        author: savedPost.username,
        date: savedPost.timestamp
          ? new Date(savedPost.timestamp).toLocaleDateString()
          : "No date",
        content: savedPost.content
      };

      setBlogs([newBlog]);

      setPublishMsg("🎉 Blog published successfully!");
      setTitle("");
      setContent("");
      localStorage.removeItem("neuroblog_draft");
      setDraftTime("");

      setTimeout(() => setPublishMsg(""), 3000);

    } catch (err) {
      console.error(err);
      setPublishMsg("❌ Failed to publish blog");
    }
  }

  // ================= UI =================
  return (
    <div className="create-bg">
      {!isFullscreen && <Navbar />}
      <div className={`create-page ${isFullscreen ? "fullscreen-active" : ""}`}>
        <div className="create-wrapper">
        <div className="create-grid">

          {/* LEFT SIDE - PROFESSIONAL EDITOR */}
          <div className="manual-section">
            
            {/* Editor Header Toolbar Panel */}
            <div className="editor-panel-header">
              <div className="editor-controls">
                <button onClick={handleUndo} className="control-btn" title="Undo (last change)">
                  ↩
                </button>
                <button onClick={handleRedo} className="control-btn" title="Redo (last change)">
                  ↪
                </button>
                <button onClick={toggleFullscreen} className="control-btn" title="Distraction-free fullscreen writing mode">
                  {isFullscreen ? "🗖 Exit Fullscreen" : "🗖 Fullscreen Mode"}
                </button>
                <button onClick={handleClearDraft} className="control-btn clear-btn" title="Clear all text in editor">
                  🧹 Clear Canvas
                </button>
              </div>
            </div>

            {/* Floating Crop Action Bar when image is selected */}
            {selectedImgEl && (
              <div className="crop-action-bar">
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
                        setContent(editor.root.innerHTML);
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

            <input
              className="title-input"
              placeholder="Enter blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="blog-editor"
              placeholder="Start drafting your masterpiece... Add moving images (GIFs) or video embed links using the toolbar options."
            />

            {/* Metrics Dashboard */}
            <div className="metrics-bar">
              <div className="metrics-left">
                <span className="metric-item"><strong>{wordCount}</strong> word{wordCount !== 1 ? "s" : ""}</span>
                <span className="metric-item"><strong>{charCount}</strong> character{charCount !== 1 ? "s" : ""}</span>
                <span className="metric-item">⏱️ <strong>{readingTime}</strong> min read</span>
              </div>
              <div className="metrics-right">
                {draftTime ? (
                  <span className="autosave-status saved">✔ Autosaved at {draftTime}</span>
                ) : (
                  <span className="autosave-status">Draft empty</span>
                )}
              </div>
            </div>

            <button className="publish-btn" onClick={handlePublish}>
              Publish Blog Post
            </button>

            {publishMsg && <div className="publish-msg">{publishMsg}</div>}

          </div>

          {/* RIGHT SIDE - AI CARD */}
          {!isFullscreen && (
            <div className="ai-section">
              <h4>🤖 AI Blog Generator</h4>

              <textarea
                placeholder="Enter prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="ai-prompt"
              />

              <button
                onClick={handleGenerate}
                className="generate-btn"
                disabled={loadingAI}
              >
                {loadingAI ? "Generating..." : "Generate"}
              </button>

              {generatedBlog && (
                <>
                  <div className="ai-output">
                    {generatedBlog}
                  </div>

                  <button
                    onClick={() => setContent(generatedBlog)}
                    className="generate-btn"
                    style={{ marginTop: "10px" }}
                  >
                    Insert Into Editor
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>

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
  );
}
# NeuroBlog 🧠📝

Welcome to **NeuroBlog**, a state-of-the-art, feature-rich blogging platform combining modern web aesthetics, interactive AI features, and powerful server search integrations. Designed for content creators and readers alike, NeuroBlog features smooth glassmorphism, responsive elements, and an interactive AI mascot.

---

## 🚀 Key Features

### 1. Interactive AI Blog Companion — **Zai** 🐼
* **Wake/Sleep States**: Animated sleeping SVG companion that wakes up, blinks, and stretches when you hover your mouse close to it.
* **Alternate Greetings**: Displays randomized greeting prompts in a speech bubble to interact with the user.
* **Organic Animations**: Alternating waving hands, panda-style sleeping rest poses, and staggered floating Zzz particles.

### 2. Rich Text Blogging Editor
* **Quill Integration**: Powerful rich text editor with hover tooltips for toolbar buttons.
* **Canvas Image Cropper**: Detects clicked images inside the editor to open a custom draggable and resizable cropping window.
* **Drag-and-Drop Images**: Reposition images instantly inside text content by dragging them to new paragraphs.
* **Undo & Redo Shortcuts**: Integrated undo/redo buttons in the edit panel.

### 3. YouTube-Style Comments & Replies
* **Collapsible Reply Threads**: Comment threads support nested visual reply structures with expandable toggle buttons.
* **Emoji Quick Bar**: Tap emoji shortcuts to insert expressions instantly.
* **Ownership Verification**: Edit and Delete options are constrained strictly to comment owners.

### 4. Advanced Full-Text Search
* **PostgreSQL Vector Queries**: Uses full-text indexing to fetch matching blogs rapidly.
* **Non-Destructive Sorting**: Matches float smoothly to the top of the feed, while other articles remain below.
* **Waterfall Entrance**: Search results emerge with index-based stagger delay animations.

### 5. Premium Web Design
* **Glassmorphic Panels**: Clean, translucent containers with soft highlights, borders, and translation hover offsets.
* **Cyberpunk Parallax Tilts**: Blog cards tilt dynamically along the X and Y axes on mouse movement.
* **Dynamic Video Background**: Fluid video loop backdrop on the landing page.
* **Dark/Light Mode Theme Toggle**: Instant transition between dark glassmorphism and colorful pastel gradients (pink, purple, and blue tones).
* **Auto-Dismiss Notifications**: Displays recent posts from the last hour, automatically clearing badge counts upon viewing.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, React Router, Vite, Vanilla CSS.
* **Backend**: FastAPI, Python, PostgreSQL, SQLAlchemy.

---

## ⚙️ Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd neuroblog/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the database migrations.
4. Launch the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd neuroblog
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 📧 Contact Information
* **Email**: neuroblog08@gmail.com
* **Phone**: +91-9398142461

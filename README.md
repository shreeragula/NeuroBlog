# NeuroBlog 🧠📝

Welcome to **NeuroBlog**, a state-of-the-art, feature-rich blogging platform combining modern web aesthetics, interactive mascot animations, and powerful server search integrations. Designed for content creators and readers alike, NeuroBlog features smooth glassmorphism, responsive elements, and an interactive screen companion.

---

## 🚀 Key Features

### 1. Interactive Screen Companion — **Zai** 🐼
* **Mascot Mechanics**: Zai is an animated, coordinate-responsive screen companion mascot rendered via inline SVGs.
* **Wake/Sleep States**: Cursor proximity checks wake Zai up from a sleeping pose (accompanied by sleeping Zzz particles) when the mouse moves close.
* **Waving & Blinking Animations**: Programmed head tilts, eye-blinking keyframes, and outward waving paw animations.
* **Speech Bubble Interaction**: Displays alternating greeting dialogues inside a styled left-aligned speech bubble when awake.

### 2. Rich Text Blogging Editor
* **Quill Integration**: Powerful rich text editor with hover tooltips for toolbar buttons.
* **Canvas Image Cropper**: Click any uploaded image to open a custom, resizable cropping modal.
* **Drag-and-Drop Images**: Reposition photos instantly inside text content by dragging them to new paragraphs.
* **Undo & Redo Shortcuts**: Integrated undo/redo buttons in the edit panel.

### 3. Threaded Comments & Replies
* **Collapsible Reply Threads**: Comment threads support nested visual reply structures with expandable toggle buttons.
* **Emoji Quick Bar**: Tap emoji shortcuts to insert expressions instantly.
* **Enter-Key Posting**: Support for submitting comments and replies instantly by hitting the `Enter` key (without shift).
* **Ownership Verification**: Edit and Delete options are constrained strictly to comment owners.

### 4. Advanced Full-Text Search
* **PostgreSQL Vector Queries**: Uses full-text indexing to fetch matching blogs rapidly.
* **Non-Destructive Sorting**: Matches float smoothly to the top of the feed, while other articles remain below.
* **Waterfall Entrance**: Search results emerge with index-based stagger delay animations.

### 5. Premium Web Design
* **Glassmorphic Panels**: Clean, translucent containers with soft highlights, borders, and translation hover offsets.
* **Interactive Parallax Tilts**: Blog cards tilt dynamically along the X and Y axes on mouse movement.
* **Dynamic Video Background**: Fluid video loop backdrop on the landing page.
* **Dark/Light Mode Theme Toggle**: Instant transition between dark glassmorphism and colorful pastel gradients (pink, purple, and blue tones).
* **Auto-Dismiss Notifications**: Displays recent posts from the last hour, automatically clearing badge counts upon viewing.

---

## ⚙️ System Pipeline Flow

The AI Blog Generator flow is structured as follows:

1. **Prompt Input**: The user enters a topic prompt in the editor creation form (`CreateBlog.jsx`).
2. **Gateway Proxy (`app.py`)**: The FastAPI gateway at `localhost:8000` receives the query and forwards it to the dedicated generation service.
3. **Model Server (`llm_model.py`)**: The model server running at `localhost:9000` processes the prompt.
4. **Adapter Inference**: Loads base `EleutherAI/gpt-neo-125M` causal language model weights and merges fine-tuned custom adapter parameters from `fast-blog-llm-final` via the `peft` library.
5. **Decoded Response**: Generates, tokenizes, and decodes the blog text using `transformers` utility functions to autofill the Quill rich-text editor on the frontend.

---

## 📂 Folder Structure

```text
NeuroBlog/
├── README.md                           # Project documentation
└── neuroblog/                          # Main project directory
    ├── index.html                      # Root HTML, sets tab title and logo favicon link
    ├── package.json                    # Frontend node dependencies
    ├── public/                         # Public assets (logo.png, icons.png, robot.png)
    └── src/                            # React application source code
        ├── main.jsx                    # Renders root react node and App routes
        ├── App.jsx                     # Router mappings
        ├── index.css                   # Global glassmorphic stylesheet
        ├── components/                 # Reusable components
        │   ├── Navbar.jsx & .css       # Persistent navbar (Search, Bell, Profile, Theme)
        │   ├── HeroBackground.jsx/.css # Looping video background overlay
        │   └── Zai.jsx & .css          # Waking/Sleeping SVG mascot companion
        └── pages/                      # Page routes
            ├── Main.jsx & .css         # Landing page (Typewriter tagline, contact card)
            ├── Home.jsx & .css         # Feed page (Blogs list, card tilts, search)
            ├── CreateBlog.jsx & .css   # Create page (Quill, image cropper, drag & drop)
            ├── ViewBlog.jsx & .css     # My Blogs page (Grid/List views, comments/replies)
            ├── BlogDetails.jsx & .css  # Post view page (Arrow navigations, centered images)
            ├── Login.jsx & .css        # Sign In form with "Remember me" checkbox
            └── Signup.jsx & .css       # Sign Up registration page
```

---

## 🛠️ Tech Stack & Languages

* **Frontend Languages & Frameworks**: JavaScript (React.js), HTML5, CSS3, Vite
* **Backend Languages & Frameworks**: Python (FastAPI), SQLAlchemy
* **Database**: PostgreSQL

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
4. Launch the server:
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
3. Start the development server:
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

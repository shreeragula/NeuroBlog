import React from "react";
import ReactDOM from "react-dom/client";
import { Quill } from "react-quill-new";
import ImageResize from "quill-image-resize-module-react";
import App from "./App";
import "./index.css";

// Fix for quill-image-resize-module-react window.Quill undefined in Vite
window.Quill = Quill;
Quill.register("modules/imageResize", ImageResize, true);

if (!localStorage.getItem("userEmail")) {
  const email = "thanu123@gmail.com"; // 🔴 TEMP: replace with real email later
  localStorage.setItem("userEmail", email);

  const username = email.split("@")[0];
  localStorage.setItem("username", username);
}

// 🔐 TEMP USER (important)
if (!localStorage.getItem("userId")) {
  localStorage.setItem("userId", "1");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

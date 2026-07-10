import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Main from "./pages/Main";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import CreateBlog from "./pages/CreateBlog";
import Profile from "./pages/Profile";
import ViewBlog from "./pages/ViewBlog";
import BlogDetails from "./pages/BlogDetails";   // ✅ NEW IMPORT

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/feed" element={<Home />} />
        <Route path="/my_blogs" element={<ViewBlog />} />
        <Route path="/create" element={<CreateBlog />} />
        <Route path="/profile" element={<Profile />} />

        {/* ✅ NEW DYNAMIC BLOG ROUTE */}
        <Route path="/blog/:id" element={<BlogDetails />} />
      </Routes>
    </Router>
  );
}

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import BoardManagement from "./pages/BoardManagement";
import GithubCallback from "./components/Auth/GithubCallback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/boards" element={<BoardManagement />} />
        <Route path="/auth/github/callback" element={<GithubCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

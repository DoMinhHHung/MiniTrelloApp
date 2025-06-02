import React, { useState, useRef, useEffect } from "react";

function getInitials(nameOrEmail: string) {
  if (!nameOrEmail) return "";
  const name = nameOrEmail.split("@")[0];
  const parts = name.split(/[ ._-]/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const BoardManagement: React.FC = () => {
  // Lấy tên/email từ localStorage hoặc context
  const userEmail = localStorage.getItem("userEmail") || "User";
  const initials = getInitials(userEmail);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#343a40" }}>
      <div
        style={{
          height: 64,
          background: "#23272b",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          color: "#fff",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32, color: "#e53935", fontWeight: "bold" }}>
            <img src="/logo.png" alt="Logo" style={{ height: 36 }} />
          </div>
          <div
            style={{ fontSize: 24, fontWeight: 600, letterSpacing: 2 }}
          ></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative" }} ref={menuRef}>
            <span
              style={{
                display: "inline-flex",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#e53935",
                color: "#fff",
                fontWeight: "bold",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => setOpen((o) => !o)}
            >
              {initials}
            </span>
            {open && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 44,
                  background: "#fff",
                  color: "#23272b",
                  borderRadius: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  minWidth: 140,
                  zIndex: 10,
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: "calc(100vh - 64px)",
          width: "100vw",
        }}
      >
        <div
          style={{
            width: 240,
            background: "#23272b",
            color: "#fff",
            padding: "32px 0 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              padding: "12px 32px",
              background: "#2d3238",
              borderRadius: 8,
              margin: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 500,
            }}
          >
            <span role="img" aria-label="boards">
              📊
            </span>
            Boards
          </div>
          <div
            style={{
              padding: "12px 32px",
              margin: "0 16px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#b0b8c1",
              fontWeight: 500,
            }}
          >
            <span role="img" aria-label="members">
              👥
            </span>
            All Members
          </div>
        </div>

        {/* Boards content */}
        <div style={{ flex: 1, padding: "48px 32px 0 32px" }}>
          <div
            style={{
              color: "#b0b8c1",
              fontWeight: 600,
              fontSize: 16,
              marginBottom: 24,
              marginLeft: 8,
              letterSpacing: 1,
            }}
          >
            YOUR WORKSPACES
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div
              style={{
                width: 220,
                height: 140,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 18,
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
            >
              My Trello board
            </div>
            <div
              style={{
                width: 220,
                height: 140,
                background: "transparent",
                border: "2px solid #b0b8c1",
                borderRadius: 8,
                color: "#b0b8c1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500,
                fontSize: 18,
                cursor: "pointer",
                transition: "border 0.2s",
              }}
            >
              + Create a new board
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardManagement;

import React, { useState, useRef, useEffect } from "react";
import socket from "../api/socket";
import {
  fetchBoards,
  createBoard,
  deleteBoard,
  updateBoard,
} from "../api/boardApi";

function getInitials(nameOrEmail: string) {
  if (!nameOrEmail) return "";
  const name = nameOrEmail.split("@")[0];
  const parts = name.split(/[ ._-]/).filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const BoardManagement: React.FC = () => {
  const userEmail = localStorage.getItem("userEmail") || "User";
  const initials = getInitials(userEmail);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [boards, setBoards] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchBoards(token)
      .then((res) => setBoards(res.data))
      .catch(() => setBoards([]));
  }, []);

  useEffect(() => {
    socket.on("boardCreated", (data) => {
      setBoards((prev) => [...prev, data]);
    });

    socket.on("boardUpdated", (data) => {
      setBoards((prev) =>
        prev.map((b) => (b.id === data.id ? { ...b, ...data } : b))
      );
    });

    socket.on("boardDeleted", ({ id }) => {
      setBoards((prev) => prev.filter((b) => b.id !== id));
    });

    socket.on("memberInvited", (data) => {});

    socket.on("memberJoined", (data) => {});

    return () => {
      socket.off("boardCreated");
      socket.off("boardUpdated");
      socket.off("boardDeleted");
      socket.off("memberInvited");
      socket.off("memberJoined");
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  const token = localStorage.getItem("token");

  const handleCreateBoard = async () => {
    if (!token || !newName) return;
    await createBoard(token, newName, newDesc);
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
  };

  const handleDeleteBoard = async (id: string) => {
    if (!token) return;
    await deleteBoard(token, id);
    setDeletingId(null);
  };

  const openEdit = (board: any) => {
    setEditingId(board.id);
    setEditName(board.name);
    setEditDesc(board.description || "");
  };

  const handleUpdateBoard = async () => {
    if (!token || !editingId || !editName) return;
    await updateBoard(token, editingId, editName, editDesc);
    setEditingId(null);
    setEditName("");
    setEditDesc("");
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
            {boards.map((board) => (
              <div
                key={board.id}
                style={{
                  width: 240,
                  minHeight: 180,
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                  position: "relative",
                  padding: "20px 20px 48px 20px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    color: "#e53935",
                    fontWeight: 700,
                    fontSize: 20,
                    marginBottom: 8,
                  }}
                >
                  {board.name}
                </div>
                <div
                  style={{
                    color: "#888",
                    fontWeight: 400,
                    fontSize: 15,
                    marginBottom: 16,
                    minHeight: 32,
                  }}
                >
                  {board.description}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 0,
                    right: 0,
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <button
                    style={{
                      background: "#1976d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 16px",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                    onClick={() => openEdit(board)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      background: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "4px 16px",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                    onClick={() => setDeletingId(board.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {showCreate ? (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    padding: 32,
                    minWidth: 320,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{ marginBottom: 16, fontWeight: 600, fontSize: 18 }}
                  >
                    Create New Board
                  </div>
                  <input
                    placeholder="Board name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 8,
                      marginBottom: 12,
                      borderRadius: 4,
                      border: "1px solid #ddd",
                    }}
                  />
                  <input
                    placeholder="Description"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 8,
                      marginBottom: 20,
                      borderRadius: 4,
                      border: "1px solid #ddd",
                    }}
                  />
                  <div>
                    <button
                      onClick={handleCreateBoard}
                      style={{
                        background: "#e53935",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 16px",
                        marginRight: 8,
                        fontWeight: 600,
                      }}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowCreate(false);
                        setNewName("");
                        setNewDesc("");
                      }}
                      style={{
                        background: "#eee",
                        color: "#333",
                        border: "none",
                        borderRadius: 4,
                        padding: "6px 16px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
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
                onClick={() => setShowCreate(true)}
              >
                + Create a new board
              </div>
            )}
          </div>
        </div>
      </div>

      {deletingId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 32,
              minWidth: 300,
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 16 }}>
              Are you sure you want to delete this board?
            </div>
            <button
              onClick={() => handleDeleteBoard(deletingId)}
              style={{
                background: "#e53935",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "6px 16px",
                marginRight: 8,
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setDeletingId(null)}
              style={{
                background: "#eee",
                color: "#333",
                border: "none",
                borderRadius: 4,
                padding: "6px 16px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 32,
              minWidth: 320,
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 18 }}>
              Edit Board
            </div>
            <input
              placeholder="Board name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 12,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            />
            <input
              placeholder="Description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginBottom: 20,
                borderRadius: 4,
                border: "1px solid #ddd",
              }}
            />
            <div>
              <button
                onClick={handleUpdateBoard}
                style={{
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "6px 16px",
                  marginRight: 8,
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                style={{
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  borderRadius: 4,
                  padding: "6px 16px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardManagement;

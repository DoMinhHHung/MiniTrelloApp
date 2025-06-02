import React from "react";
import bg from "../../assets/background.png";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      minWidth: "100vw",
      width: "100vw",
      height: "100vh",
      background: `url(${bg}) center center / cover no-repeat fixed`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 0,
    }}
  >
    <div
      style={{
        background: "rgba(255,255,255,0.97)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
        padding: "48px 56px",
        minWidth: 420,
        maxWidth: 480,
        width: "100%",
        textAlign: "center",
        margin: "40px 0",
        zIndex: 1,
      }}
    >
      <img src="/logo.png" alt="Logo" style={{ width: 72, marginBottom: 32 }} />
      {children}
    </div>
  </div>
);

export default AuthLayout;

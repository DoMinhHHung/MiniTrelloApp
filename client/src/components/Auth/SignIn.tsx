import React, { useState } from "react";
import { signin, githubSignIn } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

const SignIn: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  localStorage.setItem("userEmail", email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await signin(email, code);
      setMessage("Sign in successful!");
      localStorage.setItem("token", res.data.accessToken);
      navigate("/boards");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Error occurred!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: 16 }}>Sign In</h2>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
          border: "1px solid #ddd",
        }}
      />
      <input
        type="text"
        placeholder="Verification code"
        value={code}
        required
        onChange={(e) => setCode(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 16,
          borderRadius: 6,
          border: "1px solid #ddd",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          background: "#e53935",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          marginBottom: 12,
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <div style={{ color: "#e53935", minHeight: 24 }}>{message}</div>
      <div style={{ margin: "16px 0" }}>
        <div style={{ margin: "16px 0", fontWeight: 500, color: "#888" }}>
          or
        </div>
        <button
          type="button"
          onClick={githubSignIn}
          style={{
            width: "100%",
            padding: 10,
            background: "#24292f",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <svg
            height="20"
            width="20"
            viewBox="0 0 16 16"
            fill="white"
            style={{ marginRight: 8 }}
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Sign in with GitHub
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        Don't have an account?{" "}
        <span
          style={{ color: "#e53935", cursor: "pointer" }}
          onClick={onSwitch}
        >
          Sign Up
        </span>
      </div>
    </form>
  );
};

export default SignIn;

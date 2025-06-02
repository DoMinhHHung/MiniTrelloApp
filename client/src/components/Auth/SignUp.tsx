import React, { useState } from "react";
import { signup } from "../../api/authApi";

const SignUp: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await signup(email);
      setMessage(res.data.message || "Check your email for the code!");
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Error occurred!");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: 16 }}>Sign Up</h2>
      <input
        type="email"
        placeholder="Email address"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
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
        {loading ? "Sending..." : "Sign Up"}
      </button>
      <div style={{ color: "#e53935", minHeight: 24 }}>{message}</div>
      <div style={{ marginTop: 16 }}>
        Already have an account?{" "}
        <span
          style={{ color: "#e53935", cursor: "pointer" }}
          onClick={onSwitch}
        >
          Sign In
        </span>
      </div>
    </form>
  );
};

export default SignUp;

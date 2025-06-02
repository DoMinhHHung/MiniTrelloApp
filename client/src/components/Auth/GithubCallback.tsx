import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GithubCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email");
    if (token) {
      localStorage.setItem("token", token);
      if (email) localStorage.setItem("userEmail", email);
      navigate("/boards");
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  return <div>Signing in with GitHub...</div>;
};

export default GithubCallback;

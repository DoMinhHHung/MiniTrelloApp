import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GithubCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/boards");
    } else {
      navigate("/signin");
    }
  }, [location, navigate]);

  return <div>Đang xác thực với GitHub...</div>;
};

export default GithubCallback;

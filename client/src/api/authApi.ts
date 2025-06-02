import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/auth";

export const signup = (email: string) =>
  axios.post(`${API_URL}/signup`, { email });

export const signin = (email: string, verificationCode: string) =>
  axios.post(`${API_URL}/signin`, { email, verificationCode });

export const githubSignIn = () => {
  window.location.href = import.meta.env.VITE_API_URL + "/auth/github";
};

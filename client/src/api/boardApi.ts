import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/boards";

export const fetchBoards = (token: string) =>
  axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createBoard = (token: string, name: string, description: string) =>
  axios.post(
    API_URL,
    { name, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );
export const updateBoard = (
  token: string,
  id: string,
  name: string,
  description: string
) =>
  axios.put(
    `${API_URL}/${id}`,
    { name, description },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const deleteBoard = (token: string, id: string) =>
  axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

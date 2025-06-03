import api from "../services/api";
import type { Board, BoardInvite } from "../types";

export const boardService = {
  createBoard: async (name: string, description: string): Promise<Board> => {
    const response = await api.post<Board>("/boards", { name, description });
    return response.data;
  },

  getBoards: async (): Promise<Board[]> => {
    const response = await api.get<Board[]>("/boards");
    return response.data;
  },

  getBoard: async (id: string): Promise<Board> => {
    const response = await api.get<Board>(`/boards/${id}`);
    return response.data;
  },

  updateBoard: async (
    id: string,
    name: string,
    description: string
  ): Promise<Board> => {
    const response = await api.put<Board>(`/boards/${id}`, {
      name,
      description,
    });
    return response.data;
  },

  deleteBoard: async (id: string): Promise<void> => {
    await api.delete(`/boards/${id}`);
  },

  inviteMember: async (
    boardId: string,
    email: string
  ): Promise<{
    success: boolean;
    member_id: string | null;
    invited: boolean;
  }> => {
    const response = await api.post<{
      success: boolean;
      member_id: string | null;
      invited: boolean;
    }>(`/boards/${boardId}/invite`, { email_member: email });
    return response.data;
  },

  acceptInvite: async (
    boardId: string,
    email: string
  ): Promise<{ success: boolean; joined: boolean }> => {
    const response = await api.post<{ success: boolean; joined: boolean }>(
      `/boards/${boardId}/invite/accept`,
      { email_member: email }
    );
    return response.data;
  },
};

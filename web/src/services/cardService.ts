import api from "../services/api";
import type { Card } from "../types";

export const cardService = {
  getCards: async (boardId: string): Promise<Card[]> => {
    const response = await api.get<Card[]>(`/boards/${boardId}/cards`);
    return response.data;
  },

  createCard: async (
    boardId: string,
    name: string,
    description: string
  ): Promise<Card> => {
    const response = await api.post<Card>(`/boards/${boardId}/cards`, {
      name,
      description,
      createdAt: new Date(),
    });
    return response.data;
  },

  getCard: async (boardId: string, id: string): Promise<Card> => {
    const response = await api.get<Card>(`/boards/${boardId}/cards/${id}`);
    return response.data;
  },

  getCardsByUser: async (boardId: string, userId: string): Promise<Card[]> => {
    const response = await api.get<Card[]>(
      `/boards/${boardId}/cards/user/${userId}`
    );
    return response.data;
  },

  updateCard: async (
    boardId: string,
    id: string,
    data: Partial<Card>
  ): Promise<Card> => {
    const response = await api.put<Card>(
      `/boards/${boardId}/cards/${id}`,
      data
    );
    return response.data;
  },

  deleteCard: async (boardId: string, id: string): Promise<void> => {
    await api.delete(`/boards/${boardId}/cards/${id}`);
  },
};

import api from "../services/api";
import type { Task, TaskStatus } from "../types";

export const taskService = {
  getTasks: async (boardId: string, cardId: string): Promise<Task[]> => {
    const response = await api.get<Task[]>(
      `/boards/${boardId}/cards/${cardId}/tasks`
    );
    return response.data;
  },

  createTask: async (
    boardId: string,
    cardId: string,
    title: string,
    description: string,
    status: TaskStatus
  ): Promise<Task> => {
    const response = await api.post<Task>(
      `/boards/${boardId}/cards/${cardId}/tasks`,
      {
        title,
        description,
        status,
        createdAt: new Date(),
      }
    );
    return response.data;
  },

  getTask: async (
    boardId: string,
    cardId: string,
    taskId: string
  ): Promise<Task> => {
    const response = await api.get<Task>(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}`
    );
    return response.data;
  },

  updateTask: async (
    boardId: string,
    cardId: string,
    taskId: string,
    data: Partial<Task>
  ): Promise<Task> => {
    const response = await api.put<Task>(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}`,
      data
    );
    return response.data;
  },

  deleteTask: async (
    boardId: string,
    cardId: string,
    taskId: string
  ): Promise<void> => {
    await api.delete(`/boards/${boardId}/cards/${cardId}/tasks/${taskId}`);
  },

  assignMember: async (
    boardId: string,
    cardId: string,
    taskId: string,
    memberId: string
  ): Promise<{ taskId: string; memberId: string }> => {
    const response = await api.post<{ taskId: string; memberId: string }>(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign`,
      { memberId }
    );
    return response.data;
  },

  getAssignedMembers: async (
    boardId: string,
    cardId: string,
    taskId: string
  ): Promise<{ taskId: string; memberId: string }[]> => {
    const response = await api.get<{ taskId: string; memberId: string }[]>(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign`
    );
    return response.data;
  },

  removeMemberAssignment: async (
    boardId: string,
    cardId: string,
    taskId: string,
    memberId: string
  ): Promise<void> => {
    await api.delete(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/assign/${memberId}`
    );
  },
};

import api from "../services/api";
import type { GitHubAttachment } from "../types";

export const githubService = {
  attachGithubResource: async (
    boardId: string,
    cardId: string,
    taskId: string,
    type: "pull_request" | "commit" | "issue",
    number?: string,
    sha?: string
  ): Promise<GitHubAttachment> => {
    const response = await api.post<GitHubAttachment>(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`,
      { type, number, sha }
    );
    return response.data;
  },

  getGithubAttachments: async (
    boardId: string,
    cardId: string,
    taskId: string
  ): Promise<GitHubAttachment[]> => {
    const response = await api.get<GitHubAttachment[]>(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments`
    );
    return response.data;
  },

  deleteGithubAttachment: async (
    boardId: string,
    cardId: string,
    taskId: string,
    attachmentId: string
  ): Promise<void> => {
    await api.delete(
      `/boards/${boardId}/cards/${cardId}/tasks/${taskId}/github-attachments/${attachmentId}`
    );
  },
};

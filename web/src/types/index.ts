export interface User {
  id: string;
  email: string;
  githubId?: string;
  githubUsername?: string;
  createdAt: Date;
}

export interface Board {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: string[];
  createdAt: Date;
}

export interface Card {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  members: string[];
  tasks_count: number;
  order?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  ownerId: string;
  cardId?: string;
  order?: number;
}

export type TaskStatus =
  | "icebox"
  | "backlog"
  | "ongoing"
  | "waiting_for_review"
  | "done";

export interface GitHubAttachment {
  attachmentId: string;
  type: "pull_request" | "commit" | "issue";
  number?: string;
  sha?: string;
}

export interface BoardInvite {
  invite_id: string;
  board_owner_id: string;
  member_id?: string;
  email_member: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  message: string;
}

export interface SignupResponse {
  id: string;
  email: string;
  message: string;
}

export interface ApiError {
  error: string;
}

import { io, Socket } from "socket.io-client";
import type { Board, Card, Task } from "../types";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_API_URL as string);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinBoard(boardId: string) {
    if (this.socket) {
      this.socket.emit("joinBoard", boardId);
    }
  }

  onBoardCreated(callback: (board: Board) => void) {
    this.socket?.on("board:created", callback);
  }

  onBoardUpdated(callback: (board: Board) => void) {
    this.socket?.on("board:updated", callback);
  }

  onBoardDeleted(callback: (data: { id: string }) => void) {
    this.socket?.on("board:deleted", callback);
  }

  onCardCreated(callback: (card: Card) => void) {
    this.socket?.on("card:created", callback);
  }

  onCardUpdated(callback: (card: Card) => void) {
    this.socket?.on("card:updated", callback);
  }

  onCardDeleted(callback: (data: { id: string }) => void) {
    this.socket?.on("card:deleted", callback);
  }

  onMemberInvited(
    callback: (data: {
      boardId: string;
      email_member: string;
      member_id: string | null;
    }) => void
  ) {
    if (this.socket) {
      this.socket.on("memberInvited", callback);
    }
  }

  onMemberJoined(
    callback: (data: { boardId: string; userId: string }) => void
  ) {
    if (this.socket) {
      this.socket.on("memberJoined", callback);
    }
  }

  onTaskCreated(callback: (task: Task) => void) {
    this.socket?.on("task:created", callback);
  }

  onTaskUpdated(callback: (task: Task) => void) {
    this.socket?.on("task:updated", callback);
  }

  onTaskDeleted(callback: (data: { cardId: string; taskId: string }) => void) {
    this.socket?.on("task:deleted", callback);
  }
}

export const socketService = new SocketService();

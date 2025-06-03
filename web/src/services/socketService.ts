import { io, Socket } from "socket.io-client";

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

  onBoardCreated(callback: (board: any) => void) {
    if (this.socket) {
      this.socket.on("boardCreated", callback);
    }
  }

  onBoardUpdated(callback: (board: any) => void) {
    if (this.socket) {
      this.socket.on("boardUpdated", callback);
    }
  }

  onBoardDeleted(callback: (data: { id: string }) => void) {
    if (this.socket) {
      this.socket.on("boardDeleted", callback);
    }
  }

  onCardCreated(callback: (card: any) => void) {
    if (this.socket) {
      this.socket.on("cardCreated", callback);
    }
  }

  onCardUpdated(callback: (card: any) => void) {
    if (this.socket) {
      this.socket.on("cardUpdated", callback);
    }
  }

  onCardDeleted(callback: (data: { id: string }) => void) {
    if (this.socket) {
      this.socket.on("cardDeleted", callback);
    }
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
}

export const socketService = new SocketService();

import { io, Socket } from "socket.io-client";

type EscalationPayload = {
  call_id?: string;
  reason?: string;
  score?: number;
};

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }
  const baseUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
  const socketPath = import.meta.env.VITE_SOCKET_PATH || "/ws/alerts/socket.io";
  socket = io(baseUrl, {
    path: socketPath,
    transports: ["websocket"],
    auth: { token },
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function onEscalation(handler: (payload: EscalationPayload) => void): void {
  if (!socket) return;
  socket.on("escalation", handler);
}

export function joinBusinessRoom(businessId: string): void {
  if (!socket) return;
  socket.emit("join_business", { business_id: businessId });
}

export function requestTakeover(callId: string, phoneNumber: string): void {
  if (!socket) return;
  socket.emit("request_takeover", { call_id: callId, phone_number: phoneNumber });
}

import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    console.log('🔌 Initializing WebSocket connection to:', API_URL);
    
    socket = io(API_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: false,
      upgrade: true,
      rememberUpgrade: true,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket?.id);
      console.log('🚀 Transport:', socket?.io?.engine?.transport?.name);
      console.log('🌐 Connected to:', API_URL);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('❌ WebSocket connection error:', error.message);
      console.log('🔄 Will retry connection...');
    });

    socket.on('reconnect', (attemptNumber: number) => {
      console.log('✅ WebSocket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log('🔄 Reconnection attempt', attemptNumber);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket reconnection failed completely');
    });

    // Additional events for debugging
    socket.on('error', (error: Error) => {
      console.error('❌ Socket error:', error);
    });

    socket.io.on('error', (error: Error) => {
      console.error('❌ Socket.IO error:', error);
    });
  }

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 WebSocket disconnected');
  }
}

export default getSocket;

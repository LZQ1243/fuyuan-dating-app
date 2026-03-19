import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useSocket = () => {
  const connect = () => {
    if (!socket) {
      socket = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });

      socket.on('connect', () => {
        console.log('Socket连接成功');
      });

      socket.on('disconnect', () => {
        console.log('Socket断开连接');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket连接错误:', error);
      });
    }

    return socket;
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const getSocket = () => socket;

  const emit = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return {
    connect,
    disconnect,
    getSocket,
    emit,
    on,
    off,
  };
};

export default useSocket;

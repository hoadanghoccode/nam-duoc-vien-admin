import { io } from 'socket.io-client';

// const SOCKET_URL = 'https://xuanloc-api.id.vn/notifications';
const SOCKET_URL = 'http://localhost:9999/api/notifications';

let socket: any = null;

let joinedRoomHandler: any = null;
let notificationHandler: any = null;
let tableUpdateHandler: any = null;

export function connectSocket(token?: string) {
  if (socket && socket.connected) return socket;
  if (socket) socket.disconnect();

  const opts: any = {
    transports: ['websocket'],
    forceNew: true,
  };
  if (token) {
    opts.auth = { token };
  }
  socket = io(SOCKET_URL, opts);

  setupListeners();
  return socket;
}

export function connectSocketAnonymous() {
  return connectSocket(); // không truyền token
}

function setupListeners() {
  socket.on('connect', () => {
    console.log('[SOCKET] Connected!', socket.id);
  });
  socket.on('disconnect', () => {
    console.log('[SOCKET] Disconnected!');
  });
  socket.on('connect_error', (err: any) => {
    console.error('[SOCKET] Connect error:', err);
  });
  socket.on('joined-room', (data: any) => {
    console.log('[SOCKET] joined-room:', data);
    if (typeof joinedRoomHandler === 'function') joinedRoomHandler(data);
  });
  socket.on('notification', (data: any) => {
    console.log('[SOCKET] notification:', data);
    if (typeof notificationHandler === 'function') notificationHandler(data);
  });
  socket.on('table-update', (data: any) => {
    console.log('[SOCKET] table-update:', data);
    if (typeof tableUpdateHandler === 'function') tableUpdateHandler(data);
  });
  socket.onAny((event: any, ...args: any) => {
    if (
      ![
        'connect',
        'disconnect',
        'connect_error',
        'joined-room',
        'notification',
        'table-update',
      ].includes(event)
    ) {
      console.log('[SOCKET] Event:', event, ...args);
    }
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(room: any) {
  if (socket && socket.connected) {
    socket.emit('join-room', { room });
    console.log('[SOCKET] Emit join-room:', room);
  }
}
export function leaveRoom(room: any) {
  if (socket && socket.connected) {
    socket.emit('leave-room', { room });
    console.log('[SOCKET] Emit leave-room:', room);
  }
}
export function listen(event: any, callback: any) {
  if (socket) socket.on(event, callback);
}
export function unlisten(event: any, callback: any) {
  if (socket) socket.off(event, callback);
}
export function emit(event: any, data: any) {
  if (socket && socket.connected) socket.emit(event, data);
}
export function getSocketInstance() {
  return socket;
}
export function setJoinedRoomHandler(fn: any) {
  joinedRoomHandler = fn;
}
export function setNotificationHandler(fn: any) {
  notificationHandler = fn;
}
export function setTableUpdateHandler(fn: any) {
  tableUpdateHandler = fn;
}

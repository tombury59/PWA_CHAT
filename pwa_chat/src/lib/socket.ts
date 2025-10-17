import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://api.tools.gavago.fr";

const socket: Socket = io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: false,
    path: "/socketio",
});

export default socket;

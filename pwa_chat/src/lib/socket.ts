import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://api.tools.gavago.fr/socketio", {
    transports: ["websocket"],
    autoConnect: false,
});

export default socket;

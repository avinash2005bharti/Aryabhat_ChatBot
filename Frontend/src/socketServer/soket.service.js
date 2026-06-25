import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Backend URL from environment

const socket = io(BACKEND_URL, {
  withCredentials: true,
  autoConnect: true,
});

export default socket;
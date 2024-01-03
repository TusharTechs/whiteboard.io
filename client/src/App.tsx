import React from "react";
import Whiteboard from "./components/Whiteboard";
import { io } from "socket.io-client";
import useAuth from "./hooks/useAuth";
import Public from "./components/Public";
const socket = io("http://localhost:4000");

const App: React.FC = () => {
  // const isLogin = useAuth();
  // return isLogin ? <Whiteboard socket={socket} /> : <Public />
  return (
    <div>
      <Whiteboard socket={socket} />
    </div>
  );
};

export default App;

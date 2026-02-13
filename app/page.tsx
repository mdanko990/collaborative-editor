"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";


export default function Home() {
  const [input, setInput] = useState("")
  const socketRef = useRef<Socket | null>(null);
  
  useEffect(() => {
    const init = async () => {
      const socket = io("http://localhost:3000");
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected:", socket.id);
      });

      socket.on("update-input", (msg: string) => {
        setInput(msg);
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);
  
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    console.log("Emitting:", value);
    socketRef.current?.emit("input-change", value);
  };

  return <div>
      <input
      placeholder="type text"
      value={input}
      // onInput={onChangeHandler}
      onChange={onChangeHandler}
      />
      <div>{input}</div>
    </div>
}

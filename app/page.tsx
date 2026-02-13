"use client";

import { Input } from "@heroui/input";
import { Avatar, AvatarGroup, Chip, Tooltip } from "@heroui/react";
import { FocusEventHandler, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const [editor, setEditor] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [me, setMe] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const socket = io("http://localhost:3000");
      socketRef.current = socket;

      socket.on("connect", () => {
        socketRef.current?.emit("add-user", socket.id);
        setMe(socket.id ?? "");
      });

      socket.on("update-input", (msg: string) => {
        setInput(msg);
      });

      socket.on("update-editor", (id) => {
        setEditor(id);
        if (id) setIsOpen(true);
        if (!id) setIsOpen(false);
      });

      socket.on("users-list", (list: string[]) => {
        setUsers(list);
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
    socketRef.current?.emit("input-change", value);
  };

  const onFocusHandler = (e: any) => {
    setEditor(socketRef.current?.id!);
    socketRef.current?.emit("input-focus", socketRef.current?.id!);
  };

  const onBlurHandler = (e: any) => {
    setEditor("");
    socketRef.current?.emit("input-focus", "");
  };

  return (
    <div className="flex flex-col gap-3 p-10">
      <AvatarGroup isBordered>
        {users.map((u) => (
          <Avatar
            name={u}
            color={
              me === u ? "primary" : editor === u ? "secondary" : "default"
            }
          />
        ))}
      </AvatarGroup>
      {editor != me && editor && (
        <div className="flex w-full justify-end">
          <Chip size="sm" color="secondary">
            {editor}
          </Chip>
        </div>
      )}
      <Input
        placeholder="type text"
        value={input}
        onFocus={onFocusHandler}
        onBlur={onBlurHandler}
        onChange={onChangeHandler}
        variant="bordered"
      />
    </div>
  );
}

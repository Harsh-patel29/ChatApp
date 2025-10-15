"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Search,
  MoreVertical,
  ArrowLeft,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getConversations, getMessages } from "@/apis/conversation.api";
import { useWebSocket } from "@/hooks/websockets";
import { useSession } from "@/lib/client";

interface conversations {
  id: string;
  name: string | null;
  isGroup: boolean;
  avatar: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  participants: participants[];
}

interface participants {
  id: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: string;
  leftAt: string | null;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
  user: Friend;
}

interface Friend {
  Status: Status;
  bio?: string | null;
  createdAt: string;
  email: string;
  emailVerified: boolean;
  id: string;
  image?: string;
  lastseen: string;
  name: string;
  password?: string | null;
  updatedAt: string;
}

enum MessageType {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
}

enum ParticipantRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  FILE = "FILE",
  SYSTEM = "SYSTEM",
}

enum Status {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  AWAY = "AWAY",
  BUSY = "BUSY",
}

interface nextId {
  nextCursor: string;
}

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<conversations | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [conversation, setConversation] = useState<conversations[] | []>([]);
  const [nextId, setNextId] = useState<nextId | null>(null);
  const [ConvNextId, setConvNextId] = useState<nextId | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [ConvLoading, setConvLoading] = useState(false);
  const [ConvhasMore, setConvHasMore] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [friendStatus, setFriendStatus] = useState<{
    [userId: string]: "online" | "offline";
  }>({});
  const [typingStatus, setTypingStatus] = useState<{
    [userId: string]: boolean;
  }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { emit, isConnected, off, on, socket } = useWebSocket();
  const { data } = useSession();

  const getConv = useCallback(async () => {
    if (ConvLoading || !setConvHasMore) return;
    setConvLoading(true);

    try {
      const res = await getConversations(
        ConvNextId ? ConvNextId?.nextCursor : null
      );

      const newConversations = res?.data?.allConversation || [];
      setConversation((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const uniqueNewConversations = newConversations.filter(
          (conv: conversations) => !existingIds.has(conv.id)
        );
        return [...prev, ...uniqueNewConversations];
      });
      setConvNextId(res?.data);
      setConvHasMore(Boolean(res?.data?.nextCursor));
    } catch (error) {
      console.log("Error Fetching conversations", error);
    } finally {
      setConvLoading(false);
    }
  }, [ConvLoading, ConvhasMore, ConvNextId]);

  const userId = data?.user.id;

  const getMessage = useCallback(
    async (convId: string) => {
      if (loading || !hasMore) return;
      setLoading(true);

      try {
        const res = await getMessages(
          nextId ? nextId?.nextCursor : null,
          convId
        );
        const newMessages = res?.data?.allMessages || [];
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNewMessages = newMessages.filter(
            (message: any) => !existingIds.has(message.id)
          );
          return [...prev, ...uniqueNewMessages];
        });

        setNextId(res?.data);
        setHasMore(Boolean(res?.data?.nextCursor));
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, nextId]
  );

  useEffect(() => {
    getConv();
  }, []);

  const friendIds = conversation.flatMap((conv) =>
    conv.participants.map((f) => f.userId)
  );

  const handleStatus = () => {
    socket?.emit("addfriend", { friendIds, userId });
  };

  const handleIsTyping = ({ recieverId }: { recieverId: string }) => {
    setTypingStatus((prev) => ({ ...prev, [recieverId]: true }));

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus((prev) => ({ ...prev, [recieverId]: false }));
    }, 2000);
  };

  useEffect(() => {
    handleStatus();
  }, [friendIds]);

  useEffect(() => {
    if (!socket) return;

    const handleUserOnline = ({ userId }: { userId: string }) => {
      setFriendStatus((prev) => ({ ...prev, [userId]: "online" }));
    };

    const handleUserOffline = ({ userId }: { userId: string }) => {
      setFriendStatus((prev) => ({ ...prev, [userId]: "offline" }));
    };

    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("user:typing", handleIsTyping);

    return () => {
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("user:typing", handleIsTyping);
    };
  }, [socket]);

  const handleSendMessage = ({
    conversationId,
    senderId,
    content,
    messageType,
  }: {
    conversationId: string;
    senderId: string;
    content: string;
    messageType: MessageType;
  }) => {
    socket?.emit("newMessage", {
      conversationId,
      senderId,
      content,
      messageType,
    });
    setMessageInput("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Selected files:", files);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border bg-secondary/50 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-primary bg-clip-text text-transparent">
              ChatApp
            </h1>
          </div>
          <div className=" text-xl  text-primary font-bold">
            Welcome, {data?.user.name}
          </div>
          <Link href="/friend">
            <Button variant="hero" size="md" className="cursor-pointer mr-4">
              Add Freinds
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-border bg-secondary/30 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-input"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 max-h-[92%]">
            <div className="p-2">
              {conversation.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 rounded-lg mb-2 text-left transition-all hover:bg-muted/50 ${
                    selectedChat?.id === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar Section */}
                    {conv.participants.map((participant) => {
                      const frd = participant.user;
                      if (!frd) return null;

                      return (
                        <div
                          key={frd.id}
                          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0"
                        >
                          {frd.image ? (
                            <Avatar className="w-12 h-12 rounded-full overflow-hidden border-0 p-0">
                              <AvatarFallback>
                                {frd.name.charAt(0)}
                              </AvatarFallback>
                              <AvatarImage
                                src={frd.image}
                                alt={frd.name}
                                className="w-full h-full object-cover"
                              />
                            </Avatar>
                          ) : (
                            frd.name.charAt(0)
                          )}
                        </div>
                      );
                    })}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {conv.name ||
                            conv.participants[0]?.user?.name ||
                            "Unknown"}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {/* {conv.lastMessageTime || ""} */}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {/* {conv.lastMessagePreview || ""} */}
                        </p>
                        {/* Example Unread Badge */}
                        {/* {conv.unread && (
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full ml-2">
                  {conv.unread}
                </span>
              )} */}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div key={selectedChat.id}>
                <div className="p-4 border-b border-border bg-secondary/30 flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {selectedChat.participants[0].user.image ? (
                        <Avatar className="w-12 h-12 rounded-full overflow-hidden border-0 p-0">
                          <AvatarFallback>
                            {selectedChat.participants[0]?.user.name.charAt(0)}
                          </AvatarFallback>
                          <AvatarImage
                            src={selectedChat.participants[0]?.user.image}
                            alt={selectedChat.participants[0]?.user.image}
                            className="w-full h-full object-cover"
                          />
                        </Avatar>
                      ) : (
                        selectedChat.participants[0]?.user.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold">
                        {selectedChat.participants[0].user.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        {selectedChat &&
                          (typingStatus[userId!] ? (
                            <p className="ml-1 text-green-500">Typing...</p>
                          ) : (
                            <>
                              {friendStatus[
                                selectedChat.participants[0].user.id
                              ] === "online" ? (
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-1" />
                                  <p>ONLINE</p>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-gray-400 inline-block mr-1" />
                                  <p>OFFLINE</p>
                                </div>
                              )}
                            </>
                          ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4 h-[200px]">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {/* {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isOwn ? "justify-end" : "justify-start"
                      } animate-fade-in`}
                    >
                      <div
                        className={`flex gap-3 max-w-[70%] ${
                          message.isOwn ? "flex-row-reverse" : ""
                        }`}
                      >
                        {!message.isOwn && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs flex-shrink-0">
                            {message.sender.charAt(0)}
                          </div>
                        )}
                        <div>
                          {!message.isOwn && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {message.sender}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              message.isOwn
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-card text-card-foreground rounded-bl-sm shadow-subtle"
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <p
                            className={`text-xs text-muted-foreground mt-1 ${
                              message.isOwn ? "text-right" : ""
                            }`}
                          >
                            {message.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))} */}
                </div>
              </ScrollArea>

              <div className="p-4 min-h-10 mt-3  border-t border-border  bg-secondary/30">
                <div className="flex gap-2 justify-center items-center max-w-4xl mx-auto">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      if (socket && e.target.value.length > 0) {
                        socket.emit("user:typing", {
                          recieverId: selectedChat.participants[0].user.id,
                        });
                      }
                    }}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      handleSendMessage({
                        content: messageInput,
                        conversationId: selectedChat.id,
                        messageType: MessageType.TEXT,
                        senderId: data?.user.id!,
                      })
                    }
                    className="flex-1 bg-input"
                  />
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    title="Attach files"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="hero"
                    onClick={() => {
                      handleSendMessage({
                        content: messageInput,
                        conversationId: selectedChat.id,
                        messageType: MessageType.TEXT,
                        senderId: data?.user.id!,
                      });
                    }}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 animate-fade-in">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Welcome to ChatApp
                  </h2>
                  <p className="text-muted-foreground">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

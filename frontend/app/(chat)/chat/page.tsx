"use client";

import React, {
  UIEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getConversations, getUserMessages } from "@/apis/conversation.api";
import { useWebSocket } from "@/hooks/websockets";
import { useSession } from "@/lib/client";
import { Textarea } from "@/components/ui/textarea";

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

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  replyToId: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  timeStamp?: number;
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
  const [messages, setMessages] = useState<Message[] | []>([]);
  const [nextId, setNextId] = useState<nextId | null>(null);
  const [ConvNextId, setConvNextId] = useState<nextId | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [ConvLoading, setConvLoading] = useState(false);
  const [ConvhasMore, setConvHasMore] = useState(true);
  const [friendStatus, setFriendStatus] = useState<{
    [userId: string]: "online" | "offline";
  }>({});
  const [typingStatus, setTypingStatus] = useState<{
    [userId: string]: boolean;
  }>({});
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loadingOlder, setloadingOlder] = useState(false);

  const { emit, isConnected, off, on, socket } = useWebSocket();
  const { data } = useSession();
  const userId = data?.user.id;

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

  const getUserMessage = useCallback(
    async (conversationId: string) => {
      if (loading || !hasMore) return;
      setLoading(true);
      try {
        const res = await getUserMessages(
          nextId ? nextId?.nextCursor : null,
          conversationId
        );

        const newMessages = res?.data?.allMessages || [];
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNewMessages = newMessages.filter(
            (message: Message) => !existingIds.has(message.id)
          );
          return [...uniqueNewMessages, ...prev];
        });

        setNextId(res?.data);
        setHasMore(Boolean(res?.data?.nextCursor));
      } catch (error) {
        console.error("Error fetching conversations", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, nextId, selectedChat?.id]
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
    const tempMessage: Message = {
      id: crypto.randomUUID(),
      conversationId,
      senderId,
      content,
      messageType,
      replyToId: null,
      isEdited: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    socket?.emit("newMessage", {
      id: tempMessage.id,
      conversationId,
      senderId,
      content,
      messageType,
      createdAt: Date.now(),
    });
    const scrollEl = messagesEndRef.current?.parentElement as HTMLDivElement; // The scroll container

    if (!scrollEl) return;

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    setMessageInput("");
  };

  const isAtBottom = (el: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = el;
    return Math.abs(scrollHeight - (scrollTop + clientHeight)) < 1;
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message: Message) => {
      if (message.conversationId === selectedChat?.id) {
        setMessages((prev) => {
          return [...prev, message];
        });
        const scrollEl = messagesEndRef.current
          ?.parentElement as HTMLDivElement;

        if (!scrollEl) return;
        if (isAtBottom(scrollEl)) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
      }
    };

    socket.on("messageReceived", handleIncomingMessage);

    return () => {
      socket.off("messageReceived", handleIncomingMessage);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    if (!socket || !selectedChat?.id) return;

    socket.emit("joinConversation", { conversationId: selectedChat.id });

    return () => {
      socket.emit("leaveConversation", { conversationId: selectedChat.id });
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    if (selectedChat?.id) {
      getUserMessage(selectedChat.id);
    }
  }, [selectedChat]);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [selectedChat?.id]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollEL = event.target as HTMLDivElement;

    if (isInitialLoad.current) return;

    if (scrollEL.scrollTop <= 100 && !loading && hasMore) {
      (async () => {
        await getUserMessage(selectedChat?.id!);
        setloadingOlder(true);
      })();
    }
  };

  useEffect(() => {
    if (messages.length > 0 && isInitialLoad.current) {
      const scrollEl = messagesEndRef.current?.parentElement as HTMLDivElement;
      if (!scrollEl) return;

      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      scrollEl.scrollTop = scrollEl.scrollHeight;
      isInitialLoad.current = false;
    }
  }, [messages]);

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
                  onClick={() => {
                    setSelectedChat(conv);
                    setMessages([]);
                    setNextId(null);
                    setHasMore(true);
                  }}
                  className={`w-full p-4 rounded-lg mb-2 text-left transition-all hover:bg-muted/50 ${
                    selectedChat?.id === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
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
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {/* Loading indicator for conversations */}
              {ConvLoading && (
                <div className="text-center py-4 text-muted-foreground">
                  Loading more conversations...
                </div>
              )}
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
                </div>
              </div>

              <ScrollArea
                id="Message-scrollbar"
                className="flex-1 p-4 h-[200px]"
                onScrollCapture={handleScroll}
              >
                <div className="space-y-2 mx-10 overflow-y-auto h-full">
                  {/* Loading indicator for older messages */}
                  {loading && (
                    <div className="text-center py-2 text-muted-foreground text-sm">
                      Loading older messages...
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === userId
                          ? "justify-end"
                          : "justify-start"
                      } animate-fade-in`}
                    >
                      <div
                        className={`flex gap-2 max-w-[65%] ${
                          message.senderId === userId ? "flex-row-reverse" : ""
                        }`}
                      >
                        {message.senderId !== userId && (
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs flex-shrink-0">
                            {selectedChat.participants[0].user.image ? (
                              <img
                                src={selectedChat.participants[0].user.image}
                                className="w-7 h-7 rounded-full"
                                alt={selectedChat.participants[0].user.name}
                              />
                            ) : (
                              selectedChat.participants[0].user.name
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>
                        )}
                        <div>
                          {message.senderId !== userId && (
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {selectedChat.participants[0].user.name}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-3 py-1.5 leading-snug ${
                              message.senderId === userId
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-card text-card-foreground rounded-bl-sm shadow-subtle"
                            }`}
                          >
                            <p className="text-sm break-words max-w-80">
                              {message.content}
                            </p>
                          </div>
                          <p
                            className={`text-[10px] text-muted-foreground mt-0.5 ${
                              message.senderId === userId ? "text-right" : ""
                            }`}
                          >
                            {new Date(
                              message.updatedAt || message?.timeStamp!
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef}></div>
                  <ScrollBar orientation="vertical" />
                </div>
              </ScrollArea>

              <div className="p-4 min-h-10 mt-3  border-t border-border  bg-secondary/30">
                <div className="flex gap-2 justify-center items-center max-w-4xl mx-auto">
                  <Textarea
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
                      messageInput.trim() != "" &&
                      handleSendMessage({
                        content: messageInput,
                        conversationId: selectedChat.id,
                        messageType: MessageType.TEXT,
                        senderId: data?.user.id!,
                      })
                    }
                    className="flex max-h-20 bg-input"
                  />
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    className="hidden"
                  />

                  <Button
                    variant="hero"
                    disabled={!messageInput}
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

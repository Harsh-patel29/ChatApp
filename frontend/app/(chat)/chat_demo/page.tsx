"use client";
import { useState } from "react";
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

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
}

interface Conversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
}

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [messageInput, setMessageInput] = useState("");

  const conversations: Conversation[] = [
    {
      id: 1,
      name: "Alice Johnson",
      lastMessage: "See you tomorrow!",
      time: "2m",
      unread: 2,
    },
    {
      id: 2,
      name: "Team Project",
      lastMessage: "Great work everyone",
      time: "15m",
    },
    {
      id: 3,
      name: "Bob Smith",
      lastMessage: "Thanks for the update",
      time: "1h",
    },
    {
      id: 4,
      name: "Design Team",
      lastMessage: "New mockups ready",
      time: "2h",
      unread: 5,
    },
    {
      id: 5,
      name: "Carol White",
      lastMessage: "Let's schedule a meeting",
      time: "3h",
    },
  ];

  const messages: Message[] = [
    {
      id: 1,
      sender: "Alice Johnson",
      content: "Hey! How are you doing?",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "You",
      content: "I'm doing great! How about you?",
      time: "10:32 AM",
      isOwn: true,
    },
    {
      id: 3,
      sender: "Alice Johnson",
      content: "Pretty good! Working on the new project.",
      time: "10:33 AM",
      isOwn: false,
    },
    {
      id: 4,
      sender: "You",
      content: "That sounds exciting! Need any help?",
      time: "10:35 AM",
      isOwn: true,
    },
    {
      id: 5,
      sender: "Alice Johnson",
      content: "Actually yes, could you review the docs?",
      time: "10:36 AM",
      isOwn: false,
    },
    {
      id: 6,
      sender: "You",
      content: "Of course! Send them over.",
      time: "10:37 AM",
      isOwn: true,
    },
    {
      id: 7,
      sender: "Alice Johnson",
      content: "Will do! See you tomorrow!",
      time: "10:38 AM",
      isOwn: false,
    },
  ];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput("");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Selected files:", files);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
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

          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`w-full p-4 rounded-lg mb-2 text-left transition-all hover:bg-muted/50 ${
                    selectedChat === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                      {conv.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{conv.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {conv.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.unread && (
                          <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full ml-2">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div>
            <div className="p-4 border-b border-border bg-secondary/30 flex justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  A
                </div>
                <div>
                  <h2 className="font-semibold">Alice Johnson</h2>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 max-h-[77%]">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
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
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-secondary/30">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
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
                onClick={() => document.getElementById("file-upload")?.click()}
                title="Attach files"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button variant="hero" onClick={handleSendMessage}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

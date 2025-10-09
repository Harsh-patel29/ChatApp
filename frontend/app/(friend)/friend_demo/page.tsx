"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  UserPlus,
  UserCheck,
  ArrowLeft,
  Users,
  UserMinus,
} from "lucide-react";

const mockUsers = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alexj",
    avatar: "",
    followers: 234,
    following: false,
    mutual: 12,
  },
  {
    id: 2,
    name: "Sarah Kim",
    username: "sarahk",
    avatar: "",
    followers: 567,
    following: false,
    mutual: 8,
  },
  {
    id: 3,
    name: "Mike Chen",
    username: "mikec",
    avatar: "",
    followers: 891,
    following: true,
    mutual: 15,
  },
  {
    id: 4,
    name: "Emma Wilson",
    username: "emmaw",
    avatar: "",
    followers: 432,
    following: false,
    mutual: 5,
  },
  {
    id: 5,
    name: "David Lee",
    username: "davidl",
    avatar: "",
    followers: 678,
    following: true,
    mutual: 20,
  },
  {
    id: 6,
    name: "Lisa Brown",
    username: "lisab",
    avatar: "",
    followers: 345,
    following: false,
    mutual: 3,
  },
  {
    id: 7,
    name: "James Miller",
    username: "jamesm",
    avatar: "",
    followers: 789,
    following: false,
    mutual: 18,
  },
  {
    id: 8,
    name: "Sofia Garcia",
    username: "sofiag",
    avatar: "",
    followers: 923,
    following: true,
    mutual: 25,
  },
];

const mockFollowing = mockUsers.filter((u) => u.following);

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(
    mockUsers.filter((user) => !user.following)
  );
  const [following, setFollowing] = useState(mockFollowing);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFreinds = following.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({
    user,
  }: {
    user: (typeof mockUsers)[0];
    showMutual?: boolean;
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-background truncate">
                {user.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.followers} followers
            </p>
          </div>

          {users.includes(user) ? (
            <Button variant="hero" size="sm" className="shrink-0">
              <UserPlus />
              Add
            </Button>
          ) : (
            <Button>
              <UserMinus />
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/chat_demo">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-primary bg-clip-text text-transparent">
                Discover Friends
              </h1>
              <p className="text-sm text-muted-foreground">
                Connect with people
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discover" className="cursor-pointer">
              Discover
            </TabsTrigger>
            <TabsTrigger value="friends" className="cursor-pointer">
              Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested for you</CardTitle>
              </CardHeader>
            </Card>
            {filteredUsers?.map((user) => (
              <UserCard key={user.id} user={user} showMutual />
            ))}
          </TabsContent>

          <TabsContent value="friends" className="space-y-4">
            {filteredFreinds?.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            {following.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You're do not have any Friends yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;

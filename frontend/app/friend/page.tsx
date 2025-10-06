"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserCheck, ArrowLeft, Users } from "lucide-react";

// Mock data - replace with your database
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
const mockFollowers = [
  {
    id: 10,
    name: "Tom Anderson",
    username: "toma",
    avatar: "",
    followers: 456,
    following: true,
    mutual: 10,
  },
  {
    id: 11,
    name: "Nina Patel",
    username: "ninap",
    avatar: "",
    followers: 678,
    following: false,
    mutual: 5,
  },
  {
    id: 12,
    name: "Chris Taylor",
    username: "christ",
    avatar: "",
    followers: 234,
    following: true,
    mutual: 8,
  },
];

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [following, setFollowing] = useState(mockFollowing);
  const [followers] = useState(mockFollowers);

  const handleFollowToggle = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, following: !user.following } : user
      )
    );
    setFollowing((prev) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return prev;
      return user.following
        ? prev.filter((u) => u.id !== userId)
        : [...prev, user];
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({
    user,
    showMutual = false,
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
              {showMutual && user.mutual > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {user.mutual}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.followers} followers
            </p>
          </div>

          <Button
            variant={user.following ? "outline" : "hero"}
            size="sm"
            onClick={() => handleFollowToggle(user.id)}
            className="shrink-0"
          >
            {user.following ? (
              <>
                <UserCheck className="w-4 h-4 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-1" />
                Follow
              </>
            )}
          </Button>
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
              {/* TODO: Change the Link */}
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <ArrowLeft className="w-5 h-5 " />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-primary">
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
        {/* Search Bar */}
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

        {/* Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discover" className="cursor-pointer">
              Discover
            </TabsTrigger>
            <TabsTrigger value="following" className="cursor-pointer">
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className="cursor-pointer">
              Followers ({followers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested for you</CardTitle>
              </CardHeader>
            </Card>
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} showMutual />
            ))}
          </TabsContent>

          <TabsContent value="following" className="space-y-4">
            {following.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            {following.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    You're not following anyone yet
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="followers" className="space-y-4">
            {followers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;

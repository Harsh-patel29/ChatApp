"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, ArrowLeft, Users, UserMinus } from "lucide-react";
import {
  getUsers,
  addFriend,
  getFriend,
  removeFriend,
} from "@/apis/friend.api";
import { toast } from "sonner";

interface User {
  Status: string;
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

interface nextId {
  nextCursor: string;
}

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [nextUserId, setNextUserId] = useState<nextId | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await getUsers(nextUserId ? nextUserId?.nextCursor : null);
      const newUsers = res?.data?.allUsers || [];

      setUsers((prev) => {
        const existingIds = new Set(prev.map((user) => user.id));
        const uniqueNewUsers = newUsers.filter(
          (user: User) => !existingIds.has(user.id)
        );
        return [...prev, ...uniqueNewUsers];
      });

      setNextUserId(res?.data);
      setHasMore(Boolean(res?.data?.nextCursor));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextUserId]);

  const getFriendList = async () => {
    const result = await getFriend();
    setFriends(result.data);
  };

  useEffect(() => {
    fetchUsers();
    getFriendList();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bottomPosition = document.documentElement.offsetHeight + 120;
      if (scrollPosition >= bottomPosition && !loading && hasMore) {
        fetchUsers();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, nextUserId]);

  const handleAddFriendToggle = async (userId: string) => {
    const user = users.filter((u) => u.id !== userId);
    const a = await addFriend({ IdtoAdd: userId });
    if (a.success === true) {
      toast.success("Freind Added Successfully");
      setUsers(user);
      setNextUserId(user[0]?.id as unknown as nextId);
      await fetchUsers();
      await getFriendList();
    }
  };

  const handleRemoveFreindToggle = async (userId: string) => {
    const result = await removeFriend({ IdtobeRemoved: userId });
    if (result.success === true) {
      toast.success(result.message);
      setUsers([]);
      setNextUserId(null);
      setHasMore(true);
      setLoading(false);
      await getFriendList();
      const res = await getUsers(null);
      const newUsers = res?.data?.allUsers;

      setUsers(newUsers);
      setNextUserId(res?.data);
      setHasMore(Boolean(res?.data?.nextCursor));
    }
  };

  const filteredUsers = users?.filter((user: User) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends?.filter((friend: User) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({ user }: { user: User; showMutual?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-background truncate">
                {user.name}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">@{user.name}</p>
          </div>

          {!friends.includes(user) ? (
            <Button
              size="sm"
              onClick={async () => await handleAddFriendToggle(user.id)}
              className="shrink-0 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Add
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={async () => await handleRemoveFreindToggle(user.id)}
              className="shrink-0 cursor-pointer"
            >
              <UserMinus className="w-4 h-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/chat">
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
              {/* ({following.length}) */}
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
            {filteredFriends?.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
            {friends.length === 0 && (
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

"use client";

import { PlaylistsSection } from "@/components/profile/playlists-section";
import { SubscriptionManagement } from "@/components/profile/subscription-management";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { Camera, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WatchingHistory } from "./profile/watch-history";
import { format } from "date-fns";
import { Playlist } from "@/lib/generated/prisma";

// Mock user data
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/placeholder.svg?height=120&width=120",
  joinDate: "January 2023",
  subscription: {
    plan: "Premium",
    status: "active",
    nextBilling: "2024-02-15",
    price: "$12.99/month",
  },
  stats: {
    watchTime: "156 hours",
    showsWatched: 23,
    moviesWatched: 45,
    favoriteGenre: "Drama",
  },
};

export const ProfileOverview = ({ playlists }: { playlists: Playlist[] }) => {
  const user = useUser();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="max-w-6xl mx-auto mt-12 space-y-6">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"></div>
        <CardContent className="relative -mt-12 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-muted shadow-xl">
                <AvatarImage
                  src={
                    user?.image ||
                    `https://avatar.vercel.sh/${user?.firstName}.png`
                  }
                  alt={user?.firstName}
                />
                <AvatarFallback className="text-2xl font-bold">
                  {user?.firstName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-lg"
                onClick={() => {
                  // Handle avatar upload
                }}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change profile picture</span>
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
                <Badge variant="secondary" className="w-fit">
                  {mockUser.subscription.plan} Member
                </Badge>
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground">
                Member since{" "}
                {user?.createdAt
                  ? format(user.createdAt, "MMM yyyy")
                  : "Unknown"}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 w-full md:w-auto">
              <Link href="/settings">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none bg-transparent"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Watching */}
          <WatchingHistory />

          {/* Playlists Section */}
          <PlaylistsSection
            playlistsData={playlists}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <SubscriptionManagement
            subscription={mockUser.subscription}
            compact
          />
        </div>
      </div>
    </div>
  );
};

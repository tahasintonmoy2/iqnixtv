"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { Comment, Like, Thread, User } from "@/lib/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import Link from "next/link";

interface ThreadCardProps {
  thread: Thread & {
    user: User;
    comments: Comment[];
    likes: Like[];
  };
  forumId: string;
}

export const ThreadCard = ({ thread, forumId }: ThreadCardProps) => {
  const isMobile = useMobile();

  return (
    <div>
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={thread.user.image || "/placeholder.svg"} />
              <AvatarFallback>{thread.user.firstName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* {discussion.isPinned && <Crown className="h-4 w-4 text-yellow-500" />} */}
                <Link
                  href={`/forum/${forumId}/thread/${thread.id}`}
                  className="font-semibold hover:text-primary transition-colors"
                >
                  {isMobile ? (
                    <p className="truncate text-xl line-clamp-2">
                      {thread.title.length > 40
                        ? `${thread.title.slice(0, 40)}...`
                        : thread.title}
                    </p>
                  ) : (
                    <p className="truncate text-xl line-clamp-2">
                      {thread.title.length > 105
                        ? `${thread.title.slice(0, 105)}...`
                        : thread.title}
                    </p>
                  )}
                  {isMobile ? (
                    <p className="truncate text-sm text-muted-foreground line-clamp-2">
                      {thread.content.length > 40
                        ? `${thread.content.slice(0, 40)}...`
                        : thread.content}
                    </p>
                  ) : (
                    <p className="truncate text-sm text-muted-foreground line-clamp-2">
                      {thread.content.length > 105
                        ? `${thread.content.slice(0, 105)}...`
                        : thread.content}
                    </p>
                  )}
                </Link>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <span>
                  by {thread.user.firstName} {thread.user.lastName}
                </span>
                <span className="mx-2 w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                <span>{formatDistanceToNow(thread.createdAt)} ago</span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{thread.comments.length}</span>
                </div>
                {/*<div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{discussion.views}</span> 
                          </div>*/}
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{thread.likes.length}</span>
                </div>
              </div>

              <div className="flex gap-1 flex-wrap">
                {/* {thread?.tags?.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))} */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

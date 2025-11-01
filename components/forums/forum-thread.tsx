"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Comment,
  Forum,
  Like,
  Reply,
  Tags,
  Thread,
  User,
} from "@/lib/generated/prisma";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Heart,
  Info,
  ReplyIcon,
  Share2,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface ForumThreadProps {
  threadId: string;
  thread: Thread & {
    forum: Forum;
    comments: (Comment & {
      user: User;
      replies: Reply[];
      likes: Like[]; // Add likes to the interface
    })[];
    tags: Tags[];
    user: User;
    likes: Like[]; // Add likes to the interface
  };
}

// Mock thread data
const threadData = {
  id: 1,
  title: "Queen of Tears - Episode 16 Discussion (Finale)",
  category: "K-Dramas",
  author: "DramaQueen",
  avatar: "/placeholder.svg?height=40&width=40",
  content: `Just finished watching the finale and I'm absolutely emotional! The way they wrapped up the story was perfect. Kim Soo-hyun and Kim Ji-won's chemistry was incredible throughout the entire series.

What did everyone think about the ending? I loved how they showed their life together after all the struggles. The cinematography in the final scenes was breathtaking too.

Also, can we talk about that OST? It perfectly captured every emotion in this episode. I'm going to miss this drama so much! 😭`,
  replies: 234,
  views: 1567,
  likes: 89,
  time: "1 hour ago",
  isPinned: true,
  tags: ["finale", "romance", "kim-soo-hyun"],
  hasLiked: false,
};

const replies = [
  {
    id: 1,
    author: "KDramaFan2024",
    avatar: "/placeholder.svg?height=32&width=32",
    content:
      "I completely agree! The finale was everything I hoped for and more. The emotional depth they brought to the characters was incredible.",
    time: "45 minutes ago",
    likes: 23,
    hasLiked: false,
  },
  {
    id: 2,
    author: "RomanceLover",
    avatar: "/placeholder.svg?height=32&width=32",
    content:
      "That final scene had me in tears! The way they looked at each other... pure magic. This drama will definitely be in my top 10 of all time.",
    time: "30 minutes ago",
    likes: 18,
    hasLiked: true,
  },
  {
    id: 3,
    author: "DramaReviewer",
    avatar: "/placeholder.svg?height=32&width=32",
    content:
      "The cinematography was absolutely stunning. Every frame looked like a painting. The director really outdid themselves with this finale.",
    time: "15 minutes ago",
    likes: 12,
    hasLiked: false,
  },
];

export function ForumThread({ thread }: ForumThreadProps) {
  const [newReply, setNewReply] = useState("");
  const [threadLiked, setThreadLiked] = useState(threadData.hasLiked);
  const [threadLikes, setThreadLikes] = useState(threadData.likes);
  const [replyLikes, setReplyLikes] = useState(
    replies.reduce(
      (acc, reply) => ({ ...acc, [reply.id]: reply.likes }),
      {} as Record<string, string>
    )
  );
  const [replyLiked, setReplyLiked] = useState(
    replies.reduce(
      (acc, reply) => ({ ...acc, [reply.id]: reply.hasLiked }),
      {} as Record<string, boolean>
    )
  );

  const handleThreadLike = () => {
    setThreadLiked(!threadLiked);
    setThreadLikes((prev) => (threadLiked ? prev - 1 : prev + 1));
    if (threadLiked) {
      toast.success("Like removed");
    } else {
      toast.success("Post liked");
    }
  };

  const handleReplyLike = (replyId: string) => {
    const wasLiked = replyLiked[replyId];
    setReplyLiked((prev) => ({ ...prev, [replyId]: !wasLiked }));
  };

  const handleReplySubmit = () => {
    if (!newReply.trim()) return;

    toast.success("Reply posted!");
    setNewReply("");
  };

  return (
    <div className="mx-auto px-4 py-6 space-y-6 pt-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link href={`/forum/${thread.forum.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4" />
              Back to Thread
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Thread */}
      <div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Thread Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={thread.user.image || "/placeholder.svg"} />
                  <AvatarFallback>{thread.user.firstName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* {threadData.isPinned && <Crown className="h-5 w-5 text-yellow-500" />} */}
                    <h1 className="text-2xl font-bold">{thread.title}</h1>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="truncate">
                      {thread.forum.name}
                    </Badge>
                    {thread.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>
                      by {thread.user.firstName} {thread.user.lastName}
                    </span>
                    <span className="mx-2 w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                    <span>{formatDistanceToNow(thread.createdAt)} ago</span>
                    <span className="mx-2 w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                    <span>{threadData.views} views</span>
                  </div>
                </div>
              </div>

              {/* Thread Content */}
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-foreground">
                  {thread.content}
                </p>
              </div>

              {/* Thread Actions */}
              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant={threadLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleThreadLike}
                >
                  <Heart
                    className={`size-4 ${threadLiked ? "fill-current" : ""}`}
                  />
                  {threadLikes}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="size-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reply Form */}
      <div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add a Comment</h3>
          <Textarea
            placeholder="Share your thoughts..."
            className="resize-none"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={handleReplySubmit} disabled={!newReply.trim()}>
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Comments ({thread.comments.length})
        </h3>

        {thread.comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="bg-secondary rounded-full px-4 py-4 mb-2">
              <Info className="size-6" />
            </div>
            <h1>No comments yet</h1>
            <p className="text-sm text-muted-foreground">
              Be the first to comment
            </p>
          </div>
        ) : (
          <div>
            {thread.comments.map((comment) => (
              <div key={comment.id}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.user.image || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-xs">
                          {comment.user.firstName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {comment.user.firstName} {comment.user.lastName}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(comment.createdAt)} ago
                          </span>
                        </div>

                        <p className="text-sm">{comment.content}</p>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReplyLike(comment.id)}
                            className="h-8 px-2"
                          >
                            <ThumbsUp
                              className={`h-3 w-3 mr-1 ${replyLiked[comment.id] ? "fill-current text-primary" : ""}`}
                            />
                            {replyLikes[comment.id]}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          >
                            <ReplyIcon className="h-3 w-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

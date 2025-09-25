"use client";

import { useMobile } from "@/hooks/use-mobile";
import { Reply, User } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { ReplyAction } from "./reply-action";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";

interface ReplyCardProps {
  replies: (Reply & {
    user: User;
  })[];
  user: User;
  commentId: string;
  isReplying?: boolean; // Add this prop
  onCancelReply: () => void; // Add this prop
}

export const ReplyCard = ({
  replies,
  commentId,
  user,
  isReplying = false,
  onCancelReply,
}: ReplyCardProps) => {
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const isMobile = useMobile();
  const queryClient = useQueryClient();
  const router = useRouter();

  const createReply = useMutation({
    mutationFn: async (content: string) => {
      const response = await axios.post("/api/comment/reply", {
        commentId,
        content,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", commentId] });
      setReplyContent("");
      router.refresh();
      onCancelReply();

      toast.success("Reply added");
    },
    onError: (error) => {
      console.error("Error creating reply:", error);
      toast.error("Failed to add reply");
    },
  });

  const handleSubmit = () => {
    if (!replyContent.trim()) return;

    createReply.mutate(replyContent);
  };

  const handleCancel = () => {
    setReplyContent("");
    if (onCancelReply) onCancelReply();
  };

  const handleEditCancel = () => {
    setEditingReplyId(null);
    setEditingContent("");
  };

  return (
    <div>
      {/* Show reply form when isReplying is true */}
      {isReplying && commentId && (
        <div className="ml-8 mt-4">
          <div className="flex items-start">
            <Avatar>
              <AvatarImage
                src={
                  user?.image ||
                  `https://avatar.vercel.sh/${user?.firstName}.png`
                }
              />
              <AvatarFallback>{user?.firstName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <Textarea
              value={replyContent}
              disabled={createReply.isPending}
              onChange={(e) => setReplyContent(e.target.value)}
              className={cn(
                "ml-3 mb-3 resize-none lg:w-[50rem] w-[23rem]",
                isMobile && "w-[18rem]"
              )}
              placeholder="Write a reply..."
            />
          </div>
          <div className="flex items-end justify-end mr-1 gap-x-2">
            <Button variant="secondary" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              disabled={!replyContent.trim() || createReply.isPending}
              onClick={handleSubmit}
            >
              {createReply.isPending ? <div className="loader"></div> : "Reply"}
            </Button>
          </div>
        </div>
      )}

      {/*  */}
      {replies.length > 0 && (
        <div className="my-8 ml-8">
          {replies.map((reply) => (
            <React.Fragment key={reply.id}>
              <Separator className="my-3" />
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <Avatar>
                    <AvatarImage
                      src={
                        user?.image ||
                        `https://avatar.vercel.sh/${user?.firstName}.png`
                      }
                    />
                    <AvatarFallback>
                      {user?.firstName.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex items-center">
                    <h1 className="text-lg">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <span className="mx-2 w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                    <h2 className="text-muted-foreground">
                      {formatDistanceToNow(reply.createdAt)}
                    </h2>
                  </div>
                </div>
                <div>
                  {user?.id === reply.userId && (
                    <ReplyAction
                      setIsEdit={() => {
                        setEditingReplyId(reply.id);
                        setEditingContent(reply.content);
                      }}
                      replyId={reply.id}
                    />
                  )}
                </div>
              </div>

              {/* Show edit form or reply content */}
              {editingReplyId === reply.id ? (
                <div>
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className={cn(
                      "ml-10 mb-3 resize-none lg:w-[48rem] w-[23rem]",
                      isMobile && "w-[18rem]"
                    )}
                  />
                  <div className="flex items-end justify-end mr-4 gap-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // TODO: Implement reply update logic
                        console.log("Updating reply:", editingContent);
                      }}
                      disabled={!editingContent.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                reply.content.length > 0 && (
                  <h2 className="ml-11">{reply.content}</h2>
                )
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

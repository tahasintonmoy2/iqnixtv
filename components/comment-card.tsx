"use client";

import { useAuthModal } from "@/hooks/use-auth-modal";
import { useDeleteCommentModal } from "@/hooks/use-delete-comment-modal";
import { useMobile } from "@/hooks/use-mobile";
import { useUser } from "@/hooks/use-user";
import { Comment, Like, Reply, User } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CommentAction } from "./comment-action";
import { DeleteCommentModal } from "./models/delete-comment-modal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { ReplyCard } from "./reply-card";
import { ReplyAction } from "./reply-action";
import { useDeleteReplyModal } from "@/hooks/use-delete-reply-modal";
import { DeleteReplyModal } from "./models/delete-reply-modal";

interface CommentCardProps {
  comments: (Comment & {
    replies: (Reply & {
      user: User;
      likes: Like[]; // Add likes to the interface
    })[];
    user: User;
    likes: Like[]; // Add likes to the interface
  })[];
  episodeId: string;
}

export const CommentCard = ({ comments, episodeId }: CommentCardProps) => {
  const user = useUser();
  const { onOpen } = useAuthModal();
  const { onClose: onCloseDelete, selectedCommentId } = useDeleteCommentModal();
  const isMobile = useMobile();
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpand, setIsExpand] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null
  );
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const { onClose: onCloseReply, selectedReplyId } = useDeleteReplyModal();
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const router = useRouter();
  const [editingContent, setEditingContent] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [editingReplyContent, setEditingReplyContent] = useState("");
  const queryClient = useQueryClient();

  const createComment = useMutation({
    mutationFn: async (content: string) => {
      const response = await axios.post("/api/comment", {
        episodeId,
        content,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", episodeId] });
      setCommentContent("");
      setIsFocused(false);
      router.refresh();

      toast.success("Comment added");
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      toast.error("Failed to add comment");
    },
  });

  const updateComment = useMutation({
    mutationFn: async ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => {
      const response = await axios.patch("/api/comment", {
        content,
        commentId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", episodeId] });
      setEditingCommentId(null);
      setEditingContent("");

      toast.success("Comment updated");
    },
    onError: (error) => {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    },
  });

  const updateReply = useMutation({
    mutationFn: async ({
      replyId,
      content,
    }: {
      replyId: string;
      content: string;
    }) => {
      const response = await axios.patch("/api/comment/reply", {
        replyId,
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      setEditingReplyId(null);
      setEditingReplyContent("");

      toast.success("Reply updated");
    },
    onError: (error) => {
      console.error("Error updating reply:", error);
      toast.error("Failed to update reply");
    },
  });

  const likeComment = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await axios.post("/api/comment/reaction", {
        commentId,
      });
      return response.data;
    },
    onSuccess: (data, commentId) => {
      queryClient.invalidateQueries({ queryKey: ["comments", episodeId] });

      if (data.action === "added") {
        setLikedComments((prev) => new Set(prev).add(commentId));
        toast.success("Comment liked");
      } else {
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
        toast.success("Like removed");
      }
    },
    onError: (error) => {
      console.error("Error liking comment:", error);
      toast.error("Failed to like comment");
    },
  });

  const likeReply = useMutation({
    mutationFn: async (replyId: string) => {
      const response = await axios.post("/api/comment/reply/reaction", {
        replyId,
      });
      return response.data;
    },
    onSuccess: (data, commentId) => {
      queryClient.invalidateQueries({ queryKey: ["replies", episodeId] });

      if (data.action === "added") {
        setLikedComments((prev) => new Set(prev).add(commentId));
        toast.success("Reply liked");
      } else {
        setLikedComments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
        toast.success("Like removed");
      }
    },
    onError: (error) => {
      console.error("Error liking reply:", error);
      toast.error("Failed to like reply");
    },
  });

  const handleLikeReply = (replyId: string) => {
    if (!user) return;
    likeReply.mutate(replyId);
  };

  const onDelete = async () => {
    if (!selectedCommentId) return;

    try {
      setIsLoading(true);
      await axios.delete(`/api/comment`, {
        data: { commentId: selectedCommentId },
      });
      toast.success("Comment deleted");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete comment");
    } finally {
      setIsLoading(false);
      onCloseDelete();
    }
  };

  const onDeleteReply = async () => {
    if (!selectedReplyId) return;

    try {
      setIsLoadingReply(true);
      await axios.delete(`/api/comment/reply`, {
        data: { replyId: selectedReplyId },
      });
      toast.success("Reply deleted");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete reply");
    } finally {
      setIsLoadingReply(false);
      onCloseReply();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleCancel = () => {
    setIsFocused(false);
    setCommentContent("");
  };

  const handleSubmit = () => {
    if (!commentContent.trim) return;

    createComment.mutate(commentContent);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim() || !editingCommentId) return;

    updateComment.mutate({
      commentId: editingCommentId,
      content: editingContent,
    });
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleEditReply = (reply: Reply) => {
    setEditingReplyId(reply.id);
    setEditingReplyContent(reply.content);
  };

  const handleSaveEditReply = () => {
    if (!editingReplyContent.trim() || !editingReplyId) return;

    updateReply.mutate({
      replyId: editingReplyId,
      content: editingReplyContent,
    });
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyContent("");
  };

  const handleLikeComment = (commentId: string) => {
    if (!user) return;
    likeComment.mutate(commentId);
  };

  const episodeComment = comments.filter(
    commnent => commnent.episodeId === episodeId
  )

  return (
    <div>
      <DeleteReplyModal isLoading={isLoadingReply} onConfirm={onDeleteReply} />
      <DeleteCommentModal onConfirm={onDelete} isLoading={isLoading} />
      <h1 className="flex items-center gap-x-2 text-2xl font-bold mb-6">
        <p>{episodeComment.length}</p>
        Comments
      </h1>
      <div>
        {user ? (
          <div className="flex flex-col items-end">
            <div className="flex items-start">
              <Avatar>
                <AvatarImage
                  src={
                    user?.image ||
                    `https://avatar.vercel.sh/${user?.firstName}.png`
                  }
                />
              </Avatar>
              <Textarea
                className={cn(
                  "ml-2 mb-3 resize-none lg:w-[51rem] w-[24rem]",
                  isMobile && "w-[19rem]"
                )}
                value={commentContent}
                disabled={createComment.isPending}
                onChange={(e) => setCommentContent(e.target.value)}
                onFocus={handleFocus}
                placeholder="Say something"
              />
            </div>
            {isFocused && (
              <motion.div
                className="flex items-center gap-x-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  disabled={!commentContent.trim() || createComment.isPending}
                  onClick={handleSubmit}
                >
                  {createComment.isPending ? "Submiting..." : "Submit"}
                </Button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex items-start mb-3">
            <Avatar className="bg-secondary">
              <UserCircle className="size-8 text-slate-300" />
            </Avatar>
            <div className="flex items-center justify-center ml-2 border px-4 py-6 rounded-md lg:w-[54rem]">
              <h1 className="mr-2">To post comment</h1>
              <Button onClick={onOpen}>Login</Button>
            </div>
          </div>
        )}
      </div>
      {episodeComment.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <h1>No comments</h1>
          <p className="text-sm text-muted-foreground">Be the first comment</p>
        </div>
      ) : (
        <div className="my-12 ml-2">
          {episodeComment.map((comment) => (
            <React.Fragment key={comment.id}>
              <Separator className="my-3" />
              <div key={comment.id} className="flex flex-col my-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <Avatar>
                      <AvatarImage
                        src={
                          comment.user?.image ||
                          `https://avatar.vercel.sh/${comment.user?.firstName}.png`
                        }
                      />
                    </Avatar>
                    <div className="ml-3 flex items-center">
                      <h1 className="text-lg">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </h1>
                      <span className="mx-2 w-1 h-1 rounded-full bg-muted-foreground inline-block" />
                      <h2 className="text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt)}
                      </h2>
                    </div>
                  </div>
                  <div>
                    {user?.id === comment.userId && (
                      <CommentAction
                        setIsEdit={() => handleEditComment(comment)}
                        commentId={comment.id}
                      />
                    )}
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  <div>
                    <Textarea
                      value={editingContent}
                      disabled={updateComment.isPending}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className={cn(
                        "ml-10 mb-3 resize-none lg:w-[50rem] w-[23rem]",
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
                        onClick={handleSaveEdit}
                        disabled={
                          !editingContent.trim() || updateComment.isPending
                        }
                      >
                        {updateComment.isPending ? (
                          <div className="flex items-center">
                            <div className="loader"></div>
                            <p>Saving...</p>
                          </div>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <h2 className="ml-11">{comment.content}</h2>
                )}
                <div className="ml-8 mt-2 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment.id)}
                    disabled={likeComment.isPending}
                  >
                    <ThumbsUp
                      className={cn(
                        "size-4",
                        (comment.likes?.some(
                          (like) => like.userId === user?.id
                        ) ||
                          likedComments.has(comment.id)) &&
                          "fill-current dark:text-white text-black"
                      )}
                    />
                    <span className="ml-1">{comment.likes?.length} Like</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setReplyingToCommentId(comment.id)}
                  >
                    <MessageSquare className="size-4" />
                    Reply
                  </Button>
                </div>
                {replyingToCommentId === comment.id ? (
                  <ReplyCard
                    replies={comment.replies}
                    commentId={comment.id}
                    user={comment.user}
                    isReplying={true}
                    onCancelReply={() => setReplyingToCommentId(null)}
                  />
                ) : (
                  comment.replies.length > 0 && (
                    <div className="ml-10 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpand((curr) => !curr)}
                      >
                        {isExpand ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}

                        <div className="flex items-center gap-x-1">
                          <h2>{comment.replies.length}</h2>
                          <h2>
                            {comment.replies.length > 1 ? "Replies" : "Reply"}
                          </h2>
                        </div>
                      </Button>
                      {isExpand && (
                        <div className="mt-4">
                          {comment.replies.map((reply) => (
                            <React.Fragment key={reply.id}>
                              <Separator className="my-3" />
                              <div className="flex flex-col">
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
                                        setIsEdit={() => handleEditReply(reply)}
                                        replyId={reply.id}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                              {editingReplyId === reply.id ? (
                                <div>
                                  <Textarea
                                    value={editingReplyContent}
                                    disabled={updateReply.isPending}
                                    onChange={(e) =>
                                      setEditingReplyContent(e.target.value)
                                    }
                                    className={cn(
                                      "ml-10 mb-3 resize-none lg:w-[48rem] w-[23rem]",
                                      isMobile && "w-[14rem]"
                                    )}
                                  />
                                  <div className="flex items-end justify-end mr-4 gap-x-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={handleCancelEditReply}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={handleSaveEditReply}
                                      disabled={
                                        !editingReplyContent.trim() ||
                                        updateReply.isPending
                                      }
                                    >
                                      {updateReply.isPending ? (
                                        <div className="flex items-center">
                                          <div className="loader"></div>
                                          <p>Saving...</p>
                                        </div>
                                      ) : (
                                        "Save"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="ml-10">
                                  <h1>{reply.content}</h1>
                                </div>
                              )}
                              <div className="ml-8 mt-2 flex items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikeReply(reply.id)}
                                  disabled={likeReply.isPending}
                                  className={cn(
                                    "transition-colors",
                                    reply.likes?.some(
                                      (like) => like.userId === user?.id
                                    ) &&
                                      "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                  )}
                                >
                                  <ThumbsUp
                                    className={cn(
                                      "size-4",
                                      reply.likes?.some(
                                        (like) => like.userId === user?.id
                                      ) && "fill-current"
                                    )}
                                  />
                                  <span className="ml-1">
                                    {reply.likes?.length || 0} Like
                                  </span>
                                </Button>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

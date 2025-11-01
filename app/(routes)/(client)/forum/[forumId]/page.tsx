import { CreateDiscussionModal } from "@/components/models/create-discussion-model";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EmptyThreadsState } from "../_components/empty-threads-state";
import { ForumHeaderAction } from "../_components/forum-header-action";
import { ThreadCard } from "../_components/thread-card";
import { ActionMenu } from "../_components/action-menu";

interface CategoryPageProps {
  params: Promise<{
    forumId: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { forumId } = await params;

  const forum = await db.forum.findUnique({
    where: {
      id: forumId,
    },
  });

  if (!forum?.id) {
    return {
      title: "Forum Not Found - Community Forum",
    };
  }

  return {
    title: `${forum.name} - Community Forum`,
  };
}

const ForumIdPage = async ({ params }: CategoryPageProps) => {
  const { forumId } = await params;

  const forum = await db.forum.findUnique({
    where: {
      id: forumId,
    },
    include: {
      threads: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!forum?.id) {
    return (
      <div className="mx-auto px-4 py-6 pt-72">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link href="/forum">
            <Button>Back to Forum</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <CreateDiscussionModal forumId={forumId} />
      <div className="mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4 mt-14">
          <div className="flex justify-between items-center gap-2">
            <Link href="/forum">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forum
              </Button>
            </Link>
            <ActionMenu forumId={forumId} />
          </div>

          <div className="text-center space-y-2">
            <div className="flex flex-col items-center justify-center">
              <Avatar className="size-12">
                <AvatarImage src={forum.image || ""} />
                <AvatarFallback className="text-2xl">
                  {forum.name[0]}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-3xl md:text-4xl font-bold mt-2">
                {forum.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <ForumHeaderAction />

        {/* Discussions */}
        {forum.threads.length === 0 ? (
          <EmptyThreadsState />
        ) : (
          <div className="space-y-4">
            {forum.threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} forumId={forumId} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ForumIdPage;

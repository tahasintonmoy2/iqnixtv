import type { Metadata } from "next";
import { ForumThread } from "@/components/forums/forum-thread";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  // In a real app, you'd fetch the thread data here
  return {
    title: "Discussion Thread - Community Forum",
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;
  const thread = await db.thread.findUnique({
    where: {
      id: threadId,
    },
    include: {
      user: true,
      comments: {
        include: {
          user: true,
          likes: true,
          replies: true,
        },
      },
      tags: true,
      likes: true,
      forum: true,
    },
  });

  if (!thread?.id) {
    return (
      <div className="mx-auto px-4 py-6 pt-72">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">Thread Not Found</h1>
          <p className="mb-4 text-muted-foreground">
            The discussion thread you are looking for does not exist.
          </p>
          <Link href="/forum/thread">
            <Button>Back to Thread</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ForumThread threadId={threadId} thread={thread} />;
}

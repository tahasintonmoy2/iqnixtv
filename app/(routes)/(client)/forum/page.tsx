import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { Users } from "lucide-react";
import Link from "next/link";
import { HeaderAction } from "./_components/header-action";

const ForumPage = async () => {
  const forums = await db.forum.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      threads: true,
      user: true
    }
  });

  return (
    <div className="pt-28 mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Community Forum
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow drama enthusiasts, share your thoughts, and
          discover your next favorite show
        </p>
      </div>

      {/* Search and Actions */}
      <HeaderAction />

      <div className="gap-8">
        {/* Main Categories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4 grid lg:grid-cols-2 grid-cols-1 gap-x-4">
            {forums.map((forum) => (
              <div key={forum.id}>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="size-12">
                        <AvatarImage src={forum.image || ""} />
                        <AvatarFallback className="text-2xl">{forum.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/forum/${forum.id}`}
                              className="text-xl font-semibold hover:text-primary transition-colors"
                            >
                              {forum.name}
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {forum.threads.length} threads
                              </span>
                            </div>
                          </div>
                          {/* {category.lastPost && (
                            <div className="flex items-center gap-2 text-sm">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={
                                    category.lastPost.avatar ||
                                    "/placeholder.svg"
                                  }
                                />
                                <AvatarFallback>
                                  {category.lastPost.author[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-right">
                                <div className="font-medium">
                                  {category.lastPost.title}
                                </div>
                                <div className="text-muted-foreground">
                                  by {category.lastPost.author} •{" "}
                                  {category.lastPost.time}
                                </div>
                              </div>
                            </div>
                          )} */}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
